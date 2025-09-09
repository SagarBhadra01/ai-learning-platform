const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const { jsonrepair } = require('jsonrepair');
const Course = require('./models/Course'); // Import the Mongoose model

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the .env file.");
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();

// --- API Routes ---
app.get('/', (req, res) => {
    res.send("Backend server is running!");
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

app.post('/api/generate-course', async (req, res) => {
    const { topic, level } = req.body;
    console.log(`POST /api/generate-course route hit with topic: "${topic}", level: "${level}"`);

    if (!topic || !level) {
        return res.status(400).json({ message: 'Topic and level are required.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'API Key not configured on server.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
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
      - At least 5 chapters.
      - Each chapter must have at least 3 lessons.
      - Each lesson must have at least 150 words of HTML content.
      - Each lesson must include a quiz with 3-5 multiple-choice questions.
      - The imageUrl should be a relevant royalty-free image link from Unsplash, using the course title as the search keyword.
    `;

    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        let rawText = response.data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json|```/g, '').trim();

        let generatedCourseData;
        try {
            generatedCourseData = JSON.parse(rawText);
        } catch (err) {
            console.warn("Invalid JSON, attempting repair...");
            generatedCourseData = JSON.parse(jsonrepair(rawText));
        }

        // --- Normalize Gemini output to match schema ---
        generatedCourseData.chapters.forEach(chapter => {
            chapter.lessons.forEach(lesson => {
                if (lesson.quiz) {
                    // Ensure quiz.title exists
                    if (!lesson.quiz.title) {
                        lesson.quiz.title = `Quiz for ${lesson.title}`;
                    }

                    // Map 'answer' to 'correctAnswer'
                    lesson.quiz.questions.forEach(q => {
                        if (q.answer && !q.correctAnswer) {
                            q.correctAnswer = q.answer;
                        }
                    });
                }
            });
        });

        // ✅ Ensure imageUrl is always set
        if (!generatedCourseData.imageUrl) {
            const searchQuery = encodeURIComponent(generatedCourseData.title || topic);
            generatedCourseData.imageUrl = `https://source.unsplash.com/800x600/?${searchQuery}`;
        }

        const newCourse = new Course(generatedCourseData);
        const savedCourse = await newCourse.save();
        
        console.log(`Course "${savedCourse.title}" saved to database.`);
        res.status(201).json(savedCourse);

    } catch (error) {
        const errorMessage = error.response ? error.response.data.error.message : error.message;
        console.error("Error in course generation/saving:", errorMessage);
        res.status(500).json({ message: 'Failed to generate and save course.' });
    }
});

// AI Tutor Chatbot
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'API Key not configured on server.' });
    }
    
    const systemInstruction = { parts: [{ text: "You are LearnSphere Tutor, a friendly and encouraging AI assistant..." }] };
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const contents = [...(history || []), { role: 'user', parts: [{ text: message }] }];

    try {
        const response = await axios.post(API_URL, { contents, systemInstruction });
        const chatResponse = response.data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: chatResponse });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.error.message : error.message;
        console.error("Error with Gemini Chat API:", errorMessage);
        res.status(500).json({ message: 'Failed to get a response from the AI tutor.' });
    }
});

app.use((req, res) => {
    res.status(404).send({ message: `Route ${req.originalUrl} not found.` });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));