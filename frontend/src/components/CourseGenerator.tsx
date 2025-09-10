import React, { useState } from 'react';
import { Sprout, Rocket, Zap, Sparkles, BookOpen, Target, Star, Brain, GraduationCap } from 'lucide-react';
import type { Course } from './index';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

interface CourseGeneratorProps {
  onCourseCreated: (course: Course) => void;
}

const CourseGenerator: React.FC<CourseGeneratorProps> = ({ onCourseCreated }) => {
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
                                                        {levelOption === 'Beginner' && <Sprout className="w-10 h-10 mx-auto" />}
                                                        {levelOption === 'Intermediate' && <Rocket className="w-10 h-10 mx-auto" />}
                                                        {levelOption === 'Advanced' && <Zap className="w-10 h-10 mx-auto" />}
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
                                <Sparkles className="w-8 h-8 mr-3 text-blue-600" />
                                AI-Powered Features
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: BookOpen, title: 'Structured Chapters', desc: 'Organized learning modules' },
                                    { icon: Target, title: 'Interactive Quizzes', desc: 'Test your knowledge' },
                                    { icon: Star, title: 'Progress Tracking', desc: 'Monitor your advancement' },
                                    { icon: Brain, title: 'Smart Content', desc: 'AI-generated explanations' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-emerald-50 transition-all duration-300">
                                        <feature.icon className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                                            <p className="text-gray-600 text-sm">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl p-8 text-center">
                            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-600" />
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

export default CourseGenerator;
