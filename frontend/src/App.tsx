import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import { 
  ModernDashboard, 
  Header, 
  Sidebar, 
  ProgressBar,
  BookmarkedCourses
} from './components';
import type { 
  View, 
  User, 
  Course, 
  ChatMessage, 
  QuizResult, 
  QuizProgress, 
  GeminiResponse 
} from './components';
import { BookmarkProvider } from './contexts/BookmarkContext';

// --- Environment Variable Setup for Vite ---
const FRONTEND_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- LOGO MAP ---
const topicLogoMap: { [key: string]: string } = {
    'react': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'javascript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    'typescript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
    'html': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    'css': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    'java': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    'node': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg',
    'mongodb': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg',
};


// --- UI COMPONENTS





const CourseGenerator: React.FC<{ onCourseCreated: (course: Course) => void; }> = ({ onCourseCreated }) => {
    const { user: clerkUser } = useUser();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<Course['level']>('Beginner');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic.'); return; }
        if (!clerkUser?.id) { setError('User not authenticated.'); return; }
        
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post<Course>('http://localhost:5001/api/generate-course', { 
                topic, 
                level,
                userId: clerkUser.id 
            });
            onCourseCreated(response.data);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Could not connect to the backend.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6 shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-4">
                        AI Course Creator
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform any topic into a comprehensive learning experience with our intelligent course generation system
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
                            <div className="space-y-8">
                                {/* Course Topic */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">1</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">What do you want to learn?</h3>
                                    </div>
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            value={topic} 
                                            onChange={(e) => setTopic(e.target.value)} 
                                            placeholder="Enter your topic (e.g., Machine Learning, Web Development, Digital Marketing)" 
                                            className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg group-hover:border-gray-300"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Difficulty Level */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">2</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Choose your level</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((levelOption) => (
                                            <button
                                                key={levelOption}
                                                type="button"
                                                onClick={() => setLevel(levelOption)}
                                                disabled={isLoading}
                                                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                                    level === levelOption
                                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                            >
                                                <div className="text-center space-y-3">
                                                    <div className={`text-4xl transition-transform group-hover:scale-110 ${
                                                        level === levelOption ? 'animate-pulse' : ''
                                                    }`}>
                                                        {levelOption === 'Beginner' && '🌱'}
                                                        {levelOption === 'Intermediate' && '🚀'}
                                                        {levelOption === 'Advanced' && '⚡'}
                                                    </div>
                                                    <div className={`font-bold text-lg ${
                                                        level === levelOption ? 'text-blue-700' : 'text-gray-700'
                                                    }`}>
                                                        {levelOption}
                                                    </div>
                                                    <div className={`text-sm ${
                                                        level === levelOption ? 'text-blue-600' : 'text-gray-500'
                                                    }`}>
                                                        {levelOption === 'Beginner' && 'Perfect for newcomers'}
                                                        {levelOption === 'Intermediate' && 'Some experience required'}
                                                        {levelOption === 'Advanced' && 'For experienced learners'}
                                                    </div>
                                                </div>
                                                {level === levelOption && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">3</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Generate your course</h3>
                                    </div>
                                    <button 
                                        onClick={handleGenerate} 
                                        disabled={isLoading || !topic.trim()} 
                                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xl relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <div className="relative z-10">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Creating Your Course...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-3">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span>Generate Course with AI</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-red-800 font-semibold">Error</h4>
                                                <p className="text-red-700 mt-1">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-3xl mr-3">✨</span>
                                AI-Powered Features
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: '📚', title: 'Structured Chapters', desc: 'Organized learning modules' },
                                    { icon: '🎯', title: 'Interactive Quizzes', desc: 'Test your knowledge' },
                                    { icon: '⭐', title: 'Progress Tracking', desc: 'Monitor your advancement' },
                                    { icon: '🧠', title: 'Smart Content', desc: 'AI-generated explanations' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-emerald-50 transition-all duration-300">
                                        <div className="text-2xl">{feature.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                                            <p className="text-gray-600 text-sm">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl p-8 text-center">
                            <div className="text-6xl mb-4">🎓</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Learn?</h3>
                            <p className="text-gray-600 text-sm">
                                Our AI will create a personalized learning path just for you
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- UPDATED LearningView Component ---
const LearningView: React.FC<{ course: Course; onMarkComplete: (courseId: string, chapIdx: number, lessIdx: number, xp: number, quizResult?: Omit<QuizResult, 'date'>) => void; quizProgress: QuizProgress | null; onUpdateQuizProgress: (progress: QuizProgress) => void; }> = ({ course, onMarkComplete, quizProgress, onUpdateQuizProgress }) => {
    const [activeLesson, setActiveLesson] = useState<{ chap: number, less: number } | null>({ chap: 0, less: 0 });
    const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState<Omit<QuizResult, 'date'> | null>(null);

    const currentLesson = activeLesson ? course.chapters[activeLesson.chap].lessons[activeLesson.less] : null;

    useEffect(() => {
        setIsQuizSubmitted(false);
        setQuizResult(null);
    }, [activeLesson]);

    const handleQuizAnswer = (questionIndex: number, answer: string) => { if (!activeLesson || !currentLesson || !currentLesson.quiz) return; const progress: QuizProgress = quizProgress ?? { courseId: course.id, chapterIndex: activeLesson.chap, lessonIndex: activeLesson.less, currentQuestionIndex: 0, answers: {}, }; const newAnswers = { ...progress.answers, [questionIndex]: answer }; onUpdateQuizProgress({ ...progress, answers: newAnswers }); };
    
    const handleSubmitQuiz = () => {
        if (!activeLesson || !currentLesson || !currentLesson.quiz || !quizProgress) return;
        const quiz = currentLesson.quiz;
        let correct = 0;
        quiz.questions.forEach((q, i) => { if (quizProgress.answers[i] === q.correctAnswer) { correct++; } });
        const score = Math.round((correct / quiz.questions.length) * 100);
        const result: Omit<QuizResult, 'date'> = { courseId: course.id, quizTitle: quiz.title, score, correct, total: quiz.questions.length, };
        setQuizResult(result);
        setIsQuizSubmitted(true);
    };

    const handleContinue = () => {
        if (!activeLesson || !currentLesson || !quizResult) return;
        // --- THIS IS THE KEY CHANGE ---
        // Calculate XP based on the number of correct answers (10 XP per correct answer)
        const xpGainedFromQuiz = quizResult.correct * 10;
        onMarkComplete(course.id, activeLesson.chap, activeLesson.less, xpGainedFromQuiz, quizResult);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
            {/* Sidebar Navigation */}
            <aside className="lg:w-1/4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 lg:p-6 h-fit lg:sticky lg:top-24 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {course.title}
                </h3>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                    {course.chapters.map((chap, chapIdx) => (
                        <div key={chapIdx} className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs">{chapIdx + 1}</span>
                                {chap.title}
                            </h4>
                            <ul className="space-y-1 pl-7">
                                {chap.lessons.map((less, lessIdx) => (
                                    <li 
                                        key={lessIdx} 
                                        className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                            activeLesson?.chap === chapIdx && activeLesson?.less === lessIdx 
                                                ? 'bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-100' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                        } ${less.completed ? 'text-green-600' : ''}`} 
                                        onClick={() => setActiveLesson({ chap: chapIdx, less: lessIdx })}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{less.title}</span>
                                            {less.completed && (
                                                <span className="text-green-500">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-md border border-gray-200">
                {currentLesson ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span>Chapter {activeLesson!.chap + 1}</span>
                                <span>•</span>
                                <span>Lesson {activeLesson!.less + 1}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                            {currentLesson.completed && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Completed
                                </span>
                            )}
                        </div>

                        {/* Lesson Content */}
                        <div 
                            className="prose prose-blue max-w-none text-gray-700 mb-8" 
                            dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                        ></div>
                        
                        {/* Quiz Section */}
                        {currentLesson.quiz && !currentLesson.completed && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 sm:p-8 mt-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{currentLesson.quiz.title}</h3>
                                </div>
                                
                                <div className="space-y-8">
                                    {currentLesson.quiz.questions.map((q, qIdx) => {
                                        const userAnswer = quizProgress?.answers?.[qIdx];
                                        return (
                                            <div key={qIdx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="font-medium text-gray-800 mb-4">
                                                    <span className="text-blue-600 font-semibold">Question {qIdx + 1}.</span> {q.question}
                                                </p>
                                                <div className="space-y-3">
                                                    {q.options.map(opt => {
                                                        const isCorrect = q.correctAnswer === opt;
                                                        const isSelected = userAnswer === opt;
                                                        let optionClass = "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ";
                                                        
                                                        if (isQuizSubmitted) {
                                                            if (isCorrect) { 
                                                                optionClass += 'bg-green-50 border-green-200 text-green-800';
                                                            } else if (isSelected && !isCorrect) { 
                                                                optionClass += 'bg-red-50 border-red-200 text-red-800';
                                                            } else { 
                                                                optionClass += 'bg-white border-gray-200 text-gray-600';
                                                            }
                                                        } else {
                                                            optionClass += 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
                                                        }

                                                        return (
                                                            <label key={opt} className={optionClass}>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q_${qIdx}`} 
                                                                    value={opt} 
                                                                    onChange={() => handleQuizAnswer(qIdx, opt)} 
                                                                    disabled={isQuizSubmitted} 
                                                                    checked={isSelected} 
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                                                                />
                                                                <span className="flex-1">{opt}</span>
                                                                {isQuizSubmitted && isCorrect && (
                                                                    <span className="text-green-500">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                                {isQuizSubmitted && isSelected && !isCorrect && (
                                                                    <span className="text-red-500">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Quiz Actions */}
                                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                        {!isQuizSubmitted ? (
                                            <button 
                                                onClick={handleSubmitQuiz} 
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex-1 sm:flex-none sm:w-auto"
                                            >
                                                Submit Quiz
                                            </button>
                                        ) : (
                                            <div className="w-full bg-white border border-green-100 rounded-xl p-6 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-1">Quiz Complete!</h4>
                                                <p className="text-gray-600 mb-6">
                                                    You scored <span className="font-bold text-blue-600">{quizResult?.score}%</span> 
                                                    ({quizResult?.correct} out of {quizResult?.total} correct)
                                                </p>
                                                <button 
                                                    onClick={handleContinue} 
                                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto"
                                                >
                                                    Continue Learning
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mark Complete Button (for non-quiz lessons) */}
                        {!currentLesson.completed && !currentLesson.quiz && activeLesson && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => onMarkComplete(course.id, activeLesson.chap, activeLesson.less, currentLesson.xp)} 
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Complete
                                </button>
                            </div>
                        )}

                        {/* Completion Badge */}
                        {currentLesson.completed && (
                            <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-green-800">Lesson Completed!</h4>
                                    <p className="text-sm text-green-600">Great job! You've earned {currentLesson.xp} XP.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Select a lesson to begin</h3>
                        <p className="text-gray-500">Choose a lesson from the sidebar to start learning</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const Profile: React.FC<{ user: User }> = ({ user }) => {
  const calculateXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const getAchievementBadges = () => {
    const badges = [];
    if (user.streak >= 7) badges.push({ icon: '🔥', title: 'Week Warrior', desc: '7+ day streak' });
    if (user.streak >= 30) badges.push({ icon: '💪', title: 'Month Master', desc: '30+ day streak' });
    if (user.level >= 5) badges.push({ icon: '⭐', title: 'Rising Star', desc: 'Reached Level 5' });
    if (user.level >= 10) badges.push({ icon: '👑', title: 'Learning King', desc: 'Reached Level 10' });
    if (user.quizHistory.length >= 10) badges.push({ icon: '🎯', title: 'Quiz Master', desc: '10+ quizzes completed' });
    return badges;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <div className="w-36 h-36 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl animate-bounce border-4 border-white/90">
                {user.level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {user.name}
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-2xl mb-1 text-yellow-500">⭐</div>
                  <div className="text-blue-900 font-bold text-lg">Level {user.level}</div>
                  <div className="text-blue-700 text-sm font-medium">{user.xp.toLocaleString()} XP</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-2xl mb-1 text-orange-500">🔥</div>
                  <div className="text-blue-900 font-bold text-lg">{user.streak} Days</div>
                  <div className="text-blue-700 text-sm font-medium">Current Streak</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-medium">Level {user.level} Progress</span>
                  <span className="text-white font-bold bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full text-sm shadow-md">
                    {user.xpToNextLevel ? `${Math.max(0, (calculateXPForLevel(user.level + 1) - user.xpToNextLevel))}/${calculateXPForLevel(user.level + 1)}` : `${user.xp % 100}/100`} XP
                  </span>
                </div>
                <div className="w-full bg-blue-100/80 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-inner"
                    style={{ 
                      width: user.xpToNextLevel 
                        ? `${Math.max(0, Math.min(100, ((calculateXPForLevel(user.level + 1) - user.xpToNextLevel) / calculateXPForLevel(user.level + 1)) * 100))}%`
                        : `${(user.xp % 100)}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {getAchievementBadges().length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            Achievement Badges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAchievementBadges().map((badge, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-200">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{badge.title}</h3>
                <p className="text-gray-600 text-sm">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
const Chatbot: React.FC<{ onClose: () => void; }> = ({ onClose }) => { 
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', parts: [{ text: "Hello! I'm LearnSphere Tutor." }] }]); 
  const [input, setInput] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]); 
  
  const handleSendMessage = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!input.trim() || isLoading) return; 
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] }; 
    setMessages(prev => [...prev, userMessage]); 
    setInput(''); 
    setIsLoading(true); 
    
    try { 
      const response = await axios.post<{ reply: string }>('http://localhost:5001/api/chat', { 
        message: input, 
        history: messages 
      }); 
      const modelMessage: ChatMessage = { 
        role: 'model', 
        parts: [{ text: response.data.reply }] 
      }; 
      setMessages(prev => [...prev, modelMessage]); 
    } catch (error: any) { 
      const serverErrorMessage = error.response?.data?.message || "Sorry, I'm having trouble connecting."; 
      const errorMessage: ChatMessage = { 
        role: 'model', 
        parts: [{ text: serverErrorMessage }] 
      }; 
      setMessages(prev => [...prev, errorMessage]); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 
  
  return ( 
    <div className="fixed bottom-24 right-5 w-96 h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="text-lg font-bold text-white">AI Tutor</h3>
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 text-2xl leading-none"
        >
          &times;
        </button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-3 p-3 rounded-lg max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white ml-auto' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">
              {msg.parts[0].text}
            </p>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-white p-3 rounded-lg max-w-[85%] border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm italic">Tutor is typing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask a question..." 
            className="w-full bg-transparent p-2 text-gray-800 focus:outline-none" 
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            className="p-2 text-blue-600 hover:text-blue-700 rounded-lg m-1" 
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 rotate-90" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  ); 
};
const SignInPage: React.FC = () => { 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col justify-center items-center p-4">
      <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-14 h-14 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
            />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to LearnSphere
        </h1>
        
        <p className="text-blue-100 mb-8 text-lg">
          Your personal AI-powered learning platform.
        </p>
        
        <div className="inline-block bg-white hover:bg-gray-100 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          <SignInButton />
        </div>
      </div>
    </div>
  ); 
};

const LearnSphereApp: React.FC = () => {
    const { user: clerkUser, isLoaded } = useUser();
    const [user, setUser] = useState<User>({
        id: '1',
        name: 'New Learner',
        avatarUrl: '',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 0,
        lastCompletedDate: null,
        quizHistory: []
    });
    const [view, setView] = useState<View>('dashboard');
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);

    // Load user XP data from backend when user is loaded
    useEffect(() => {
        if (isLoaded && clerkUser) {
            setUser((prev: User) => ({
                ...prev,
                id: clerkUser.id,
                name: clerkUser.fullName ?? 'New Learner',
                avatarUrl: clerkUser.imageUrl || ''
            }));
            loadUserXP(clerkUser.id);
        }
    }, [isLoaded, clerkUser]);

    // Function to load user XP data from backend
    const loadUserXP = async (userId: string) => {
        try {
            const response = await axios.get(`http://localhost:5001/api/xp/${userId}`);
            const xpData = response.data as {
                totalXP: number;
                currentLevel: number;
                xpToNextLevel: number;
                streak: { current: number; lastActivity?: Date };
            };
            
            setUser((prev: User) => ({
                ...prev,
                xp: xpData.totalXP,
                level: xpData.currentLevel,
                xpToNextLevel: xpData.xpToNextLevel,
                streak: xpData.streak.current,
                lastCompletedDate: xpData.streak.lastActivity ? new Date(xpData.streak.lastActivity).toISOString().split('T')[0] : null
            }));
        } catch (error) {
            console.error('Error loading user XP:', error);
        }
    };


    const getAiImageKeywords = useCallback(async (courseTitle: string): Promise<string> => {
        if (!FRONTEND_GEMINI_API_KEY) { console.error("Frontend Gemini API Key not found in .env file. Make sure it starts with VITE_"); return courseTitle; }
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${FRONTEND_GEMINI_API_KEY}`;
        const prompt = `You are an expert at finding stock photo keywords. For a course titled "${courseTitle}", what are the 3-4 best, most visually descriptive keywords to find a beautiful, high-quality image? Respond with ONLY the keywords, separated by commas. Example: for 'React JS', respond with 'modern user interface, abstract code, web development'.`;
        try {
            const response = await axios.post<GeminiResponse>(API_URL, { contents: [{ parts: [{ text: prompt }] }] });
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error fetching image keywords from Gemini:", error);
            return courseTitle;
        }
    }, []);

    const getImageUrlForTopic = useCallback((courseTitle: string, courseId: string): string => {
        const normalizedTitle = courseTitle.toLowerCase();
        for (const keyword in topicLogoMap) { if (normalizedTitle.includes(keyword)) { return topicLogoMap[keyword]; } }
        return `https://picsum.photos/seed/${courseId}/800/600`;
    }, []);

    const processCourse = useCallback(async (course: Course, isNew: boolean = false) => {
        const id = course._id || course.id;
        setGeneratingImages(prev => new Set(prev).add(id));
        let imageUrl = getImageUrlForTopic(course.title, id);
        if (isNew && imageUrl.startsWith('https://picsum.photos')) {
            const keywords = await getAiImageKeywords(course.title);
            imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords)}`;
        }
        setCourses(prevCourses => prevCourses.map(c => (c.id === id ? { ...c, imageUrl } : c)));
        setGeneratingImages(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    }, [getAiImageKeywords, getImageUrlForTopic]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!clerkUser?.id) return;
            
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get<Course[]>(`http://localhost:5001/api/courses?userId=${clerkUser.id}`);
                const initialCourses = response.data.map(c => ({ 
                    ...c, 
                    id: c._id || c.id, 
                    imageUrl: getImageUrlForTopic(c.title, c._id || c.id) 
                }));
                setCourses(initialCourses);
            } catch (error: any) {
                setFetchError(error.message || "A network error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, [clerkUser?.id, getImageUrlForTopic]);

    const handleAddCourse = useCallback((newCourseData: Course) => {
        const newCourse = { ...newCourseData, id: newCourseData._id || newCourseData.id, imageUrl: '' };
        setCourses(prev => [newCourse, ...prev]);
        setView('dashboard');
        processCourse(newCourse, true);
    }, [processCourse]);

    const handleDeleteCourse = useCallback(async (courseId: string) => {
        if (!clerkUser?.id) return;
        
        try {
            await axios.delete(`http://localhost:5001/api/courses/${courseId}?userId=${clerkUser.id}`);
            
            // Remove the course from the local state
            setCourses(prev => prev.filter(course => course.id !== courseId));
            
            // If we're currently viewing the deleted course, go back to dashboard
            if (activeCourseId === courseId) {
                setView('dashboard');
                setActiveCourseId(null);
            }
        } catch (error: any) {
            console.error('Error deleting course:', error);
            // You could add a toast notification here for better UX
        }
    }, [clerkUser?.id, activeCourseId]);
    
    const handleStartLearning = useCallback((courseId: string) => { setActiveCourseId(courseId); setView('learn'); }, []);
    
    const handleMarkLessonComplete = useCallback(async (courseId: string, chapterIndex: number, lessonIndex: number, xpGained: number, quizResult?: Omit<QuizResult, 'date'>) => {
        if (!clerkUser?.id) return;
        
        // Update course completion status
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === courseId) {
                const newChapters = JSON.parse(JSON.stringify(course.chapters));
                newChapters[chapterIndex].lessons[lessonIndex].completed = true;
                return { ...course, chapters: newChapters };
            }
            return course;
        }));
        
        // Clear quiz progress if this was a quiz completion
        if (quizResult) {
            setQuizProgress(null);
            
            // Add XP for quiz completion via backend
            await axios.post('http://localhost:5001/api/quiz/complete', {
                userId: clerkUser.id,
                quizId: `${courseId}_${chapterIndex}_${lessonIndex}`,
                lessonId: `${courseId}_${chapterIndex}_${lessonIndex}`,
                score: quizResult.correct,
                totalQuestions: quizResult.total,
                xpReward: 15
            });
            
            // Update quiz history
            setUser((prevUser: User) => ({
                ...prevUser,
                quizHistory: [...prevUser.quizHistory, { ...quizResult, date: new Date().toISOString() }]
            }));
        } else {
            // Add XP for lesson completion via backend
            await axios.post('http://localhost:5001/api/lesson/complete', {
                userId: clerkUser.id,
                lessonId: `${courseId}_${chapterIndex}_${lessonIndex}`,
                courseId: courseId,
                xpReward: xpGained
            });
        }
        
        // Reload user XP data to get updated values
        await loadUserXP(clerkUser.id);
    }, [clerkUser?.id, loadUserXP]);

    const handleUpdateQuizProgress = useCallback((progress: QuizProgress) => { setQuizProgress(progress); }, []);
    const activeCourse = useMemo(() => courses.find(c => c.id === activeCourseId) || null, [courses, activeCourseId]);

    // Calculate overall progress for the progress bar
    useEffect(() => {
        if (courses.length > 0) {
            const totalLessons = courses.reduce((total, course) => 
                total + course.chapters.reduce((chapterTotal, chapter) => 
                    chapterTotal + chapter.lessons.length, 0), 0);
            const completedLessons = courses.reduce((total, course) => 
                total + course.chapters.reduce((chapterTotal, chapter) => 
                    chapterTotal + chapter.lessons.filter(lesson => lesson.completed).length, 0), 0);
            setOverallProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);
        }
    }, [courses]);

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <ModernDashboard courses={courses} user={user} onStartLearning={handleStartLearning} onCreateNew={() => setView('generate')} onDeleteCourse={handleDeleteCourse} isLoading={isLoading} error={fetchError} generatingImages={generatingImages}/>;
            case 'bookmarks': return <BookmarkedCourses courses={courses} onStartLearning={handleStartLearning} onDeleteCourse={handleDeleteCourse} generatingImages={generatingImages} />;
            case 'generate': return <CourseGenerator onCourseCreated={handleAddCourse} />;
            case 'learn': if(activeCourse) { return <LearningView course={activeCourse} onMarkComplete={handleMarkLessonComplete} quizProgress={quizProgress} onUpdateQuizProgress={handleUpdateQuizProgress} />; } else { setView('dashboard'); return null; }
            case 'profile': return <Profile user={user} />;
            default: return <ModernDashboard courses={courses} user={user} onStartLearning={handleStartLearning} onCreateNew={() => setView('generate')} onDeleteCourse={handleDeleteCourse} isLoading={isLoading} error={fetchError} generatingImages={generatingImages} />;
        }
    };
    
    return (
        <div className="relative min-h-screen bg-white text-gray-800 font-sans">
            {/* Progress Bar */}
            <ProgressBar progress={overallProgress} />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-50">
                <Header user={user} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <Sidebar 
                  currentView={view} 
                  onViewChange={(newView) => {
                    setView(newView);
                    setIsMobileMenuOpen(false);
                  }}
                  isOpen={isMobileMenuOpen}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
                <main className="lg:ml-64 pt-16 min-h-screen transition-all duration-300">
                    <div className="p-4 sm:p-6 lg:p-8 w-full">
                        <div className="max-w-full">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
            
            {/* AI Tutor Button */}
            <div className="fixed bottom-5 right-5 z-40">
                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)} 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-110" 
                    aria-label="Toggle AI Tutor"
                >
                    🤖
                </button>
            </div>
            
            {/* Chatbot */}
            {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
        </div>
    );
};

const App: React.FC = () => (
    <BookmarkProvider>
        <SignedOut><SignInPage /></SignedOut>
        <SignedIn><LearnSphereApp /></SignedIn>
    </BookmarkProvider>
);

export default App;