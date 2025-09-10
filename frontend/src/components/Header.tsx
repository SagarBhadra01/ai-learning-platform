import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';
import type { User } from './types';

interface HeaderProps {
  user: User;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200' 
        : 'bg-gradient-to-r from-white/90 via-blue-50/90 to-white/90 backdrop-blur-sm'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>
          {/* Mobile Menu Button & Logo */}
          <div className={`flex items-center space-x-3 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 border border-white/20">
                <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-gray-800 bg-clip-text text-transparent leading-tight">
                LearnSphere
              </h1>
              <p className="text-xs text-gray-600 font-medium hidden md:block">
                Next-Gen Learning Platform
              </p>
            </div>
          </div>

          {/* User Info and Controls */}
          <div className={`flex items-center space-x-1 sm:space-x-2 lg:space-x-4 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{transitionDelay: '200ms'}}>
            {/* User Stats */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <div className="group flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-orange-200 backdrop-blur-sm border border-orange-300 px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-gray-800 text-xs lg:text-sm font-bold">Level {user.level}</div>
                  <div className="text-orange-700 text-xs">{user.xp.toLocaleString()} XP</div>
                </div>
              </div>
              
              <div className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-emerald-200 backdrop-blur-sm border border-emerald-300 px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-gray-800 text-xs lg:text-sm font-bold">{user.streak} Days</div>
                  <div className="text-emerald-700 text-xs">Streak</div>
                </div>
              </div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Profile */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 backdrop-blur-sm border border-blue-300 px-2 sm:px-3 py-1 sm:py-2 rounded-xl hover:scale-105 transition-all duration-300">
                <div className="hidden sm:block text-right">
                  <div className="text-gray-800 text-xs sm:text-sm font-bold truncate max-w-16 sm:max-w-24">{user.name}</div>
                  <div className="text-blue-600 text-xs flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="hidden md:inline">Online</span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/30 shadow-xl hover:border-white/50 transition-all duration-300"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </header>
  );
};
