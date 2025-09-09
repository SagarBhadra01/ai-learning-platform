import React from 'react';
import type { Course } from './types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { EnhancedCourseCard } from './EnhancedCourseCard';

interface BookmarkedCoursesProps {
  courses: Course[];
  onStartLearning: (id: string) => void;
  onDeleteCourse?: (id: string) => void;
  generatingImages: Set<string>;
}

export const BookmarkedCourses: React.FC<BookmarkedCoursesProps> = ({
  courses,
  onStartLearning,
  onDeleteCourse,
  generatingImages
}) => {
  const { bookmarkedCourses } = useBookmarks();

  // Filter courses to show only bookmarked ones
  const bookmarkedCourseList = courses.filter(course => 
    bookmarkedCourses.includes(course.id)
  );

  if (bookmarkedCourseList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-6">📚</div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Bookmarked Courses</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
            You haven't bookmarked any courses yet. Start exploring and bookmark courses you want to save for later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bookmarked Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved courses ({bookmarkedCourseList.length} course{bookmarkedCourseList.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30 px-4 py-2 rounded-full">
          <span className="text-yellow-600 dark:text-yellow-400">⭐</span>
          <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
            {bookmarkedCourseList.length} bookmarked
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarkedCourseList.map(course => (
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
  );
};
