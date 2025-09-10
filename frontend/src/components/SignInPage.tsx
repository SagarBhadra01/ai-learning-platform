import React from 'react';
import { SignInButton } from '@clerk/clerk-react';

const SignInPage: React.FC = () => { 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col justify-center items-center p-4">
      <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-14 h-14 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
            />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to LearnSphere
        </h1>
        
        <p className="text-blue-100 mb-8 text-lg">
          Your personal AI-powered learning platform.
        </p>
        
        <div className="inline-block bg-white hover:bg-gray-100 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          <SignInButton />
        </div>
      </div>
    </div>
  ); 
};

export default SignInPage;
