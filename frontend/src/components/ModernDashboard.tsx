import React, { useState, useEffect } from 'react';
import { CheckCircle, Rocket } from 'lucide-react';
import type { Course, User } from './types';
import { HeroSection } from './HeroSection';
import { ContinueLearning } from './ContinueLearning';
import { EnhancedCourseCard } from './EnhancedCourseCard';

interface ModernDashboardProps {
  courses: Course[];
  user: User;
  onStartLearning: (id: string) => void;
  onCreateNew: () => void;
  onDeleteCourse?: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  generatingImages: Set<string>;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  courses, 
  user,
  onStartLearning, 
  onCreateNew, 
  onDeleteCourse,
  isLoading, 
  error, 
  generatingImages 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (isLoading) { 
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mt-2 ml-2" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          <div className="text-gray-800 text-2xl font-bold mb-2 animate-pulse">Generating AI-Powered Content...</div>
          <div className="text-blue-600 text-sm">Crafting your personalized learning experience</div>
        </div>
      </div>
    ); 
  }
  
  if (error) { 
    return (
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-red-50 to-red-100 backdrop-blur-sm border border-red-300 text-gray-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-6xl mb-4 animate-bounce">⚠️</div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">Connection Error</h3>
        <p className="text-red-700 mb-6 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Try Again
        </button>
      </div>
    ); 
  }

  // Separate completed and available courses
  const completedCourses = courses.filter(course => {
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const completedLessons = course.chapters.reduce((total, chapter) => 
      total + chapter.lessons.filter(lesson => lesson.completed).length, 0
    );
    return completedLessons === totalLessons && totalLessons > 0;
  });

  const availableCourses = courses.filter(course => {
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const completedLessons = course.chapters.reduce((total, chapter) => 
      total + chapter.lessons.filter(lesson => lesson.completed).length, 0
    );
    return completedLessons < totalLessons;
  });

  return (
    <div className={`w-full space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Hero Section */}
      <HeroSection user={user} onCreateCourse={onCreateNew} />

      {/* Continue Learning Section */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{transitionDelay: '200ms'}}>
        <ContinueLearning courses={courses} onContinueLearning={onStartLearning} />
      </div>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{transitionDelay: '400ms'}}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3">Available Courses</h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Discover new topics and expand your knowledge with AI-powered learning</p>
            </div>
            <button 
              onClick={onCreateNew} 
              className="group bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-3 px-4 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border border-white/20 w-full sm:w-auto"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Create New Course</span>
                <span className="sm:hidden">Create Course</span>
              </div>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {availableCourses.map((course, index) => (
              <div 
                key={course.id}
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{transitionDelay: `${600 + index * 100}ms`}}
              >
                <EnhancedCourseCard 
                  course={course} 
                  onStartLearning={onStartLearning} 
                  onDeleteCourse={onDeleteCourse}
                  isImageLoading={generatingImages.has(course.id)} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{transitionDelay: '800ms'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Completed Courses</h2>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-100 to-emerald-200 backdrop-blur-sm border border-emerald-300 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 font-medium">{completedCourses.length} completed</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {completedCourses.map((course, index) => (
              <div 
                key={course.id} 
                className={`group bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-emerald-300 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{transitionDelay: `${1000 + index * 100}ms`}}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-bold text-sm group-hover:text-emerald-600 transition-colors">{course.title}</h3>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 text-xs font-medium">Completed</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onStartLearning(course.id)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Review Course
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && !isLoading && (
        <div className={`text-center bg-gradient-to-br from-white via-blue-50 to-white backdrop-blur-sm border border-gray-200 p-16 rounded-3xl shadow-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative mb-8">
            <Rocket className="w-20 h-20 mx-auto animate-bounce text-blue-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-gray-800 bg-clip-text text-transparent mb-4 sm:mb-6">Welcome to AI LearnSphere!</h3>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Embark on your personalized learning journey powered by cutting-edge AI technology. 
            Create courses tailored to your interests and skill level.
          </p>
          <button 
            onClick={onCreateNew} 
            className="group bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-4 px-6 sm:py-6 sm:px-12 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg sm:text-xl border border-white/20"
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Generate Your First Course</span>
              <span className="sm:hidden">Create First Course</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
