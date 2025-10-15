'use client';

import React, { useEffect, useRef, useState } from 'react';
import { wheelService, WheelSegment, WheelSpinResponse, UserSpinInfo } from '../../services/wheel.service';

interface BoxAnimationComponentProps {
  userId: string;
  onSpinStart?: () => void;
  onSpinComplete?: (result: WheelSpinResponse) => void;
  disabled?: boolean;
}

const BoxAnimationComponent: React.FC<BoxAnimationComponentProps> = ({
  userId,
  onSpinStart,
  onSpinComplete,
  disabled = false
}) => {
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [userSpinInfo, setUserSpinInfo] = useState<UserSpinInfo | null>(null);
  const [loadingSpinInfo, setLoadingSpinInfo] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const apiResultRef = useRef<WheelSpinResponse | null>(null);

  // Load segments và user spin info từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingSpinInfo(true);
        // Load segments và user spin info song song
        const [activeSegments, spinInfo] = await Promise.all([
          wheelService.getActiveSegments(),
          wheelService.getUserSpinInfo(userId)
        ]);
        
        setSegments(activeSegments);
        setUserSpinInfo(spinInfo);
      } catch (err) {
        setError('Không thể tải dữ liệu');
        console.error('Load data error:', err);
      } finally {
        setLoadingSpinInfo(false);
      }
    };

    loadData();
  }, [userId]);

  // Animation function với vòng lặp thực sự
  const animateToPosition = (targetPos: number, duration: number = 2500) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    const startPosition = currentPosition;
    
    // Tính toán cho vòng lặp thực sự
    const boxWidth = 200;
    const spacing = 20;
    const totalBoxWidth = boxWidth + spacing;
    const singleSetWidth = segments.length * totalBoxWidth; // Width của 1 bộ segments
    
    // Tính số vòng quay (nhiều vòng hơn với 10 bộ segments)
    const totalSpins = 8;
    const totalSpinDistance = singleSetWidth * totalSpins;
    
    // Vị trí cuối cùng = vị trí hiện tại - khoảng cách quay + vị trí đích
    const finalPosition = startPosition - totalSpinDistance + targetPos;
    const distance = finalPosition - startPosition;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      let newPosition = startPosition + (distance * easeOut);
      
      // Tạo vòng lặp thực sự: khi vượt quá giới hạn thì reset về đầu
      if (newPosition < -singleSetWidth) {
        newPosition = newPosition + singleSetWidth;
      }
      
      setCurrentPosition(newPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false); // Reset spinning state
        
        // Tự động reset animation sau khi quay xong
        setTimeout(() => {
          setCurrentPosition(0);
        }, 2000); // Reset sau 2 giây để user có thể thấy kết quả
        
        if (onSpinComplete && apiResultRef.current) {
          onSpinComplete(apiResultRef.current);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleSpin = async () => {
    if (isSpinning || disabled || segments.length === 0 || !userSpinInfo || userSpinInfo.count <= 0) return;

    try {
      setIsSpinning(true);
      setError(null);

      if (onSpinStart) {
        onSpinStart();
      }

      // Gọi API để lấy kết quả từ backend
      const spinResult = await wheelService.spinWheel(userId);
      
      // Lưu kết quả API vào apiResultRef
      apiResultRef.current = spinResult;

      // Tự động giảm spin count sau khi quay thành công
      try {
        const updatedSpinInfo = await wheelService.decrementSpinCount(userId);
        setUserSpinInfo(updatedSpinInfo);
      } catch (decrementErr) {
        console.error('Decrement spin count error:', decrementErr);
        // Không throw error để không ảnh hưởng đến animation
      }

      // Tính vị trí dừng dựa trên segment_index
      const segmentIndex = spinResult.segment_index;
      const boxWidth = 200; // Width của mỗi box
      const spacing = 20; // Khoảng cách giữa các box
      const totalBoxWidth = boxWidth + spacing;
      const singleSetWidth = segments.length * totalBoxWidth; // Width của 1 bộ segments
      
      // Tính vị trí để box thắng ở giữa màn hình
      const containerWidth = containerRef.current?.offsetWidth || 800;
      const targetPos = (containerWidth / 2) - (segmentIndex * totalBoxWidth) - (boxWidth / 2);
      
      // Điều chỉnh vị trí để phù hợp với vòng lặp thực sự
      // Dừng ở vị trí sao cho box thắng ở giữa, nhưng vẫn trong phạm vi vòng lặp
      const adjustedTargetPos = targetPos % singleSetWidth;
      
      // Bắt đầu animation
      animateToPosition(adjustedTargetPos, 3500);

    } catch (err) {
      setIsSpinning(false);
      setError('Không thể quay wheel');
      console.error('Spin error:', err);
    }
  };


  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Lỗi</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tải lại
        </button>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto">
      {/* Spin Count Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lượt quay của bạn</h2>
          {loadingSpinInfo ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Đang tải...</span>
            </div>
          ) : userSpinInfo ? (
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">{userSpinInfo.count}</div>
              <div className="text-gray-600">
                {userSpinInfo.count > 0 ? 'lượt quay còn lại' : 'Hết lượt quay'}
              </div>
              {userSpinInfo.count <= 0 && (
                <div className="text-sm text-red-500 mt-2">
                  Bạn cần thêm lượt quay để tiếp tục
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Không thể tải thông tin</div>
          )}
        </div>
      </div>

      {/* Animation Container */}
      <div className="relative w-full max-w-4xl h-48 overflow-hidden border-2 border-gray-300 rounded-lg bg-gray-100" style={{ width: '100%', maxWidth: '800px' }}>
        {/* Center Line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-500 z-10"></div>
        
        {/* Boxes Container - Vòng lặp vô tận */}
        <div
          ref={containerRef}
          className="flex items-center h-full transition-transform duration-100 ease-linear"
          style={{
            transform: `translateX(${currentPosition}px)`,
            width: `${segments.length * 220 * 10}px` // 10 lần segments để tạo nhiều box
          }}
        >
          {/* Lặp lại segments 10 lần để tạo hiệu ứng vô tận */}
          {Array.from({ length: 10 }, (_, repeatIndex) => 
            segments.map((segment) => (
              <div
                key={`${segment.segment_id}-${repeatIndex}`}
                className="flex-shrink-0 w-48 h-32 mx-2 rounded-lg shadow-lg flex flex-col items-center justify-center text-white font-bold text-center relative overflow-hidden"
                style={{ backgroundColor: segment.color }}
              >
                {/* Hình cái rương */}
                <div className="text-4xl mb-2">📦</div>
                <div className="text-xs opacity-80">Rương Kho Báu</div>
                
                {/* Hiệu ứng ánh sáng */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || disabled || !userSpinInfo || userSpinInfo.count <= 0}
        className={`px-8 py-4 rounded-full text-white font-bold text-xl shadow-lg transform transition-all duration-200 ${
          isSpinning || disabled || !userSpinInfo || userSpinInfo.count <= 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:scale-105 active:scale-95'
        }`}
      >
        {isSpinning ? 'Đang quay...' : 
         !userSpinInfo ? 'Đang tải...' :
         userSpinInfo.count <= 0 ? 'HẾT LƯỢT QUAY' : 'QUAY NGAY'}
      </button>

      {/* Spinning Status */}
      {isSpinning && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Đang quay...</span>
        </div>
      )}

      {/* Segments Info */}
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3 text-center">Danh sách segments</h3>
        <div className="grid grid-cols-2 gap-2">
          {segments.map((segment) => (
            <div
              key={segment.segment_id}
              className="flex items-center space-x-2 p-2 rounded border"
              style={{ borderLeftColor: segment.color, borderLeftWidth: '4px' }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{segment.label}</p>
                <p className="text-xs text-gray-500">
                  {segment.weight}% - {wheelService.formatRewardText(segment.reward_type, segment.reward_value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoxAnimationComponent;
