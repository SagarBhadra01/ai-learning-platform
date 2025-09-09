import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BookmarkContextType {
  bookmarkedCourses: string[];
  toggleBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('learnsphere-bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('learnsphere-bookmarks', JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const isBookmarked = (courseId: string) => {
    return bookmarkedCourses.includes(courseId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedCourses, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};
