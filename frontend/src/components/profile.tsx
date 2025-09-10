import React from 'react';
import { Star, Flame, Trophy, Target, Crown, Zap } from 'lucide-react';
import type { User } from './index';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const calculateXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const getAchievementBadges = () => {
    const badges = [];
    if (user.streak >= 7) badges.push({ icon: Flame, title: 'Week Warrior', desc: '7+ day streak' });
    if (user.streak >= 30) badges.push({ icon: Zap, title: 'Month Master', desc: '30+ day streak' });
    if (user.level >= 5) badges.push({ icon: Star, title: 'Rising Star', desc: 'Reached Level 5' });
    if (user.level >= 10) badges.push({ icon: Crown, title: 'Learning King', desc: 'Reached Level 10' });
    if (user.quizHistory.length >= 10) badges.push({ icon: Target, title: 'Quiz Master', desc: '10+ quizzes completed' });
    return badges;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <div className="w-36 h-36 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl animate-bounce border-4 border-white/90">
                {user.level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {user.name}
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <Star className="w-6 h-6 mb-1 text-yellow-500" />
                  <div className="text-blue-900 font-bold text-lg">Level {user.level}</div>
                  <div className="text-blue-700 text-sm font-medium">{user.xp.toLocaleString()} XP</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <Flame className="w-6 h-6 mb-1 text-orange-500" />
                  <div className="text-blue-900 font-bold text-lg">{user.streak} Days</div>
                  <div className="text-blue-700 text-sm font-medium">Current Streak</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-medium">Level {user.level} Progress</span>
                  <span className="text-white font-bold bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full text-sm shadow-md">
                    {user.xpToNextLevel ? `${Math.max(0, (calculateXPForLevel(user.level + 1) - user.xpToNextLevel))}/${calculateXPForLevel(user.level + 1)}` : `${user.xp % 100}/100`} XP
                  </span>
                </div>
                <div className="w-full bg-blue-300 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-inner"
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

      {/* Achievement Badges */}
      {getAchievementBadges().length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Achievement Badges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAchievementBadges().map((badge, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-200">
                <badge.icon className="w-10 h-10 mb-3 mx-auto text-yellow-600" />
                <h3 className="font-bold text-gray-900 text-lg mb-1">{badge.title}</h3>
                <p className="text-gray-600 text-sm">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;