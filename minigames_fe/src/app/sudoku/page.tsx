'use client';

import { useEffect } from 'react';
import AuthGuard from '../../components/auth/AuthGuard';

export default function SudokuPage() {
  useEffect(() => {
    // Redirect to the HTML5 Sudoku game
    window.location.href = '/games/sudoku/index.html';
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Đang chuyển hướng đến Sudoku...</h1>
          <p className="text-gray-600">Nếu không tự động chuyển hướng, hãy click vào link bên dưới:</p>
          <a 
            href="/games/sudoku/index.html" 
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Chơi Sudoku
          </a>
        </div>
      </div>
    </AuthGuard>
  );
}
