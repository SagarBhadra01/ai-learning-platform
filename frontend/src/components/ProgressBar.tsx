import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
