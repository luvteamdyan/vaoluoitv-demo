'use client';

import { useEffect } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';

export default function BreakoutPage() {
  useEffect(() => {
    // Redirect to the HTML5 Breakout game
    window.location.href = '/games/breakout/index.html';
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Đang chuyển hướng đến Breakout...</h1>
          <p className="text-gray-600 mb-6">Game đập gạch kinh điển với power-ups và âm thanh!</p>
          <a 
            href="/games/breakout/index.html" 
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Chơi Breakout ngay
          </a>
        </div>
      </div>
    </AuthGuard>
  );
}

