'use client';

import AuthGuard from '../../components/auth/AuthGuard';
import GameAuthGuard from '../../components/auth/GameAuthGuard';

export default function Game2048Page() {
  return (
    <AuthGuard>
      <GameAuthGuard
        gameTitle="2048"
        gameDescription="Kết hợp các số và đạt được ô 2048! Đạt mốc 256, 512, 1024, 2048 để nhận thưởng spins."
        redirectUrl="/games/2048/index.html"
        themeColor="orange"
      />
    </AuthGuard>
  );
}

