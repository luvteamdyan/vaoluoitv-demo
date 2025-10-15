'use client';

import { useState } from 'react';
import UserInfoModal from '@/components/modals/UserInfoModal';

export default function UserInfoModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock user data
  const mockUser = {
    id: '1',
    username: 'vladmin',
    display_name: 'ADMIN',
    email: 'admin@vaoluoitv.com',
    phone_number: '0901234557',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    sms_verified: true,
    referral_code: 'REF123456',
    points: 360,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-20T15:45:00Z',
    invited_by: 'user123',
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-8">
          Demo UserInfoModal
        </h1>
        
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Mở Modal Thông Tin Cá Nhân
        </button>

        <UserInfoModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          user={mockUser}
        />
      </div>
    </div>
  );
}
