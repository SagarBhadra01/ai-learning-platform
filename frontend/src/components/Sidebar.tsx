import React, { useState } from 'react';
import type { View, User } from './types';

interface SidebarProps {
  user: User;
  onNavigate: (view: View) => void;
  currentView: View;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onNavigate, currentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'generate', label: 'Create Course', icon: '➕' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-white">LearnSphere</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-indigo-500" 
              />
              <div>
                <div className="font-semibold text-white text-sm">{user.name}</div>
                <div className="text-xs text-gray-400">Level {user.level} • {user.xp} XP</div>
              </div>
            </div>
            
            {/* Streak */}
            <div className="mt-3 p-2 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Streak</span>
                <span className="text-orange-400 font-bold">{user.streak} 🔥</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as View)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Progress Summary */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300 mb-2">Level Progress</div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(user.xp % 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {user.xp % 100}/100 XP to Level {user.level + 1}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`} />
    </>
  );
};
