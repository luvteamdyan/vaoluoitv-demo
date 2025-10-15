// Test case để verify timezone fix
// Chạy trong browser console để test

// Test data từ API
const testMatch = {
  "match_time": "18:30",
  "match_date": "2025-10-06T18:30:00.000Z"
};

// Test hàm cũ (có lỗi timezone)
function formatMatchDateTimeOld(matchDate, matchTime) {
  const date = new Date(matchDate);
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return `${matchTime} ${formattedDate}`;
}

// Test hàm mới (đã fix timezone)
function formatMatchDateTimeNew(matchDate, matchTime) {
  if (!matchTime || matchTime === 'undefined' || matchTime === 'null') {
    return 'Chưa có giờ';
  }
  
  try {
    const date = new Date(matchDate);
    
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    
    // Sử dụng UTC để tránh timezone conversion issues
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    
    const formattedDate = utcDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${matchTime} ${formattedDate}`;
  } catch (error) {
    console.error('Error formatting match date:', error);
    return 'Lỗi định dạng ngày';
  }
}

// Test results
console.log('=== TIMEZONE FIX TEST ===');
console.log('Input:', testMatch);
console.log('Hàm cũ (có lỗi):', formatMatchDateTimeOld(testMatch.match_date, testMatch.match_time));
console.log('Hàm mới (đã fix):', formatMatchDateTimeNew(testMatch.match_date, testMatch.match_time));
console.log('Expected: 18:30 06/10/2025');
console.log('========================');
