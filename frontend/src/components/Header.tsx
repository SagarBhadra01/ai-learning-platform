import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import type { View, User } from './types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  user: User;
  onNavigate: (view: View) => void;
  currentView: View;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, currentView }) => {
  return (
    <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-8">
        <h1 
          className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-400 transition-colors" 
          onClick={() => onNavigate('dashboard')}
        >
          LearnSphere
        </h1>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium ${
              currentView === 'dashboard' ? 'text-indigo-400' : ''
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('profile')} 
            className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium ${
              currentView === 'profile' ? 'text-indigo-400' : ''
            }`}
          >
            Profile
          </button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Quick Stats */}
        <div className="hidden lg:flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-yellow-400">
            <span>⭐</span>
            <span className="font-semibold">{user.level}</span>
          </div>
          <div className="flex items-center space-x-1 text-indigo-400">
            <span>🎯</span>
            <span className="font-semibold">{user.xp} XP</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-400">
            <span>🔥</span>
            <span className="font-semibold">{user.streak}</span>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors" 
            onClick={() => onNavigate('profile')}
          >
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Level {user.level}</div>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
};
