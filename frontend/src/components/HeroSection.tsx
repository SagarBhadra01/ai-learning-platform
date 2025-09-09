import React, { useState, useEffect } from 'react';
import type { User } from './types';

interface HeroSectionProps {
  user: User;
  onCreateCourse: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, onCreateCourse }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setAnimateStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const calculateXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (user.streak > 7) return "You're on fire! Keep that streak going!";
    if (user.streak > 3) return "Great consistency! You're building a strong learning habit!";
    if (user.level > 5) return "Look at you go! You're becoming a learning expert!";
    return "Ready to learn something new today? Let's get started!";
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Neural Network Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="neural-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <line x1="10" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="10" y1="10" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0">
          {/* Welcome Content */}
          <div className={`flex-1 mb-6 lg:mb-0 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                {getGreeting()}, {user.name}!
              </h1>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-base sm:text-lg lg:text-xl text-purple-200 font-medium">
                  {getMotivationalMessage()}
                </p>
              </div>
            </div>
            
            {/* Enhanced Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className={`group bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-xl ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-base sm:text-lg">Level {user.level}</div>
                    <div className="text-yellow-200 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{user.xp.toLocaleString()} XP Total</span>
                      <span className="sm:hidden">{user.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`group bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-xl ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '100ms'}}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-base sm:text-lg">
                      <span className="hidden sm:inline">{user.streak} Day Streak</span>
                      <span className="sm:hidden">{user.streak} Days</span>
                    </div>
                    <div className="text-orange-200 text-xs sm:text-sm">Keep it burning!</div>
                  </div>
                </div>
              </div>

              <div className={`group bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-xl ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} sm:col-span-2 lg:col-span-1`} style={{transitionDelay: '200ms'}}>
                <button 
                  onClick={onCreateCourse}
                  className="w-full flex items-center space-x-3 text-left group-hover:text-white transition-colors duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-base sm:text-lg">Create Course</div>
                    <div className="text-purple-200 text-xs sm:text-sm">Start learning now</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Visual Element */}
          <div className={`flex-shrink-0 lg:ml-8 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{transitionDelay: '300ms'}}>
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-2 sm:border-4 border-white/20 shadow-xl object-cover"
                  />
                </div>
              </div>
              
              {/* Floating Achievement Badges */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xl animate-bounce">
                {user.level}
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-spin" style={{animationDuration: '20s'}}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full shadow-lg"></div>
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg"></div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-pink-400 rounded-full shadow-lg"></div>
                <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Section */}
        <div className={`mt-6 sm:mt-8 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '600ms'}}>
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md sm:rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-purple-200 font-medium text-sm sm:text-base">Level {user.level} Progress</span>
              </div>
              <span className="text-white font-bold bg-gradient-to-r from-purple-500 to-pink-500 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {user.xpToNextLevel ? `${Math.max(0, (calculateXPForLevel(user.level + 1) - user.xpToNextLevel))}/${calculateXPForLevel(user.level + 1)}` : `${user.xp % 100}/100`} XP
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-700/50 rounded-full h-3 sm:h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ 
                    width: user.xpToNextLevel 
                      ? `${Math.max(0, Math.min(100, ((calculateXPForLevel(user.level + 1) - user.xpToNextLevel) / calculateXPForLevel(user.level + 1)) * 100))}%`
                      : `${(user.xp % 100)}%`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
