import React from 'react';
import type { Course } from './types';
import { CourseProgressCard } from './CourseProgressCard';

interface ContinueLearningProps {
  courses: Course[];
  onContinueLearning: (courseId: string) => void;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ courses, onContinueLearning }) => {
  // Filter courses that have been started but not completed
  const inProgressCourses = courses.filter(course => {
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const completedLessons = course.chapters.reduce((total, chapter) => 
      total + chapter.lessons.filter(lesson => lesson.completed).length, 0
    );
    return completedLessons > 0 && completedLessons < totalLessons;
  });

  if (inProgressCourses.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Continue Learning</h2>
          <p className="text-gray-600">Pick up where you left off</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <span className="text-sm font-medium">{inProgressCourses.length} in progress</span>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inProgressCourses.map(course => (
          <CourseProgressCard
            key={course.id}
            course={course}
            onContinueLearning={onContinueLearning}
          />
        ))}
      </div>
    </div>
  );
};
