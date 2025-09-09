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
        res.status(200).json(courses);
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
      
      JSON Structure:
      {
        "title": "Course Title",
        "description": "Brief course description",
        "level": "${level}",
        "imageUrl": "https://source.unsplash.com/800x600/?${encodeURIComponent(topic)}",
        "chapters": [
          {
            "title": "Chapter Title",
            "lessons": [
              {
                "title": "Lesson Title",
                "content": "<h2>Lesson Content</h2><p>Educational content in HTML format with at least 100 words.</p>",
                "xp": 10,
                "quiz": {
                  "title": "Lesson Quiz",
                  "questions": [
                    {
                      "question": "Question text?",
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
      - Exactly 3 chapters
      - Each chapter has exactly 2 lessons
      - Each lesson has 2-3 quiz questions
      - Keep content concise but educational
      - Ensure all JSON is properly formatted with no trailing commas
      - Use double quotes for all strings
      - Escape any quotes in content with backslashes
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

// Complete quiz (with XP reward)
app.post('/api/quiz/complete', async (req, res) => {
    try {
        const { userId, quizId, lessonId, score, totalQuestions, xpReward = 15 } = req.body;
        
        if (!userId || !quizId || score === undefined || !totalQuestions) {
            return res.status(400).json({ message: 'userId, quizId, score, and totalQuestions are required.' });
        }
        
        // Calculate XP based on score (bonus for perfect score)
        const percentage = (score / totalQuestions) * 100;
        let finalXP = xpReward;
        
        if (percentage === 100) {
            finalXP += 10; // Perfect score bonus
        } else if (percentage >= 80) {
            finalXP += 5; // Good score bonus
        }
        
        // Add XP for quiz completion
        let userXP = await XP.findOne({ userId });
        if (!userXP) {
            userXP = new XP({ userId });
        }
        
        const result = userXP.addXP(finalXP, 'quiz_completion', quizId);
        await userXP.save();
        
        res.status(200).json({
            message: 'Quiz completed successfully',
            score,
            totalQuestions,
            percentage: Math.round(percentage),
            xpEarned: finalXP,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            totalXP: userXP.totalXP,
            currentLevel: userXP.currentLevel
        });
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

app.use((req, res) => {
    res.status(404).send({ message: `Route ${req.originalUrl} not found.` });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));