const express = require('express');
const router = express.Router();
const XP = require('../models/xp.js'); // Assuming the model is in ../models/xp.model.js

router.get('/xp/:userId', async (req, res) => {
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

router.post('/xp/add', async (req, res) => {
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

router.post('/xp/achievement', async (req, res) => {
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
router.get('/leaderboard', async (req, res) => {
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
router.get('/xp/rank/:userId', async (req, res) => {
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

router.post('/quiz/complete', async (req, res) => {
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

module.exports = router;
