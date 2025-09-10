import React, { useState } from 'react';
import { Sprout, Rocket, Zap, BookOpen, Target, Trash2 } from 'lucide-react';
import type { Course } from './types';
import { BookmarkButton } from './BookmarkButton';

interface EnhancedCourseCardProps {
  course: Course;
  onStartLearning: (id: string) => void;
  onDeleteCourse?: (id: string) => void;
  isImageLoading: boolean;
}

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({ 
  course, 
  onStartLearning, 
  onDeleteCourse,
  isImageLoading 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteCourse) {
      onDeleteCourse(course.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500 text-green-100';
      case 'Intermediate': return 'bg-yellow-500 text-yellow-100';
      case 'Advanced': return 'bg-red-500 text-red-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getLevelIcon = (level: Course['level']) => {
    switch (level) {
      case 'Beginner': return Sprout;
      case 'Intermediate': return Rocket;
      case 'Advanced': return Zap;
      default: return BookOpen;
    }
  };

  // Calculate course stats
  const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const completedLessons = course.chapters.reduce((total, chapter) => 
    total + chapter.lessons.filter(lesson => lesson.completed).length, 0
  );
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 hover:border-blue-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action Buttons */}
      <div className="absolute top-2 left-2 z-20 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <BookmarkButton courseId={course.id} className="bg-white shadow-lg" />
        {onDeleteCourse && (
          <button
            onClick={handleDeleteClick}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="Delete Course"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Difficulty Badge */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-full z-10 flex items-center space-x-1 ${getLevelColor(course.level)}`}>
        {React.createElement(getLevelIcon(course.level), { className: "w-3 h-3" })}
        <span>{course.level}</span>
      </div>

      {/* Progress Badge (if started) */}
      {progressPercentage > 0 && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
          <span className="hidden sm:inline">{Math.round(progressPercentage)}% Complete</span>
          <span className="sm:hidden">{Math.round(progressPercentage)}%</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {isImageLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className={`h-full w-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`} 
            />
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-center text-white p-3 sm:p-4">
                <div className="text-base sm:text-lg font-bold mb-2">Course Preview</div>
                <div className="text-xs sm:text-sm opacity-90">
                  <span className="hidden sm:inline">{course.chapters.length} chapters • {totalLessons} lessons</span>
                  <span className="sm:hidden">{course.chapters.length} ch • {totalLessons} lessons</span>
                </div>
                {progressPercentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow line-clamp-2 sm:line-clamp-3">{course.description}</p>
        
        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{course.chapters.length} chapters</span>
              <span className="sm:hidden">{course.chapters.length} ch</span>
            </span>
            <span className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>{totalLessons} lessons</span>
            </span>
          </div>
        </div>

        {/* Progress Bar (if started) */}
        {progressPercentage > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-500">{completedLessons}/{totalLessons}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={() => onStartLearning(course.id)} 
          className={`w-full font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 transform text-sm sm:text-base ${
            progressPercentage > 0
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
        >
          <span className="hidden sm:inline">{progressPercentage > 0 ? 'Continue Learning' : 'Start Learning'}</span>
          <span className="sm:hidden">{progressPercentage > 0 ? 'Continue' : 'Start'}</span>
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 opacity-20 blur-xl" />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 rounded-xl p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-red-500 max-w-xs sm:max-w-sm w-full">
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Delete Course?</h3>
            <p className="text-gray-700 text-xs sm:text-sm mb-4">
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
