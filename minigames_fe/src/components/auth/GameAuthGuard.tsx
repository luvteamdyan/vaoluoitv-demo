'use client';

import React, { useEffect, ReactNode } from 'react';

interface GameAuthGuardProps {
  children?: ReactNode;
  gameTitle: string;
  gameDescription?: string;
  redirectUrl: string;
  themeColor?: string;
}

/**
 * GameAuthGuard Component
 * 
 * Redirects to game HTML page. Auth is handled by parent nextjs app.
 * 
 * @param gameTitle - Title of the game (e.g., "2048", "Flappy Bird")
 * @param gameDescription - Optional description of the game
 * @param redirectUrl - URL to redirect to (e.g., "/games/2048/index.html")
 * @param themeColor - Optional theme color for the guard (e.g., "orange", "blue", "green")
 * @param children - Optional custom content to render
 * 
 * @example
 * <GameAuthGuard
 *   gameTitle="2048"
 *   gameDescription="Kết hợp các số và đạt được ô 2048!"
 *   redirectUrl="/games/2048/index.html"
 *   themeColor="orange"
 * />
 */
export const GameAuthGuard: React.FC<GameAuthGuardProps> = ({
  children,
  gameTitle,
  gameDescription = 'Chơi game và nhận phần thưởng!',
  redirectUrl,
  themeColor = 'blue'
}) => {

  useEffect(() => {
    // Always redirect to the game, auth is handled by parent nextjs app
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://games-api.vaoluoitv.com';
    (window as Window & { __MINIGAMES_API_URL__?: string }).__MINIGAMES_API_URL__ = apiUrl;
    
    // Also add as URL parameter for fallback
    const url = new URL(redirectUrl, window.location.origin);
    url.searchParams.set('apiUrl', apiUrl);
    
    // Redirect to the game immediately
    window.location.href = url.toString();
  }, [redirectUrl]);

  // Theme color mapping
  const themeColors = {
    orange: {
      gradient: 'from-orange-50 to-red-100',
      button: 'bg-orange-500 hover:bg-orange-600',
      text: 'text-orange-600'
    },
    blue: {
      gradient: 'from-blue-50 to-indigo-100',
      button: 'bg-blue-500 hover:bg-blue-600',
      text: 'text-blue-600'
    },
    green: {
      gradient: 'from-green-50 to-emerald-100',
      button: 'bg-green-500 hover:bg-green-600',
      text: 'text-green-600'
    },
    purple: {
      gradient: 'from-purple-50 to-violet-100',
      button: 'bg-purple-500 hover:bg-purple-600',
      text: 'text-purple-600'
    },
    pink: {
      gradient: 'from-pink-50 to-rose-100',
      button: 'bg-pink-500 hover:bg-pink-600',
      text: 'text-pink-600'
    },
    yellow: {
      gradient: 'from-yellow-50 to-amber-100',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      text: 'text-yellow-600'
    }
  };

  const colors = themeColors[themeColor as keyof typeof themeColors] || themeColors.blue;

  // Show redirecting state - Auth is handled by parent nextjs app
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-bounce">
            <svg 
              className={`h-16 w-16 ${colors.text}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Đang chuyển hướng đến {gameTitle}...
        </h1>
        
        <p className="text-gray-600 mb-6">{gameDescription}</p>
      </div>
      
      {children}
    </div>
  );
};

export default GameAuthGuard;

