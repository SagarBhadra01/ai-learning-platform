const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const { jsonrepair } = require('jsonrepair');
const Course = require('./models/Course'); // Import the Mongoose model
const XP = require('./models/xp'); // Import the XP model

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
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'userId query parameter is required.' });
        }
        const courses = await Course.find({ ownerId: userId }).sort({ createdAt: -1 });
        
        // Add unlock status for each chapter and lesson
        const coursesWithUnlockStatus = courses.map(course => {
            const courseObj = course.toObject();
            courseObj.chapters = courseObj.chapters.map((chapter, chapterIndex) => ({
                ...chapter,
                unlocked: course.isChapterUnlocked(chapterIndex),
                lessons: chapter.lessons.map((lesson, lessonIndex) => ({
                    ...lesson,
                    unlocked: course.isLessonUnlocked(chapterIndex, lessonIndex)
                }))
            }));
            return courseObj;
        });
        
        res.status(200).json(coursesWithUnlockStatus);
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

app.delete('/api/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId query parameter is required.' });
        }
        
        // Find and delete the course only if it belongs to the user
        const deletedCourse = await Course.findOneAndDelete({ 
            _id: courseId, 
            ownerId: userId 
        });
        
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found or not authorized to delete.' });
        }
        
        res.status(200).json({ message: 'Course deleted successfully.', courseId });
    } catch (error) {
        console.error("Error deleting course:", error.message);
        res.status(500).json({ message: "Failed to delete course." });
    }
});

