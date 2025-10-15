'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthGuard from '../../components/auth/AuthGuard';
import BoxAnimationComponent from '../../components/wheel/BoxAnimationComponent';
import { WheelSpinResponse } from '../../services/wheel.service';

const WheelPage: React.FC = () => {
  const { user } = useAuth();
  const [lastResult, setLastResult] = useState<WheelSpinResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpinStart = () => {
    setShowResult(false);
    setLastResult(null);
  };

  const handleSpinComplete = (result: WheelSpinResponse) => {
    setLastResult(result);
    setShowResult(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎰 Lucky Box</h1>
            <p className="text-gray-600">Quay để nhận phần thưởng may mắn!</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <BoxAnimationComponent
          userId={user?.id || ''}
          onSpinStart={handleSpinStart}
          onSpinComplete={handleSpinComplete}
        />
            </div>

          {/* Result Modal */}
          {showResult && lastResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chúc mừng!</h2>
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Bạn đã trúng: {lastResult.segment_label}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {lastResult.reward_type === 'points' && `${lastResult.reward_value} điểm`}
                    {lastResult.reward_type === 'special_gift' && (
                      lastResult.reward_value === 50000 ? 'Card 50k' : 
                      lastResult.reward_value === 1 ? 'Áo Thun' : 
                      `Quà đặc biệt ${lastResult.reward_value}`
                    )}
                  </p>
                  
                  {/* Hiển thị thông tin điểm được cộng */}
                  {lastResult.points_updated && lastResult.points_added > 0 && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        ✅ Đã cộng {lastResult.points_added} điểm vào tài khoản của bạn!
                      </p>
                    </div>
                  )}
                  
                  {/* Hiển thị thông tin special gift */}
                  {lastResult.reward_type === 'special_gift' && lastResult.points_added === 0 && (
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">
                        🎁 Phần thưởng đặc biệt sẽ được xử lý riêng!
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Hướng dẫn sử dụng</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Nhấn nút <strong>SPIN</strong> để quay wheel</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Backend sẽ quyết định segment thắng dựa trên xác suất</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Wheel sẽ quay đến segment được chỉ định</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Phần thưởng sẽ được cộng vào tài khoản của bạn</span>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default WheelPage;
