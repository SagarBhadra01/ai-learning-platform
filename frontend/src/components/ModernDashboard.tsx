import React from 'react';
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
  if (isLoading) { 
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading your courses...</div>
          <div className="text-gray-400 text-sm mt-2">This might take a moment</div>
        </div>
      </div>
    ); 
  }
  
  if (error) { 
    return (
      <div className="max-w-3xl mx-auto text-center bg-red-900 bg-opacity-50 border border-red-500 text-white p-8 rounded-xl">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-red-300 mb-4">Connection Error</h3>
        <p className="text-red-200 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <HeroSection user={user} onCreateCourse={onCreateNew} />

      {/* Continue Learning Section */}
      <ContinueLearning courses={courses} onContinueLearning={onStartLearning} />

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Available Courses</h2>
              <p className="text-gray-400">Discover new topics and expand your knowledge</p>
            </div>
            <button 
              onClick={onCreateNew} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ✨ Create New Course
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => (
              <EnhancedCourseCard 
                key={course.id} 
                course={course} 
                onStartLearning={onStartLearning} 
                onDeleteCourse={onDeleteCourse}
                isImageLoading={generatingImages.has(course.id)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-2xl font-bold text-white">Completed Courses</h2>
            <div className="flex items-center space-x-2 bg-green-900 bg-opacity-50 px-3 py-1 rounded-full">
              <span className="text-green-400 text-sm">🎉</span>
              <span className="text-green-300 text-sm font-medium">{completedCourses.length} completed</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedCourses.map(course => (
              <div key={course.id} className="bg-gray-800 rounded-lg p-4 border border-green-500 border-opacity-50">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{course.title}</h3>
                    <span className="text-green-400 text-xs">✓ Completed</span>
                  </div>
                </div>
                <button
                  onClick={() => onStartLearning(course.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
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
        <div className="text-center bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-2xl border border-gray-700">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-3xl font-bold text-white mb-4">Welcome to LearnSphere!</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            You haven't created any courses yet. Let's get started on your learning journey!
          </p>
          <button 
            onClick={onCreateNew} 
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            🎯 Generate Your First Course
          </button>
        </div>
      )}
    </div>
  );
};
