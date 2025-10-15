import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { CheckInRecord, CheckInResponse } from '@/types/checkin.types';

// Mock database - trong thực tế sẽ kết nối với database thật
const checkInRecords: Map<string, CheckInRecord> = new Map();

// Helper function để check xem 2 ngày có liên tiếp không
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Helper function để check xem đã điểm danh hôm nay chưa
function hasCheckedInToday(lastCheckinAt: string): boolean {
  const lastCheckin = new Date(lastCheckinAt);
  const today = new Date();
  
  // Reset time to compare only dates
  lastCheckin.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return lastCheckin.getTime() === today.getTime();
}

// Helper function để tính rewards
function calculateRewards(currentStreak: number): { luckPoints: number; spinChances: number } {
  // Mỗi 4 ngày liên tiếp = 2 lượt quay + 10 luck points
  const cycles = Math.floor(currentStreak / 4);
  const spinChances = cycles * 2;
  const luckPoints = cycles * 10;
  
  return { luckPoints, spinChances };
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckInResponse>> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization token',
        error: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify token (trong thực tế sẽ verify JWT)
    // Ở đây chúng ta giả sử token hợp lệ và extract user_id từ đó
    // Trong thực tế sẽ decode JWT để lấy user info
    const user = authService.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token or user not found',
        error: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const userId = user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get existing checkin record
    let checkinRecord = checkInRecords.get(userId);
    let isNewRecord = false;

    if (!checkinRecord) {
      // Tạo record mới cho user lần đầu
      isNewRecord = true;
      checkinRecord = {
        user_id: userId,
        currentStreak: 1,
        lastCheckinAt: now.toISOString(),
        lastRewardedStreak: 0,
        totalCheckins: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    } else {
      // Check xem đã điểm danh hôm nay chưa
      if (hasCheckedInToday(checkinRecord.lastCheckinAt)) {
        return NextResponse.json({
          success: false,
          message: 'Bạn đã điểm danh hôm nay rồi!',
          error: 'ALREADY_CHECKED_IN'
        }, { status: 400 });
      }

      const lastCheckinDate = new Date(checkinRecord.lastCheckinAt);
      
      // Kiểm tra xem có liên tiếp không
      if (isConsecutiveDay(lastCheckinDate, today)) {
        // Liên tiếp -> tăng streak
        checkinRecord.currentStreak += 1;
      } else {
        // Không liên tiếp -> reset streak về 1
        checkinRecord.currentStreak = 1;
      }

      // Cập nhật thông tin
      checkinRecord.lastCheckinAt = now.toISOString();
      checkinRecord.totalCheckins += 1;
      checkinRecord.updatedAt = now.toISOString();
    }

    // Tính rewards
    const rewards = calculateRewards(checkinRecord.currentStreak);
    
    // Cập nhật lastRewardedStreak nếu đã nhận reward
    const cycles = Math.floor(checkinRecord.currentStreak / 4);
    if (cycles > checkinRecord.lastRewardedStreak) {
      checkinRecord.lastRewardedStreak = cycles;
    }

    // Lưu vào "database"
    checkInRecords.set(userId, checkinRecord);

    return NextResponse.json({
      success: true,
      message: `Điểm danh thành công! Chuỗi hiện tại: ${checkinRecord.currentStreak} ngày`,
      data: {
        checkin: checkinRecord,
        isNewRecord,
        streakUpdated: true,
        rewards
      }
    });

  } catch (error) {
    console.error('CheckIn API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi điểm danh',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization token',
        error: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const user = authService.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token or user not found',
        error: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const userId = user.id;
    const checkinRecord = checkInRecords.get(userId);

    if (!checkinRecord) {
      return NextResponse.json({
        success: true,
        message: 'Chưa có dữ liệu điểm danh',
        data: {
          currentStreak: 0,
          totalCheckins: 0,
          lastCheckinAt: null,
          canCheckInToday: true,
          nextRewardIn: 4
        }
      });
    }

    const canCheckInToday = !hasCheckedInToday(checkinRecord.lastCheckinAt);
    const nextRewardIn = 4 - (checkinRecord.currentStreak % 4);

    return NextResponse.json({
      success: true,
      message: 'Lấy dữ liệu điểm danh thành công',
      data: {
        currentStreak: checkinRecord.currentStreak,
        totalCheckins: checkinRecord.totalCheckins,
        lastCheckinAt: checkinRecord.lastCheckinAt,
        canCheckInToday,
        nextRewardIn
      }
    });

  } catch (error) {
    console.error('Get CheckIn stats error:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy dữ liệu điểm danh',
      error: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
