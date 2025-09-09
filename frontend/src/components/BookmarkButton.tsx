import React from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';

interface BookmarkButtonProps {
  courseId: string;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ courseId, className = '' }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(courseId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark(courseId);
      }}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {bookmarked ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
      )}
    </button>
  );
};
