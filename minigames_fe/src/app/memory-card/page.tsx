'use client';

import { useEffect } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';

export default function MemoryCardPage() {
  useEffect(() => {
    // Redirect to the HTML5 Memory Card game
    window.location.href = '/games/memory-card/index.html';
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Đang chuyển hướng đến Memory Card...</h1>
          <p className="text-gray-600 mb-6">Game lật thẻ nhớ với nhiều cấp độ và tính thời gian!</p>
          <a 
            href="/games/memory-card/index.html" 
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Chơi Memory Card ngay
          </a>
        </div>
      </div>
    </AuthGuard>
  );
}

