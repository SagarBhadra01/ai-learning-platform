import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Plus, User } from 'lucide-react';
import type { View } from './types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen = false, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    // Initialize sidebar state for mobile
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems: Array<{ id: View; label: string; icon: React.ComponentType<any> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bookmarks', label: 'Bookmarks', icon: BookOpen },
    { id: 'generate', label: 'Create Course', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-full bg-gradient-to-b from-white via-blue-50 to-white border-r border-gray-200 z-40 transition-all duration-300 backdrop-blur-sm ${
        (isCollapsed && !isOpen) ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
      }`}>
        {/* Mobile Close Button */}
        {(!isCollapsed || isOpen) && (
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => {
                setIsCollapsed(true);
                onClose?.();
              }}
              className="text-white hover:text-purple-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Brand */}
        {!isCollapsed && (
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div>
                <div className="font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-gray-800 bg-clip-text text-transparent text-base lg:text-lg">Navigation</div>
                <div className="text-xs text-gray-600">Quick Access</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (window.innerWidth < 1024) {
                    setIsCollapsed(true);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 text-blue-800 shadow-lg'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                }`}
              >
                <div className={`flex-shrink-0 transition-transform duration-200 ${
                  currentView === item.id ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {(!isCollapsed || isOpen) && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
                {(!isCollapsed || isOpen) && currentView === item.id && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </nav>      
      </div>
    </>
  );
};
