const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();


router.post('/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message is required.' });
    }

    // It's good practice to load environment variables at the start of your app, e.g., in your main server file.

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

module.exports = router;