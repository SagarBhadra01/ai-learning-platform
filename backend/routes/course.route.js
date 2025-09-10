const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { jsonrepair } = require("jsonrepair");
const Course = require("../models/course"); // Import the Mongoose model
const {
  GoogleGenAI,
  Type,
  Chat,
  GenerateContentResponse,
} = require("@google/genai");
const router = express.Router();
require("dotenv").config();
const courseGenerationSchema = require("../schema/courseGenSchema");

router.get("/courses", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId query parameter is required." });
    }
    const courses = await Course.find({ ownerId: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

router.post("/generate-course", async (req, res) => {
  const { topic, level, userId } = req.body;
  console.log(
    `POST /api/generate-course route hit with topic: "${topic}", level: "${level}", userId: "${userId}"`
  );

  if (!topic || !level || !userId) {
    return res
      .status(400)
      .json({ message: "Topic, level, and userId are required." });
  }
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ message: "API Key not configured on server." });
  }
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `
      You are an expert instructional designer. A user wants a course on the topic: "${topic}" at a "${level}" level.
      Generate a comprehensive, structured course plan tailored to that difficulty level. Add quizzes to each lesson and include a relevant royalty-free image URL based on the specific ${topic}.
      The output MUST be a single, valid JSON object and nothing else.

      The JSON object must have the following structure:
      {
        "title": "Course Title",
        "description": "A short, engaging description of the course.",
        "level": "${level}",
        "imageUrl": "A royalty-free image URL relevant to the course topic (use Unsplash or similar, based on the course title)",
        "chapters": [
          {
            "title": "Chapter 1 Title",
            "lessons": [
              {
                "title": "Lesson 1.1 Title",
                "content": "The educational content for this lesson in detailed HTML format with headings, paragraphs, and lists.",
                "xp": 10,
                "quiz": {
                  "title": "Quiz title",
                  "questions": [
                    {
                      "question": "Sample question?",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "correctAnswer": "Option A"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }

      Requirements:
      - At least 5+ chapters.
      - Each chapter must have at least 3+ lessons.
      - Each lesson must have at least 200+ words of HTML content.
      - Each lesson must include a quiz with 3-5 multiple-choice questions.
      - The imageUrl should be a relevant royalty-free image link from Unsplash, using the course title as the search keyword.
    `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: courseGenerationSchema,
      },
    });

    let rawText = response.text;
    console.log("Raw response from Gemini:", rawText.substring(0, 500) + "...");

    // Clean up the response text more thoroughly
    rawText = rawText.replace(/```json|```/g, "").trim();
    rawText = rawText.replace(/^\s*[\r\n]/gm, ""); // Remove empty lines
    rawText = rawText.replace(/,\s*}/g, "}"); // Remove trailing commas before }
    rawText = rawText.replace(/,\s*]/g, "]"); // Remove trailing commas before ]

    let generatedCourseData;
    try {
      generatedCourseData = JSON.parse(rawText);
    } catch (err) {
      console.warn("Invalid JSON, attempting repair...", err.message);
      const errorPos = parseInt(err.message.match(/position (\d+)/)?.[1]) || 0;
      console.log(
        "Problematic JSON around position:",
        rawText.substring(Math.max(0, errorPos - 100), errorPos + 100)
      );

      try {
        const repairedJson = jsonrepair(rawText);
        generatedCourseData = JSON.parse(repairedJson);
      } catch (repairErr) {
        console.error("JSON repair also failed:", repairErr.message);
        console.log("Failed JSON snippet:", rawText.substring(0, 1000));
        return res.status(500).json({
          message:
            "AI generated malformed course data. Please try again with a different topic or level.",
          details: "JSON parsing failed even after repair attempts",
        });
      }
    }

    // --- Normalize Gemini output to match schema ---
    // Validate that the generated course data has the required structure
    if (
      !generatedCourseData ||
      !generatedCourseData.chapters ||
      !Array.isArray(generatedCourseData.chapters)
    ) {
      console.error("Invalid course data structure:", generatedCourseData);
      return res.status(500).json({
        message: "Generated course data is malformed. Please try again.",
      });
    }

    generatedCourseData.chapters.forEach((chapter) => {
      if (!chapter.lessons || !Array.isArray(chapter.lessons)) {
        console.error("Invalid chapter structure:", chapter);
        return;
      }

      chapter.lessons.forEach((lesson) => {
        if (
          lesson.quiz &&
          lesson.quiz.questions &&
          Array.isArray(lesson.quiz.questions)
        ) {
          // Ensure quiz.title exists
          if (!lesson.quiz.title) {
            lesson.quiz.title = `Quiz for ${lesson.title}`;
          }

          // Map 'answer' to 'correctAnswer'
          lesson.quiz.questions.forEach((q) => {
            if (q.answer && !q.correctAnswer) {
              q.correctAnswer = q.answer;
            }
          });
        }
      });
    });

    // ✅ Ensure imageUrl is always set
    if (!generatedCourseData.imageUrl) {
      const searchQuery = encodeURIComponent(
        generatedCourseData.title || topic
      );
      generatedCourseData.imageUrl = `https://source.unsplash.com/800x600/?${searchQuery}`;
    }

    // Add ownerId to the course data
    generatedCourseData.ownerId = userId;

    const newCourse = new Course(generatedCourseData);
    const savedCourse = await newCourse.save();

    console.log(`Course "${savedCourse.title}" saved to database.`);
    res.status(201).json(savedCourse);
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.error.message
      : error.message;
    console.error("Error in course generation/saving:", errorMessage);
    res.status(500).json({ message: "Failed to generate and save course." });
  }
});

router.delete("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId query parameter is required." });
    }

    // Find and delete the course only if it belongs to the user
    const deletedCourse = await Course.findOneAndDelete({
      _id: courseId,
      ownerId: userId,
    });

    if (!deletedCourse) {
      return res
        .status(404)
        .json({ message: "Course not found or not authorized to delete." });
    }

    res.status(200).json({ message: "Course deleted successfully.", courseId });
  } catch (error) {
    console.error("Error deleting course:", error.message);
    res.status(500).json({ message: "Failed to delete course." });
  }
});

module.exports = router;
