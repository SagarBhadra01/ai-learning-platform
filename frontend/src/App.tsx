import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import { 
  ModernDashboard, 
  Header, 
  Sidebar, 
  ProgressBar
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
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">Create a New Course</h2>
            <p className="text-gray-400 mb-6">Enter a topic you want to learn about and choose a difficulty level.</p>
            <div className="flex flex-col space-y-4">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'React JS'" className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={isLoading}/>
                <select value={level} onChange={(e) => setLevel(e.target.value as Course['level'])} className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={isLoading}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading ? 'Generating...' : 'Generate Course'}</button>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
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
        <div className="flex gap-8">
            <aside className="w-1/4 bg-gray-800 p-4 rounded-lg h-fit sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">{course.title}</h3>
                {course.chapters.map((chap, chapIdx) => (<div key={chapIdx} className="mb-4"><h4 className="font-semibold text-gray-300">{chap.title}</h4><ul>{chap.lessons.map((less, lessIdx) => (<li key={lessIdx} className={`p-2 rounded-md cursor-pointer ${activeLesson?.chap === chapIdx && activeLesson?.less === lessIdx ? 'bg-indigo-600' : ''} ${less.completed ? 'text-gray-500 line-through' : 'text-white'}`} onClick={() => setActiveLesson({ chap: chapIdx, less: lessIdx })}>{less.title} {less.completed && '✓'}</li>))}</ul></div>))}
            </aside>
            <main className="w-3/4 p-8 bg-gray-800 rounded-lg">
                {currentLesson ? (<div>
                    <h2 className="text-3xl font-bold text-white mb-4">{currentLesson.title}</h2>
                    <div className="prose prose-invert max-w-none text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: currentLesson.content }}></div>
                    
                    {currentLesson.quiz && !currentLesson.completed && (
                        <div className="bg-gray-700 p-6 rounded-lg mt-6">
                            <h3 className="text-2xl font-bold text-white mb-4">{currentLesson.quiz.title}</h3>
                            {currentLesson.quiz.questions.map((q, qIdx) => {
                                const userAnswer = quizProgress?.answers?.[qIdx];
                                return (
                                    <div key={qIdx} className="mb-6">
                                        <p className="text-white mb-3 font-semibold">{qIdx + 1}. {q.question}</p>
                                        <div className="flex flex-col space-y-2">
                                            {q.options.map(opt => {
                                                const isCorrect = q.correctAnswer === opt;
                                                const isSelected = userAnswer === opt;
                                                let optionClass = "flex items-center space-x-3 p-3 rounded-md border border-transparent transition-colors ";
                                                if (isQuizSubmitted) {
                                                    if (isCorrect) { optionClass += 'bg-green-800 bg-opacity-50 border-green-500 text-green-200'; } 
                                                    else if (isSelected && !isCorrect) { optionClass += 'bg-red-800 bg-opacity-50 border-red-500 text-red-200'; } 
                                                    else { optionClass += 'bg-gray-600 text-gray-300'; }
                                                } else {
                                                    optionClass += 'bg-gray-600 cursor-pointer hover:bg-gray-500';
                                                }
                                                return (
                                                    <label key={opt} className={optionClass}>
                                                        <input type="radio" name={`q_${qIdx}`} value={opt} onChange={() => handleQuizAnswer(qIdx, opt)} disabled={isQuizSubmitted} checked={isSelected} className="form-radio h-4 w-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500 disabled:opacity-50" />
                                                        <span>{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            {!isQuizSubmitted ? (
                                <button onClick={handleSubmitQuiz} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Submit Quiz</button>
                            ) : (
                                <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
                                    <h4 className="text-xl font-bold text-white">Quiz Complete!</h4>
                                    <p className="text-lg text-gray-300 my-2">Your Score: <span className="font-bold text-indigo-400">{quizResult?.score}%</span> ({quizResult?.correct}/{quizResult?.total})</p>
                                    <button onClick={handleContinue} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg">Continue</button>
                                </div>
                            )}
                        </div>
                    )}
                    {!currentLesson.completed && !currentLesson.quiz && activeLesson && (
                        <button onClick={() => onMarkComplete(course.id, activeLesson.chap, activeLesson.less, currentLesson.xp)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Mark as Complete</button>
                    )}
                    {currentLesson.completed && (<p className="text-green-400 font-semibold text-lg flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Lesson Completed!</p>)}
                </div>) : <p className="text-white">Select a lesson to start.</p>}
            </main>
        </div>
    );
};

const Profile: React.FC<{ user: User }> = ({ user }) => { return ( <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg text-white"><h2 className="text-3xl font-bold mb-6">Your Profile</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-500" /><h3 className="text-2xl font-semibold text-center mt-4">{user.name}</h3></div><div className="space-y-4 text-lg"><p><strong>Level:</strong> {user.level}</p><p><strong>Total XP:</strong> {user.xp}</p><p><strong>Current Streak:</strong> {user.streak} days 🔥</p><p><strong>Last Completed:</strong> {user.lastCompletedDate || 'N/A'}</p></div></div><div className="mt-8"><h3 className="text-2xl font-bold mb-4">Quiz History</h3>{user.quizHistory.length > 0 ? (<ul className="space-y-2">{user.quizHistory.map((q, i) => (<li key={i} className="bg-gray-700 p-3 rounded-md flex justify-between"><span>{q.quizTitle}</span><span className={q.score > 70 ? 'text-green-400' : 'text-yellow-400'}>Score: {q.score}% ({q.correct}/{q.total})</span></li>))}</ul>) : <p className="text-gray-400">No quiz history yet.</p>}</div></div> ); };
const Chatbot: React.FC<{ onClose: () => void; }> = ({ onClose }) => { const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', parts: [{ text: "Hello! I'm LearnSphere Tutor." }] }]); const [input, setInput] = useState(''); const [isLoading, setIsLoading] = useState(false); const messagesEndRef = useRef<HTMLDivElement>(null); useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]); const handleSendMessage = async (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || isLoading) return; const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] }; setMessages(prev => [...prev, userMessage]); setInput(''); setIsLoading(true); try { const response = await axios.post<{ reply: string }>('http://localhost:5001/api/chat', { message: input, history: messages }); const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.data.reply }] }; setMessages(prev => [...prev, modelMessage]); } catch (error: any) { const serverErrorMessage = error.response?.data?.message || "Sorry, I'm having trouble connecting."; const errorMessage: ChatMessage = { role: 'model', parts: [{ text: serverErrorMessage }] }; setMessages(prev => [...prev, errorMessage]); } finally { setIsLoading(false); } }; return ( <div className="fixed bottom-24 right-5 w-96 h-[60vh] bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-700"><header className="bg-gray-900 p-3 flex justify-between items-center rounded-t-lg"><h3 className="text-lg font-bold text-white">AI Tutor</h3><button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button></header><div className="flex-1 p-4 overflow-y-auto">{messages.map((msg, index) => (<div key={index} className={`mb-3 p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 ml-auto' : 'bg-gray-700'}`}><p className="text-white text-sm whitespace-pre-wrap">{msg.parts[0].text}</p></div>))}{isLoading && <div className="bg-gray-700 p-3 rounded-lg max-w-[85%]"><p className="text-white text-sm italic">Tutor is typing...</p></div>}<div ref={messagesEndRef} /></div><form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700"><div className="flex items-center bg-gray-700 rounded-lg"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." className="w-full bg-transparent p-2 text-white focus:outline-none" disabled={isLoading} /><button type="submit" className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg m-1" disabled={isLoading}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button></div></form></div> ); };
const SignInPage: React.FC = () => { return ( <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center"><div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl"><h1 className="text-5xl font-bold text-white mb-3">Welcome to LearnSphere</h1><p className="text-gray-400 mb-8 text-lg">Your personal AI-powered learning platform.</p><div className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"><SignInButton /></div></div></div> ); };

const LearnSphereApp: React.FC = () => {
    const { user: clerkUser, isLoaded } = useUser();
    const [user, setUser] = useState<User>({ name: 'New Learner', xp: 0, level: 1, streak: 0, avatarUrl: '', lastCompletedDate: null, quizHistory: [] });
    const [view, setView] = useState<View>('dashboard');
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [generatingImages, setGeneratingImages] = useState(new Set<string>());
    const [sidebarCollapsed] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);

    // Load user XP data from backend when user is loaded
    useEffect(() => {
        if (isLoaded && clerkUser) {
            setUser(prev => ({
                ...prev,
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
            
            setUser(prev => ({
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
            setUser(prevUser => ({
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
            case 'generate': return <CourseGenerator onCourseCreated={handleAddCourse} />;
            case 'learn': if(activeCourse) { return <LearningView course={activeCourse} onMarkComplete={handleMarkLessonComplete} quizProgress={quizProgress} onUpdateQuizProgress={handleUpdateQuizProgress} />; } else { setView('dashboard'); return null; }
            case 'profile': return <Profile user={user} />;
            default: return <ModernDashboard courses={courses} user={user} onStartLearning={handleStartLearning} onCreateNew={() => setView('generate')} onDeleteCourse={handleDeleteCourse} isLoading={isLoading} error={fetchError} generatingImages={generatingImages} />;
        }
    };
    
    return (
        <div className="relative min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Progress Bar */}
            <ProgressBar progress={overallProgress} />
            
            {/* Sidebar */}
            <Sidebar user={user} onNavigate={setView} currentView={view} />
            
            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                <Header user={user} onNavigate={setView} currentView={view} />
                <main className="p-4 sm:p-6 lg:p-8">
                    {renderContent()}
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
    <>
        <SignedOut><SignInPage /></SignedOut>
        <SignedIn><LearnSphereApp /></SignedIn>
    </>
);

export default App;