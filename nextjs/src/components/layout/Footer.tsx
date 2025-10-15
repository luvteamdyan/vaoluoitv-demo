"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/favicon.ico";
import { useState, useEffect } from "react";
import { sanityContentService } from "@/services/sanityContentService";
import { SanityFooterContent, SanityLogoContent } from "@/types/sanity-content";
import { urlFor } from "@/lib/sanity";

export default function Footer() {
  const [footerContent, setFooterContent] = useState<SanityFooterContent | null>(null);
  const [logoContent, setLogoContent] = useState<SanityLogoContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const [footer, logo] = await Promise.all([
          sanityContentService.getFooterContent(),
          sanityContentService.getLogoContent(),
        ]);
        console.log('Footer Content Debug:', footer);
        console.log('Logo Content Debug:', logo);
        setFooterContent(footer);
        setLogoContent(logo);
      } catch (error) {
        console.error('Error loading footer content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFooterContent();
  }, []);

  // Fallback links và description nếu Sanity chưa có data
  const facebookUrl = footerContent?.facebookLink || 'https://facebook.com';
  const tiktokUrl = footerContent?.tiktokLink || 'https://tiktok.com';
  const description = footerContent?.description || 'Nền tảng xem bóng đá trực tiếp hàng đầu với chất lượng cao và trải nghiệm tuyệt vời. Theo dõi các trận đấu hot nhất mọi lúc, mọi nơi.';
  
  // Logo URL - ưu tiên Sanity, fallback về favicon.ico
  const logoUrl = logoContent?.image?.asset?.url 
    ? urlFor(logoContent.image).width(120).auto('format').quality(90).url()
    : Logo.src;
  const logoAlt = logoContent?.alt || 'VaoluoiTV Logo';
  
  // Service links - chỉ hiện fallback nếu không có data từ Sanity
  const serviceLinks = footerContent?.serviceLinks && footerContent.serviceLinks.length > 0 
    ? footerContent.serviceLinks 
    : [
        {text: 'Trang chủ', url: '/'},
        {text: 'Lịch thi đấu', url: '/match-schedule'},
        {text: 'Kết quả trận đấu', url: '/match-result'},
        {text: 'Khuyến mãi', url: '/special-offer'},
        {text: 'Tin tức', url: '/news'},
      ];
  
  // Support links - chỉ hiện fallback nếu không có data từ Sanity
  const supportLinks = footerContent?.supportLinks && footerContent.supportLinks.length > 0 
    ? footerContent.supportLinks 
    : [
        {text: 'Trung tâm trợ giúp', url: 'https://luck8event.com/'},
        {text: 'Liên hệ', url: 'https://luck8event.com/'},
        {text: 'Điều khoản sử dụng', url: 'https://luck8event.com/'},
        {text: 'Chính sách bảo mật', url: 'https://luck8event.com/'},
        {text: 'Báo lỗi', url: 'https://luck8event.com/'},
      ];

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-32 py-4 sm:py-6 lg:py-8">
          <div className="text-center">
            <p className="text-gray-400">Đang tải...</p>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-32 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
           {/* Logo và mô tả */}
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center justify-center sm:justify-start ml-0 sm:ml-24 md:ml-26 lg:ml-32 xl:ml-38">
               <Image
                 src={logoUrl}
                 alt={logoAlt}
                 width={120}
                 height={100}
                 className="object-contain w-[80px] h-[80px] sm:w-[120px] sm:h-[100px]"
                 priority
               />
             </div>
             
             {/* Mobile layout: Icons first, then text */}
             <div className="sm:hidden">
               <div className="flex space-x-3 justify-center mt-1">
                 <a href={facebookUrl} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                   <span className="sr-only">Facebook</span>
                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                   </svg>
                 </a>
                 <a href={tiktokUrl} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                   <span className="sr-only">TikTok</span>
                   <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M21 7V9a1 1 0 0 1-1 1 8 8 0 0 1-4-1.08V15.5A6.5 6.5 0 1 1 6.53 9.72a1 1 0 0 1 1.47.9v2.52a.92.92 0 0 1-.28.62 2.49 2.49 0 0 0 2 4.23A2.61 2.61 0 0 0 12 15.35V3a1 1 0 0 1 1-1h2.11a1 1 0 0 1 1 .83A4 4 0 0 0 20 6a1 1 0 0 1 1 1Z"/>
                   </svg>
                 </a>
               </div>
              <div className="flex items-center justify-center mt-2">
                <p className="text-xs text-gray-300 mb-2 max-w-md text-center">
                  {description}
                </p>
              </div>
             </div>

             {/* Desktop layout: Text first, then icons */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-start">
                <p className="text-sm text-gray-300 mb-2 max-w-md text-left">
                  {description}
                </p>
              </div>
               
               <div className="flex space-x-4 justify-start">
                 <a href={facebookUrl} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                   <span className="sr-only">Facebook</span>
                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                   </svg>
                 </a>
                 <a href={tiktokUrl} className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                   <span className="sr-only">TikTok</span>
                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M21 7V9a1 1 0 0 1-1 1 8 8 0 0 1-4-1.08V15.5A6.5 6.5 0 1 1 6.53 9.72a1 1 0 0 1 1.47.9v2.52a.92.92 0 0 1-.28.62 2.49 2.49 0 0 0 2 4.23A2.61 2.61 0 0 0 12 15.35V3a1 1 0 0 1 1-1h2.11a1 1 0 0 1 1 .83A4 4 0 0 0 20 6a1 1 0 0 1 1 1Z"/>
                   </svg>
                 </a>
               </div>
             </div>
           </div>

          {/* Quick Links và Support - Side by side on sm */}
          <div className="col-span-1 md:col-span-2 flex justify-between items-start gap-4 sm:gap-6">
            {/* Quick Links */}
            <div className="text-left flex-1">
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Dịch vụ</h3>
              <ul className="space-y-1 sm:space-y-2">
                {serviceLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url} 
                      className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="text-left flex-1">
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Hỗ trợ</h3>
              <ul className="space-y-1 sm:space-y-2">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.url} 
                      className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4 md:mb-0 text-center md:text-left">
              © 2025 VaoluoiTV. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm justify-center md:justify-end">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
