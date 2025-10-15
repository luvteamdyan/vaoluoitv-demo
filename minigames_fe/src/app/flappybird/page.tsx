'use client';

import AuthGuard from '../../components/auth/AuthGuard';
import GameAuthGuard from '../../components/auth/GameAuthGuard';

export default function GameFlappyBirdPage() {
  return (
    <AuthGuard>
      <GameAuthGuard
        gameTitle="Flappy Bird"
        gameDescription="Nhấn Space để bắt đầu và nhảy! Đạt mốc để nhận lượt quay may mắn!"
        redirectUrl="/games/flappybird/index.html"
        themeColor="orange"
      />
    </AuthGuard>
  );
}

