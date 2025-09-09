import React from 'react';
import type { User } from './types';

interface HeroSectionProps {
  user: User;
  onCreateCourse: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, onCreateCourse }) => {
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
    if (user.streak > 7) return "You're on fire! Keep that streak going! 🔥";
    if (user.streak > 3) return "Great consistency! You're building a strong learning habit! 💪";
    if (user.level > 5) return "Look at you go! You're becoming a learning expert! 🚀";
    return "Ready to learn something new today? Let's get started! ✨";
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-2xl p-8 mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Welcome Content */}
          <div className="flex-1 mb-6 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
              {getGreeting()}, {user.name}! 👋
            </h1>
            <p className="text-xl text-indigo-200 mb-4">
              {getMotivationalMessage()}
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Level {user.level}</div>
                  <div className="text-indigo-200 text-sm">{user.xp} XP Total</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{user.streak} Day Streak</div>
                  <div className="text-indigo-200 text-sm">Keep it up!</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{user.quizHistory.length} Quizzes</div>
                  <div className="text-indigo-200 text-sm">Completed</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onCreateCourse}
              className="bg-white text-indigo-900 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Create New Course
            </button>
          </div>

          {/* Visual Element */}
          <div className="flex-shrink-0 lg:ml-8">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.level}
              </div>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mt-6 p-4 bg-black bg-opacity-20 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-indigo-200 text-sm">Level {user.level} Progress</span>
            <span className="text-white text-sm font-semibold">
              {user.xpToNextLevel ? `${Math.max(0, (calculateXPForLevel(user.level + 1) - user.xpToNextLevel))}/${calculateXPForLevel(user.level + 1)}` : `${user.xp % 100}/100`} XP
            </span>
          </div>
          <div className="w-full bg-indigo-800 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: user.xpToNextLevel 
                  ? `${Math.max(0, Math.min(100, ((calculateXPForLevel(user.level + 1) - user.xpToNextLevel) / calculateXPForLevel(user.level + 1)) * 100))}%`
                  : `${(user.xp % 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
