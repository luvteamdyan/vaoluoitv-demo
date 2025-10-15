'use client';

import React from 'react';
import CheckInGame from '@/components/checkin/CheckInGame';
import EventDescription from '@/components/checkin/EventDescription';

const CheckInPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-yellow-800">
      {/* Calendar Section - Full viewport height with proper spacing */}
      <div className="min-h-screen flex flex-col justify-center py-4 bg-gradient-to-br from-yellow-900 via-orange-900 to-yellow-800">
        <CheckInGame />
      </div>
      
      {/* Spacing between calendar and description */}
      <div className="h-16"></div>
      
      {/* Event Description Section - Below the calendar */}
      <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-red-700">
        <EventDescription />
      </div>
    </div>
  );
};

export default CheckInPage;