app.post('/api/generate-course', async (req, res) => {
    const { topic, level, userId } = req.body;
    console.log(`POST /api/generate-course route hit with topic: "${topic}", level: "${level}", userId: "${userId}"`);

    if (!topic || !level || !userId) {
        return res.status(400).json({ message: 'Topic, level, and userId are required.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'API Key not configured on server.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
      You are an expert instructional designer. Generate a course on "${topic}" at "${level}" level.
      
      CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no extra text.
      
      JSON Structure (MUST follow this exact pattern with 4 chapters, each having 5 lessons):
      {
        "title": "Course Title",
        "description": "Brief course description",
        "level": "${level}",
        "imageUrl": "https://source.unsplash.com/800x600/?${encodeURIComponent(topic)}",
        "chapters": [
          {
            "title": "Chapter 1 Title",
            "lessons": [
              {
                "title": "Lesson 1 Title",
                "content": "<h2>Lesson Content</h2><p>Comprehensive educational content in HTML format with at least 300 words. Include detailed explanations, examples, code snippets where applicable, and practical insights.</p>",
                "xp": 10,
                "quiz": {
                  "title": "Lesson Quiz",
                  "questions": [
                    {
                      "question": "Question text?",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "correctAnswer": "Option A"
                    },
                    {
                      "question": "Another question?",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "correctAnswer": "Option B"
                    },
                    {
                      "question": "Third question?",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "correctAnswer": "Option C"
                    }
                  ]
                }
              },
              {
                "title": "Lesson 2 Title",
                "content": "<h2>Lesson 2 Content</h2><p>More comprehensive content...</p>",
                "xp": 10,
                "quiz": { "title": "Lesson 2 Quiz", "questions": [...] }
              },
              {
                "title": "Lesson 3 Title",
                "content": "<h2>Lesson 3 Content</h2><p>More comprehensive content...</p>",
                "xp": 10,
                "quiz": { "title": "Lesson 3 Quiz", "questions": [...] }
              },
              {
                "title": "Lesson 4 Title",
                "content": "<h2>Lesson 4 Content</h2><p>More comprehensive content...</p>",
                "xp": 10,
                "quiz": { "title": "Lesson 4 Quiz", "questions": [...] }
              },
              {
                "title": "Lesson 5 Title",
                "content": "<h2>Lesson 5 Content</h2><p>More comprehensive content...</p>",
                "xp": 10,
                "quiz": { "title": "Lesson 5 Quiz", "questions": [...] }
              }
            ]
          },
          {
            "title": "Chapter 2 Title",
            "lessons": [5 lessons with same structure as above]
          },
          {
            "title": "Chapter 3 Title", 
            "lessons": [5 lessons with same structure as above]
          },
          {
            "title": "Chapter 4 Title",
            "lessons": [5 lessons with same structure as above]
          }
        ]
      }

      CRITICAL REQUIREMENTS - MUST BE FOLLOWED EXACTLY:
      - Generate EXACTLY 4 chapters, no more, no less
      - Each chapter MUST have EXACTLY 5 lessons, no more, no less
      - Each lesson MUST have 3-4 quiz questions with complete structure
      - Total course should have 20 lessons (4 chapters × 5 lessons each)
      - Each lesson content must be comprehensive and detailed (300 words minimum)
      - Include practical examples, code snippets, real-world applications
      - Use proper HTML formatting with headings, paragraphs, lists, and code blocks
      - Make content engaging and educational with step-by-step explanations
      - Ensure all JSON is properly formatted with no trailing commas
      - Use double quotes for all strings
      - Escape any quotes in content with backslashes
      - DO NOT use [...] placeholders - generate full content for ALL lessons and quizzes
    `;

    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        let rawText = response.data.candidates[0].content.parts[0].text;
        console.log("Raw response from Gemini:", rawText.substring(0, 500) + "...");
        
        // Clean up the response text more thoroughly
        rawText = rawText.replace(/```json|```/g, '').trim();
        rawText = rawText.replace(/^\s*[\r\n]/gm, ''); // Remove empty lines
        rawText = rawText.replace(/,\s*}/g, '}'); // Remove trailing commas before }
        rawText = rawText.replace(/,\s*]/g, ']'); // Remove trailing commas before ]

        let generatedCourseData;
        try {
            generatedCourseData = JSON.parse(rawText);
        } catch (err) {
            console.warn("Invalid JSON, attempting repair...", err.message);
            const errorPos = parseInt(err.message.match(/position (\d+)/)?.[1]) || 0;
            console.log("Problematic JSON around position:", rawText.substring(Math.max(0, errorPos-100), errorPos+100));
            
            try {
                const repairedJson = jsonrepair(rawText);
                generatedCourseData = JSON.parse(repairedJson);
            } catch (repairErr) {
                console.error("JSON repair also failed:", repairErr.message);
                console.log("Failed JSON snippet:", rawText.substring(0, 1000));
                return res.status(500).json({ 
                    message: 'AI generated malformed course data. Please try again with a different topic or level.',
                    details: 'JSON parsing failed even after repair attempts'
                });
            }
        }

        // --- Normalize Gemini output to match schema ---
        // Validate that the generated course data has the required structure
        if (!generatedCourseData || !generatedCourseData.chapters || !Array.isArray(generatedCourseData.chapters)) {
            console.error("Invalid course data structure:", generatedCourseData);
            return res.status(500).json({ message: 'Generated course data is malformed. Please try again.' });
        }

        generatedCourseData.chapters.forEach(chapter => {
            if (!chapter.lessons || !Array.isArray(chapter.lessons)) {
                console.error("Invalid chapter structure:", chapter);
                return;
            }
            
            chapter.lessons.forEach(lesson => {
                if (lesson.quiz && lesson.quiz.questions && Array.isArray(lesson.quiz.questions)) {
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

        // Add ownerId to the course data
        generatedCourseData.ownerId = userId;

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

// --- XP Management Routes ---

// Get user XP data
app.get('/api/xp/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let userXP = await XP.findOne({ userId });
        
        // Create new XP record if user doesn't exist
        if (!userXP) {
            userXP = new XP({ userId });
            await userXP.save();
        }
        
        res.status(200).json(userXP);
    } catch (error) {
        console.error('Error fetching user XP:', error.message);
        res.status(500).json({ message: 'Failed to fetch user XP data.' });
    }
});

// Add XP to user
app.post('/api/xp/add', async (req, res) => {
    try {
        const { userId, amount, source, sourceId } = req.body;
        
        if (!userId || !amount || !source) {
            return res.status(400).json({ message: 'userId, amount, and source are required.' });
        }
        
        let userXP = await XP.findOne({ userId });
        if (!userXP) {
            userXP = new XP({ userId });
        }
        
        const result = userXP.addXP(amount, source, sourceId);
        await userXP.save();
        
        res.status(200).json({
            message: 'XP added successfully',
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            totalXP: userXP.totalXP,
            currentLevel: userXP.currentLevel,
            xpToNextLevel: userXP.xpToNextLevel
        });
    } catch (error) {
        console.error('Error adding XP:', error.message);
        res.status(500).json({ message: 'Failed to add XP.' });
    }
});

// Update user streak
app.post('/api/xp/streak/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        let userXP = await XP.findOne({ userId });
        if (!userXP) {
            userXP = new XP({ userId });
        }
        
        const streakContinued = userXP.updateStreak();
        
        // Add streak bonus XP if streak continued
        if (streakContinued && userXP.streak.current > 1) {
            const bonusXP = Math.min(userXP.streak.current * 5, 50); // Max 50 XP bonus
            userXP.addXP(bonusXP, 'streak_bonus');
        }
        
        await userXP.save();
        
        res.status(200).json({
            message: 'Streak updated successfully',
            streakContinued,
            currentStreak: userXP.streak.current,
            longestStreak: userXP.streak.longest
        });
    } catch (error) {
        console.error('Error updating streak:', error.message);
        res.status(500).json({ message: 'Failed to update streak.' });
    }
});

// Add achievement
app.post('/api/xp/achievement', async (req, res) => {
    try {
        const { userId, name, description, xpReward } = req.body;
        
        if (!userId || !name || !description) {
            return res.status(400).json({ message: 'userId, name, and description are required.' });
        }
        
        let userXP = await XP.findOne({ userId });
        if (!userXP) {
            userXP = new XP({ userId });
        }
        
        const achievementAdded = userXP.addAchievement(name, description, xpReward || 0);
        
        if (!achievementAdded) {
            return res.status(400).json({ message: 'Achievement already earned.' });
        }
        
        await userXP.save();
        
        res.status(200).json({
            message: 'Achievement added successfully',
            achievement: { name, description, xpReward: xpReward || 0 },
            totalXP: userXP.totalXP,
            currentLevel: userXP.currentLevel
        });
    } catch (error) {
        console.error('Error adding achievement:', error.message);
        res.status(500).json({ message: 'Failed to add achievement.' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const leaderboard = await XP.getLeaderboard(parseInt(limit));
        
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Failed to fetch leaderboard.' });
    }
});

// Get user rank
app.get('/api/xp/rank/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const rank = await XP.getUserRank(userId);
        
        if (rank === null) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json({ userId, rank });
    } catch (error) {
        console.error('Error fetching user rank:', error.message);
        res.status(500).json({ message: 'Failed to fetch user rank.' });
    }
});

// Complete lesson (with XP reward)
app.post('/api/lesson/complete', async (req, res) => {
    try {
        const { userId, lessonId, courseId, xpReward = 10 } = req.body;
        
        if (!userId || !lessonId) {
            return res.status(400).json({ message: 'userId and lessonId are required.' });
        }
        
        // Add XP for lesson completion
        let userXP = await XP.findOne({ userId });
        if (!userXP) {
            userXP = new XP({ userId });
        }
        
        const result = userXP.addXP(xpReward, 'lesson_completion', lessonId);
        
        // Update streak
        const streakContinued = userXP.updateStreak();
        if (streakContinued && userXP.streak.current > 1) {
            const bonusXP = Math.min(userXP.streak.current * 2, 20);
            userXP.addXP(bonusXP, 'streak_bonus');
        }
        
        await userXP.save();
        
        res.status(200).json({
            message: 'Lesson completed successfully',
            xpEarned: xpReward,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            totalXP: userXP.totalXP,
            currentLevel: userXP.currentLevel,
            streak: userXP.streak.current
        });
    } catch (error) {
        console.error('Error completing lesson:', error.message);
        res.status(500).json({ message: 'Failed to complete lesson.' });
    }
});

// Complete quiz (with XP reward and 50% requirement)
app.post('/api/quiz/complete', async (req, res) => {
    try {
        const { userId, courseId, chapterIndex, lessonIndex, score, totalQuestions, xpReward = 15 } = req.body;
        
        if (!userId || !courseId || chapterIndex === undefined || lessonIndex === undefined || score === undefined || !totalQuestions) {
            return res.status(400).json({ message: 'userId, courseId, chapterIndex, lessonIndex, score, and totalQuestions are required.' });
        }
        
        // Calculate percentage
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 50;
        
        // Find and update the course
        const course = await Course.findOne({ _id: courseId, ownerId: userId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        
        // Update lesson quiz data
        const lesson = course.chapters[chapterIndex].lessons[lessonIndex];
        lesson.attempts += 1;
        lesson.quizScore = percentage;
        lesson.quizPassed = passed;
        
        if (passed) {
            lesson.completed = true;
            
            // Check and update chapter completion
            const chapterCompleted = course.updateChapterCompletion(chapterIndex);
            
            // Add XP for quiz completion
            let userXP = await XP.findOne({ userId });
            if (!userXP) {
                userXP = new XP({ userId });
            }
            
            let finalXP = xpReward;
            if (percentage === 100) {
                finalXP += 10; // Perfect score bonus
            } else if (percentage >= 90) {
                finalXP += 5; // Excellent score bonus
            }
            
            // Bonus XP for completing a chapter
            if (chapterCompleted) {
                finalXP += 25; // Chapter completion bonus
            }
            
            const result = userXP.addXP(finalXP, 'quiz_completion', `${courseId}_${chapterIndex}_${lessonIndex}`);
            await userXP.save();
            
            await course.save();
            
            res.status(200).json({
                message: chapterCompleted ? 'Chapter completed! Next chapter unlocked.' : 'Quiz passed! Next lesson unlocked.',
                passed: true,
                score,
                totalQuestions,
                percentage,
                xpEarned: finalXP,
                leveledUp: result.leveledUp,
                newLevel: result.newLevel,
                totalXP: userXP.totalXP,
                currentLevel: userXP.currentLevel,
                attempts: lesson.attempts,
                chapterCompleted,
                isLastLessonInChapter: lessonIndex === course.chapters[chapterIndex].lessons.length - 1
            });
        } else {
            await course.save();
            
            res.status(200).json({
                message: `You need 50% to unlock the next lesson. You scored ${percentage}%. Try again!`,
                passed: false,
                score,
                totalQuestions,
                percentage,
                xpEarned: 0,
                attempts: lesson.attempts,
                requiredPercentage: 50
            });
        }
    } catch (error) {
        console.error('Error completing quiz:', error.message);
        res.status(500).json({ message: 'Failed to complete quiz.' });
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

// Regenerate Quiz Questions Endpoint
app.post('/api/quiz/regenerate', async (req, res) => {
    try {
        const { userId, courseId, chapterIndex, lessonIndex } = req.body;
        
        if (!userId || !courseId || chapterIndex === undefined || lessonIndex === undefined) {
            return res.status(400).json({ message: 'userId, courseId, chapterIndex, and lessonIndex are required.' });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ message: 'API Key not configured on server.' });
        }

        // Find the course and lesson
        const course = await Course.findOne({ _id: courseId, ownerId: userId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        const lesson = course.chapters[chapterIndex].lessons[lessonIndex];
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        
        const prompt = `
        Generate a new quiz for the lesson titled "${lesson.title}".
        
        Lesson content: "${lesson.content}"
        
        First, ensure that the lesson content for "${lesson.title}" is at least 300 words long. If it is shorter, expand or elaborate the content to make it at least 300 words while staying relevant and accurate.
        
        Then, create 5 different multiple-choice questions based on this lesson content. Make sure these are NEW questions, different from any previous attempts.
        
        Return ONLY a JSON object in this exact format:
        {
          "questions": [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "Option A"
            }
          ]
        }
        
        Make the questions challenging but fair, testing understanding of the key concepts.
        `;
        

        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        let rawText = response.data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json|```/g, '').trim();

        let newQuizData;
        try {
            newQuizData = JSON.parse(rawText);
        } catch (parseError) {
            try {
                const repairedJson = jsonrepair(rawText);
                newQuizData = JSON.parse(repairedJson);
            } catch (repairError) {
                console.error("Failed to parse quiz JSON:", rawText);
                return res.status(500).json({ message: 'Failed to generate valid quiz questions.' });
            }
        }

        // Update the lesson's quiz with new questions
        course.chapters[chapterIndex].lessons[lessonIndex].quiz = {
            title: lesson.quiz.title,
            questions: newQuizData.questions
        };

        await course.save();

        res.status(200).json({ 
            message: 'New quiz questions generated successfully',
            quiz: course.chapters[chapterIndex].lessons[lessonIndex].quiz
        });

    } catch (error) {
        console.error('Error regenerating quiz:', error);
        res.status(500).json({ message: 'Failed to regenerate quiz questions.' });
    }
});

app.use((req, res) => {
    res.status(404).send({ message: `Route ${req.originalUrl} not found.` });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));