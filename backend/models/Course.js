const mongoose = require('mongoose');

// Define nested schemas to maintain structure

const QuizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
}, { _id: false });

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [QuizQuestionSchema],
}, { _id: false });

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    xp: { type: Number, required: true },
    quiz: QuizSchema, // Optional quiz
}, { _id: false });

const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [LessonSchema],
}, { _id: false });

// --- UPDATED CourseSchema ---
const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced'], // Ensures data integrity
    },
    imageUrl: {
        type: String,
        required: true,
    },
    // NEW: Added optional projectDescription
    projectDescription: {
        type: String,
    },
    chapters: [ChapterSchema],
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create and export the model
const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;