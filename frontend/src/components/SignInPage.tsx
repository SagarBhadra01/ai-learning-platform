import React, { useEffect, useState } from 'react';
import { SignInButton } from '@clerk/clerk-react';


const SignInPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-blue-100 to-orange-100">
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-300/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-300/10 to-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-orange-400/15 to-orange-600/15 rounded-full blur-xl animate-ping"></div>

        {/* Animated Line */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
              </linearGradient>
            </defs>
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="url(#gradient1)" strokeWidth="0.5" fill="none" className="animate-pulse">
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="M0,50 Q25,30 50,50 T100,50;
                        M0,50 Q25,70 50,50 T100,50;
                        M0,50 Q25,30 50,50 T100,50"
              />
            </path>
          </svg>
        </div>
      </div>

      {/* Mouse follower */}
      <div
        className="absolute w-96 h-96 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4">
        <div className="text-center p-12 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-white/10">
          
          {/* Logo */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
          </div>

          {/* Typography */}
          <h1 className="text-5xl md:text-6xl font-bold text-blue-700 mb-6 leading-tight">
            Welcome to
            <span className="block text-4xl md:text-5xl bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              LearnSphere
            </span>
          </h1>

          <p className="text-black mb-10 text-xl leading-relaxed font-light">
            Embark on an extraordinary journey of knowledge with our AI-powered learning universe
          </p>

          {/* Platform Description INSIDE the box */}
          <div className="text-left text-black text-base leading-relaxed font-normal mt-6">
            <p className="mb-4">
              This platform is an AI-powered learning solution that makes education more personalized, engaging, and effective. 
            </p>
            {/* <p>
              With secure authentication, clean UI/UX, and real-time progress tracking, it ensures a seamless and interactive learning experience.
            </p> */}
          </div>

          {/* Sign In Button */}
            <div className="relative group my-8">
              <SignInButton>
                <button className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 text-white font-bold py-4 px-24 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  Sign In
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              </SignInButton>
            </div>

          {/* Decorative Dots */}
          <div className="flex justify-center space-x-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Tilt effect */}
      <style>{`
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .animate-tilt:hover {
          animation: tilt 0.6s ease-in-out;
        }
      `}</style>

      
    </div>
  );
};

export default SignInPage;