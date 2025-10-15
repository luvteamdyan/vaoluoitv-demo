'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile
 * @returns {boolean} true if mobile device, false otherwise
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth <= 768;
      
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider it mobile if any of these conditions are true
      const mobile = isSmallScreen || (isMobileUserAgent && isTouchDevice);
      
      setIsMobile(mobile);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

/**
 * Hook to detect if the current device is mobile with more detailed info
 */
export function useMobileDetectionDetailed() {
  const [mobileInfo, setMobileInfo] = useState({
    isMobile: false,
    isTablet: false,
    isPhone: false,
    screenWidth: 0,
    screenHeight: 0,
    hasTouch: false,
    userAgent: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = width <= 768;
      const isTabletSize = width > 768 && width <= 1024;
      
      const isMobile = isSmallScreen || (isMobileUserAgent && hasTouch);
      const isTablet = isTabletSize || /ipad|tablet/i.test(userAgent);
      const isPhone = isMobile && !isTablet;

      setMobileInfo({
        isMobile,
        isTablet,
        isPhone,
        screenWidth: width,
        screenHeight: height,
        hasTouch,
        userAgent
      });
    };

    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return mobileInfo;
}

export default useMobileDetection;
