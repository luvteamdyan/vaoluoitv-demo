import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WheelService } from '../wheel/wheel.service';

async function seedWheelData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const wheelService = app.get(WheelService);

  try {
    console.log('🌱 Bắt đầu seed dữ liệu wheel...');

    // Dữ liệu mẫu cho wheel segments
    const segmentsData = [
      {
        segment_id: 'segment_1',
        label: '10 Điểm',
        color: '#FF6B6B',
        weight: 25, // 25% xác suất
        reward_type: 'points',
        reward_value: 10,
        is_active: true,
        order: 1,
      },
      {
        segment_id: 'segment_2',
        label: '20 Điểm',
        color: '#4ECDC4',
        weight: 20, // 20% xác suất
        reward_type: 'points',
        reward_value: 20,
        is_active: true,
        order: 2,
      },
      {
        segment_id: 'segment_3',
        label: '40 Điểm',
        color: '#45B7D1',
        weight: 18, // 18% xác suất
        reward_type: 'points',
        reward_value: 40,
        is_active: true,
        order: 3,
      },
      {
        segment_id: 'segment_4',
        label: '60 Điểm',
        color: '#96CEB4',
        weight: 15, // 15% xác suất
        reward_type: 'points',
        reward_value: 60,
        is_active: true,
        order: 4,
      },
      {
        segment_id: 'segment_5',
        label: '80 Điểm',
        color: '#FFEAA7',
        weight: 12, // 12% xác suất
        reward_type: 'points',
        reward_value: 80,
        is_active: true,
        order: 5,
      },
      {
        segment_id: 'segment_6',
        label: '100 Điểm',
        color: '#DDA0DD',
        weight: 8, // 8% xác suất
        reward_type: 'points',
        reward_value: 100,
        is_active: true,
        order: 6,
      },
      {
        segment_id: 'segment_7',
        label: 'Card 50k',
        color: '#FFD700',
        weight: 1.5, // 1.5% xác suất - Special gift
        reward_type: 'special_gift',
        reward_value: 50000,
        is_active: true,
        order: 7,
      },
      {
        segment_id: 'segment_8',
        label: 'Áo Thun',
        color: '#FF6347',
        weight: 0.5, // 0.5% xác suất - Special gift
        reward_type: 'special_gift',
        reward_value: 1,
        is_active: true,
        order: 8,
      },
    ];

    // Tạo từng segment
    for (const segmentData of segmentsData) {
      try {
        await wheelService.createSegment(segmentData);
        console.log(
          `✅ Đã tạo segment: ${segmentData.label} (${segmentData.weight}%)`,
        );
      } catch (error) {
        console.log(
          `⚠️ Segment ${segmentData.label} có thể đã tồn tại:`,
          error.message,
        );
      }
    }

    console.log('🎉 Hoàn thành seed dữ liệu wheel!');
    console.log('\n📊 Tổng quan segments:');

    const allSegments = await wheelService.getAllSegments();
    allSegments.forEach((segment) => {
      console.log(
        `- ${segment.label}: ${segment.weight}% (${segment.reward_type}: ${segment.reward_value})`,
      );
    });

    const totalWeight = allSegments.reduce((sum, seg) => sum + seg.weight, 0);
    console.log(`\n📈 Tổng weight: ${totalWeight}%`);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  } finally {
    await app.close();
  }
}

// Chạy script
seedWheelData().catch(console.error);
