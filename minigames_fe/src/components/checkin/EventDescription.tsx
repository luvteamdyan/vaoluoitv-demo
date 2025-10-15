'use client';

import React from 'react';

interface EventDescriptionProps {
  className?: string;
}

const EventDescription: React.FC<EventDescriptionProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen px-4 py-8">
        <div className="bg-gray-800 bg-opacity-90 rounded-lg max-w-4xl w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-800/30 to-yellow-500/30 rounded-t-lg px-6 py-4 text-center">
              <h2 className="text-white text-xl font-bold">Mô tả sự kiện</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 ">
            {/* Main title */}
            <h3 className="text-white text-xl font-bold leading-relaxed">
              TÍCH LUỸ CHUỖI ĐIỂM DANH, HỘI VIÊN SẼ CÓ CƠ HỘI MỞ VÒNG QUAY MAY MẮN LÊN ĐẾN{' '}
              <span className="text-red-500">1000 LUCK POINTS</span>
            </h3>

            {/* Participants section */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs">★</span>
                </div>
                <div>
                  <p className="text-green-400 font-bold mb-2">Đối tượng tham gia:</p>
                  <p className="text-white leading-relaxed">
                    Hội viên đã đăng ký tài khoản trong hệ thống {` `} <span className="text-green-400 font-bold">Luck8 Event.</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs">★</span>
                </div>
                <div>
                  <p className="text-green-400 font-bold mb-2">Cách thức tham gia:</p>
                  <p className="text-white leading-relaxed">
                    Hội viên có thể đăng ký tài khoản ở {` `} <a href="https://luck8event.com" target="_blank" className="text-green-400 font-bold underline">Luck8 - Event</a> và tham gia sự kiện ngay lập tức.
                  </p>
                </div>
              </div>
            </div>

            {/* Rules and rewards */}
            <div className="space-y-4">
              <p className="text-white leading-relaxed">
                Với mỗi <span className="font-bold">Chuỗi Điểm Danh 4 ngày liên tiếp</span>, hội viên sẽ nhận được 2 lượt quay vòng quay may mắn.
              </p>

              <p className="text-white leading-relaxed">
                Đặc biệt <span className="font-bold">ngẫu nhiên 1 ngày trong mỗi tháng</span>, sẽ chứa phần quà lên đến <span className="text-red-500 font-bold">500 Luck Points</span> cộng thẳng vào tài khoản của hội viên. 
                Vậy nên hãy chăm chỉ điểm danh nhé!
              </p>

              <p className="text-white leading-relaxed">
                Điểm danh mỗi ngày, rinh quà liền tay. Tham gia đăng nhập mỗi ngày để không bỏ lỡ các Mini Games hấp dẫn từ{' '}
                <span className="text-green-400 font-bold">LUCK8 EVENT</span> nhé!
              </p>
            </div>

            {/* Notes section */}
            <div className="border-t border-gray-600 pt-6">
              <h4 className="text-green-400 font-bold mb-4">Lưu ý:</h4>
              <div className="">
                <div className="flex items-start">
                  <p className="text-gray-400 leading-relaxed">
                    - Vui lòng đăng xuất và đăng nhập mới mỗi ngày để kích hoạt tính năng tự động điểm danh.
                  </p>
                </div>
                <div className="flex items-start">
                  <p className="text-gray-400 leading-relaxed">
                    - Trong trường hợp không thể điểm danh tự động do lưu phiên đăng nhập, quý khách có thể nhấn trực tiếp vào ô hiển thị ngày hiện tại để điểm danh thủ công.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDescription;
