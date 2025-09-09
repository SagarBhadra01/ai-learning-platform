import React from 'react';
import type { Course } from './types';

interface CourseProgressCardProps {
  course: Course;
  onContinueLearning: (courseId: string) => void;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ course, onContinueLearning }) => {
  // Calculate progress
  const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const completedLessons = course.chapters.reduce((total, chapter) => 
    total + chapter.lessons.filter(lesson => lesson.completed).length, 0
  );
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Get current lesson info
  const getCurrentLesson = () => {
    for (let chapterIndex = 0; chapterIndex < course.chapters.length; chapterIndex++) {
      const chapter = course.chapters[chapterIndex];
      for (let lessonIndex = 0; lessonIndex < chapter.lessons.length; lessonIndex++) {
        if (!chapter.lessons[lessonIndex].completed) {
          return {
            chapterTitle: chapter.title,
            lessonTitle: chapter.lessons[lessonIndex].title,
            chapterIndex,
            lessonIndex
          };
        }
      }
    }
    return null;
  };

  const currentLesson = getCurrentLesson();
  const isCompleted = progressPercentage === 100;

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{course.title}</h3>
            <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full text-white ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-400">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Progress</span>
          <span className="text-sm text-gray-400">{completedLessons}/{totalLessons} lessons</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current Lesson or Completion Status */}
      {isCompleted ? (
        <div className="flex items-center justify-between p-3 bg-green-900 bg-opacity-50 rounded-lg border border-green-500">
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-xl">🎉</span>
            <span className="text-green-300 font-semibold">Course Completed!</span>
          </div>
          <button
            onClick={() => onContinueLearning(course.id)}
            className="text-green-400 hover:text-green-300 text-sm font-medium"
          >
            Review →
          </button>
        </div>
      ) : currentLesson ? (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-900 bg-opacity-50 rounded-lg border border-indigo-500">
            <div className="text-sm text-indigo-300 mb-1">Next up:</div>
            <div className="text-white font-semibold">{currentLesson.lessonTitle}</div>
            <div className="text-indigo-400 text-sm">in {currentLesson.chapterTitle}</div>
          </div>
          
          <button
            onClick={() => onContinueLearning(course.id)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Continue Learning →
          </button>
        </div>
      ) : (
        <button
          onClick={() => onContinueLearning(course.id)}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
        >
          Start Course →
        </button>
      )}

      {/* Course Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{course.chapters.length} chapters</span>
          <span>{totalLessons} lessons</span>
        </div>
      </div>
    </div>
  );
};
