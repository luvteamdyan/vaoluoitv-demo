'use client';

import AuthGuard from '../../components/auth/AuthGuard';
import GameAuthGuard from '../../components/auth/GameAuthGuard';

export default function GamePikachuMatchingPage() {
  return (
    <AuthGuard>
      <GameAuthGuard
        gameTitle="Pikachu Matching"
        gameDescription="Ghép các cặp Pokemon giống nhau! Hoàn thành game để nhận 5 spins!"
        redirectUrl="/games/pikachu-matching/index.html"
        themeColor="orange"
      />
    </AuthGuard>
  );
}

