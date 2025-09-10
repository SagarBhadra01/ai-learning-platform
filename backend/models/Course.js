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
    completed: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 }, // Percentage score (0-100)
    quizPassed: { type: Boolean, default: false }, // True if score >= 75%
    attempts: { type: Number, default: 0 }, // Number of quiz attempts
}, { _id: false });

const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [LessonSchema],
    completed: { type: Boolean, default: false }, // Chapter completion status
    unlocked: { type: Boolean, default: false }, // Chapter unlock status
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

// Method to check if a chapter is unlocked
CourseSchema.methods.isChapterUnlocked = function(chapterIndex) {
    // First chapter is always unlocked
    if (chapterIndex === 0) {
        return true;
    }
    
    // Check if previous chapter is completed (all lessons passed with 75%+)
    const previousChapter = this.chapters[chapterIndex - 1];
    return previousChapter.completed;
};

// Method to check if a lesson is unlocked
CourseSchema.methods.isLessonUnlocked = function(chapterIndex, lessonIndex) {
    // Check if chapter is unlocked first
    if (!this.isChapterUnlocked(chapterIndex)) {
        return false;
    }
    
    // First lesson of unlocked chapter is always unlocked
    if (lessonIndex === 0) {
        return true;
    }
    
    // Check if previous lesson in same chapter is completed with 75%+ quiz score
    const previousLesson = this.chapters[chapterIndex].lessons[lessonIndex - 1];
    return previousLesson.completed && previousLesson.quizPassed;
};

// Method to check and update chapter completion status
CourseSchema.methods.updateChapterCompletion = function(chapterIndex) {
    const chapter = this.chapters[chapterIndex];
    const allLessonsCompleted = chapter.lessons.every(lesson => lesson.completed && lesson.quizPassed);
    chapter.completed = allLessonsCompleted;
    return allLessonsCompleted;
};

// Method to get next unlocked lesson
CourseSchema.methods.getNextUnlockedLesson = function() {
    for (let chapterIndex = 0; chapterIndex < this.chapters.length; chapterIndex++) {
        for (let lessonIndex = 0; lessonIndex < this.chapters[chapterIndex].lessons.length; lessonIndex++) {
            const lesson = this.chapters[chapterIndex].lessons[lessonIndex];
            if (!lesson.completed && this.isLessonUnlocked(chapterIndex, lessonIndex)) {
                return { chapterIndex, lessonIndex };
            }
        }
    }
    return null; // All lessons completed
};

// Create and export the model
const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;