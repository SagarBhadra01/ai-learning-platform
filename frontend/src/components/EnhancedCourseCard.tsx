import React, { useState } from 'react';
import type { Course } from './types';

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
      case 'Beginner': return '🌱';
      case 'Intermediate': return '🚀';
      case 'Advanced': return '⚡';
      default: return '📚';
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
      className="bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden relative transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-indigo-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete Button */}
      {onDeleteCourse && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
          title="Delete Course"
        >
          🗑️
        </button>
      )}

      {/* Difficulty Badge */}
      <div className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full z-10 flex items-center space-x-1 ${getLevelColor(course.level)}`}>
        <span>{getLevelIcon(course.level)}</span>
        <span>{course.level}</span>
      </div>

      {/* Progress Badge (if started) */}
      {progressPercentage > 0 && (
        <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
          {Math.round(progressPercentage)}% Complete
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
        {isImageLoading ? (
          <div className="w-full h-full bg-gray-600 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
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
              <div className="text-center text-white p-4">
                <div className="text-lg font-bold mb-2">Course Preview</div>
                <div className="text-sm opacity-90">
                  {course.chapters.length} chapters • {totalLessons} lessons
                </div>
                {progressPercentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
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
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
        <p className="text-gray-400 mb-4 flex-grow line-clamp-3">{course.description}</p>
        
        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>📚</span>
              <span>{course.chapters.length} chapters</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🎯</span>
              <span>{totalLessons} lessons</span>
            </span>
          </div>
        </div>

        {/* Progress Bar (if started) */}
        {progressPercentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-400">{completedLessons}/{totalLessons}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={() => onStartLearning(course.id)} 
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform ${
            progressPercentage > 0
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
        >
          {progressPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-xl" />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 rounded-xl">
          <div className="bg-gray-800 p-6 rounded-lg border border-red-500 max-w-sm">
            <h3 className="text-white font-bold text-lg mb-2">Delete Course?</h3>
            <p className="text-gray-300 text-sm mb-4">
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
