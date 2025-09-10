import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { 
  ModernDashboard, 
  Header, 
  Sidebar, 
  ProgressBar,
  BookmarkedCourses
} from './components';
import CourseGenerator from './components/CourseGenerator';
import LearningView from './components/LearningView';
import Profile from './components/profile';
import Chatbot from './components/chat';
import SignInPage from './components/SignInPage';
import type { 
  View, 
  User, 
  Course, 
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