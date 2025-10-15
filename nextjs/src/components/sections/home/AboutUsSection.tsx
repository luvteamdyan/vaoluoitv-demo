"use client";
import { Info, Phone, Tv, Smartphone, Zap, Shield, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import SlideTransition from '@/components/effects/SlideTransition';
import { useSlideTransition } from '@/components/effects/useSlideTransition';
import { slideTransitionStyles } from '@/components/effects/SlideTransition';
import { useState, useEffect } from 'react';
import { sanityContentService } from '@/services/sanityContentService';
import { mergeAboutUsContent, getContactInfo } from '@/utils/sanityContentHelpers';
import type { SanityAboutUsContent } from '@/types/sanity-content';

export default function AboutUsSection() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [aboutUsData, setAboutUsData] = useState<SanityAboutUsContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const tabs = [
        { id: "about", label: "Về chúng tôi", icon: Info },
        { id: "services", label: "Dịch vụ", icon: Tv },
        { id: "contact", label: "Liên hệ", icon: Phone }
    ];

    const { 
        activeTab, 
        changeTab, 
        getCurrentDirection 
    } = useSlideTransition({ tabs, initialTab: "about" });

    // Fetch About Us content from Sanity
    useEffect(() => {
        const fetchAboutUsContent = async () => {
            try {
                setIsLoading(true);
                const data = await sanityContentService.getAboutUsContent();
                const mergedData = mergeAboutUsContent(data);
                setAboutUsData(mergedData);
            } catch (error) {
                console.error('Error fetching About Us content:', error);
                // Use default data as fallback
                const defaultData = mergeAboutUsContent(null);
                setAboutUsData(defaultData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAboutUsContent();
    }, []);

    // Reset expanded state when changing tabs
    const handleTabChange = (tabId: string) => {
        setIsExpanded(false);
        changeTab(tabId);
    };

    // Hardcoded services (not from Sanity)
    const services = [
        {
            icon: Tv,
            title: "Livestream HD",
            description: "Phát sóng trực tiếp chất lượng cao với độ phân giải 1080p"
        },
        {
            icon: Smartphone,
            title: "Đa nền tảng",
            description: "Xem trên mọi thiết bị: máy tính, điện thoại, tablet"
        },
        {
            icon: Zap,
            title: "Tốc độ nhanh",
            description: "Độ trễ thấp, đồng bộ thời gian thực với trận đấu"
        },
        {
            icon: Shield,
            title: "Bảo mật cao",
            description: "Hệ thống bảo mật tiên tiến, bảo vệ quyền lợi người dùng"
        }
    ];

    // Get stats from Sanity data or use defaults
    const stats = [
        { value: aboutUsData?.stats?.users || '50K+', label: 'Người dùng' },
        { value: aboutUsData?.stats?.matches || '1000+', label: 'Trận đấu' },
        { value: aboutUsData?.stats?.uptime || '99.9%', label: 'Uptime' },
        { value: aboutUsData?.stats?.support || '24/7', label: 'Hỗ trợ' },
    ];

    // Get contact info from Sanity data or use defaults
    const contactInfo = aboutUsData ? getContactInfo(aboutUsData) : {
        email: 'luck8@luck.com',
        phone: '+84 96 686 60 88',
        chatSupport: {
            title: 'Chat trực tuyến',
            description: 'Hỗ trợ 24/7 qua chat',
            responseTime: 'Phản hồi trong 5 phút',
        },
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 md:px-6 lg:px-32 py-6 md:py-8">
                <div className="text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-32 py-6 md:py-8">
            <style dangerouslySetInnerHTML={{ __html: slideTransitionStyles }} />

            {/* Section Header */}
            <div className="text-center mb-6 md:mb-8 mt-4 md:mt-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4">
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {aboutUsData?.pageTitle || 'Về VaoluoiTV'}
                    </span>
                </h2>
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                    {aboutUsData?.subtitle || 'Chào mừng đến với Vaoluoitv - kênh phát sóng trực tiếp miễn phí mọi giải đấu bóng đá với đường truyền tốc độ cao, chất lượng hình ảnh full HD và có hỗ trợ bình luận tiếng Việt với dàn BLV cực kỳ nhiệt huyết. Trải nghiệm xem bóng đá đỉnh cao, miễn phí mọi trận cầu – chỉ có tại Vaoluoitv.com'}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex cursor-pointer items-center px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                                : "bg-black text-gray-300 hover:bg-gray-900 border border-yellow-500/50"
                            }`}
                     >
                         <tab.icon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                         {tab.label}
                     </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-red-700/40 to-red-700 rounded-xl md:rounded-2xl border-t-6 shadow-xl p-4 md:p-6 lg:p-8 mb-8 md:mb-12 overflow-hidden">
                <SlideTransition 
                    direction={getCurrentDirection()} 
                    isActive={activeTab === "about"}
                >
                    {activeTab === "about" && (
                    <div className="space-y-6 md:space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                            <div className="order-2 lg:order-1">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                                    Sứ mệnh của chúng tôi
                                </h3>
                                <div className="space-y-3 md:space-y-4">
                                    {/* Mission - Desktop: Full text, Mobile: Truncated with line-clamp-4 */}
                                    <div>
                                        {/* Desktop: Always show full mission */}
                                        <p className="hidden lg:block text-sm md:text-base text-gray-300">
                                            {aboutUsData?.mission || 'Trong bối cảnh nhu cầu xem bóng đá tại Việt Nam tăng cao, nhưng các kênh truyền hình truyền thống như VTV, K+ lại khiến người dùng mất một khoản phí không nhỏ. Nhận thấy điều này, Vaoluoitv đã được ra đời với sứ mệnh mang đến một website phát trực tiếp bóng đá miễn phí và đầy đủ mọi giải đấu từ World Cup, Euro, Champions League, Ngoại Hạng Anh,... cho đến các giải đấu quốc nội như V-league.'}
                                        </p>
                                        
                                        {/* Mobile/Tablet: Truncated mission */}
                                        <p className={`lg:hidden text-sm md:text-base text-gray-300 ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                            {aboutUsData?.mission || 'Trong bối cảnh nhu cầu xem bóng đá tại Việt Nam tăng cao, nhưng các kênh truyền hình truyền thống như VTV, K+ lại khiến người dùng mất một khoản phí không nhỏ. Nhận thấy điều này, Vaoluoitv đã được ra đời với sứ mệnh mang đến một website phát trực tiếp bóng đá miễn phí và đầy đủ mọi giải đấu từ World Cup, Euro, Champions League, Ngoại Hạng Anh,... cho đến các giải đấu quốc nội như V-league.'}
                                        </p>
                                    </div>
                                    
                                    {/* Vision - Desktop: Always show, Mobile: Show when expanded */}
                                    {/* Desktop: Always show vision */}
                                    <p className="hidden lg:block text-sm md:text-base text-gray-300">
                                        {aboutUsData?.vision || 'Đến với Vaoluoitv, bạn sẽ được trải nghiệm dịch vụ xem bóng đá hoàn mới, không chỉ miễn phí, chất lượng sắc nét, mà còn được tương tác trực tiếp với những bình luận viên đầy nhiệt huyết nhưng cũng không kém phần hài hước. Chúng tôi luôn hướng đến việc giúp người xem không chỉ thưởng thức trọn vẹn trận đấu, mà còn cảm thấy thoải mái, vui tươi với những tương tác trực tiếp khi xem bóng đá tại Vaoluoitv.'}
                                    </p>
                                    
                                    {/* Mobile/Tablet: Show vision when expanded */}
                                    {isExpanded && (
                                        <div className="lg:hidden">
                                            <p className="text-sm md:text-base text-gray-300">
                                                {aboutUsData?.vision || 'Đến với Vaoluoitv, bạn sẽ được trải nghiệm dịch vụ xem bóng đá hoàn mới, không chỉ miễn phí, chất lượng sắc nét, mà còn được tương tác trực tiếp với những bình luận viên đầy nhiệt huyết nhưng cũng không kém phần hài hước. Chúng tôi luôn hướng đến việc giúp người xem không chỉ thưởng thức trọn vẹn trận đấu, mà còn cảm thấy thoải mái, vui tươi với những tương tác trực tiếp khi xem bóng đá tại Vaoluoitv.'}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Read More/Less Button - Hidden on lg screens */}
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-all duration-300 text-sm font-medium lg:hidden hover:scale-105 hover:bg-yellow-400/10 px-2 py-1 rounded-md"
                                    >
                                        <span className="transition-all duration-300">{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                                        <div className={`transition-transform duration-500 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-black/80 to-gray-900/70 rounded-lg md:rounded-xl p-4 md:p-6 order-1 lg:order-2">
                                <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
                                    {stats.map((stat, index) => (
                                        <div key={index}>
                                            <div className="text-2xl md:text-3xl font-bold text-red-600">{stat.value}</div>
                                            <div className="text-xs md:text-sm text-gray-300">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </SlideTransition>

                <SlideTransition 
                    direction={getCurrentDirection()} 
                    isActive={activeTab === "services"}
                >
                    {activeTab === "services" && (
                    <div className="space-y-6 md:space-y-8">
                        <div className="text-center mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                                Dịch vụ của chúng tôi
                            </h3>
                            <p className="text-sm md:text-base text-gray-300 px-4">
                                Cung cấp đầy đủ các dịch vụ livestream bóng đá chất lượng cao
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                             {services.map((service, index) => (
                                 <div key={index} className="bg-gradient-to-br from-black to-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                     <div className="flex justify-center mb-3 md:mb-4">
                                         <service.icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-red-600" />
                                     </div>
                                     <h4 className="text-base md:text-lg font-semibold text-white mb-2">
                                         {service.title}
                                     </h4>
                                     <p className="text-xs md:text-sm text-gray-300">
                                         {service.description}
                                     </p>
                                 </div>
                             ))}
                        </div>
                    </div>
                    )}
                </SlideTransition>

                <SlideTransition 
                    direction={getCurrentDirection()} 
                    isActive={activeTab === "contact"}
                >
                    {activeTab === "contact" && (
                    <div className="space-y-6 md:space-y-8">
                        <div className="text-center mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                                Liên hệ với chúng tôi
                            </h3>
                            <p className="text-sm md:text-base text-gray-300 px-4">
                                Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4 md:space-y-6 order-2 md:order-1">
                                 {contactInfo.email && (
                                    <div className="flex items-start space-x-3 md:space-x-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 md:w-6 md:h-6 text-amber-200/70" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm md:text-base font-semibold text-white">Email</h4>
                                            <p className="text-xs md:text-sm text-gray-300">{contactInfo.email}</p>
                                        </div>
                                    </div>
                                )}
                                {contactInfo.phone && (
                                    <div className="flex items-start space-x-3 md:space-x-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 md:w-6 md:h-6 text-amber-200/70" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm md:text-base font-semibold text-white">Hotline</h4>
                                            <p className="text-xs md:text-sm text-gray-300">{contactInfo.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {contactInfo.chatSupport && (
                                    <div className="flex items-start space-x-3 md:space-x-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-200/70" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm md:text-base font-semibold text-white">{contactInfo.chatSupport.title}</h4>
                                            <p className="text-xs md:text-sm text-gray-300">{contactInfo.chatSupport.description}</p>
                                            <p className="text-xs md:text-sm text-gray-300">{contactInfo.chatSupport.responseTime}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-amber-200/70 order-1 md:order-2">
                                <h4 className="text-sm md:text-base font-semibold text-white mb-3 md:mb-4">Gửi tin nhắn cho chúng tôi</h4>
                                <form className="space-y-3 md:space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Tên của bạn"
                                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-yellow-500/50 rounded-lg bg-black text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email của bạn"
                                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-yellow-500/50 rounded-lg bg-black text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                                    />
                                    <textarea
                                        placeholder="Nội dung tin nhắn"
                                        rows={3}
                                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-yellow-500/50 rounded-lg bg-black text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm resize-none"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm md:text-base"
                                    >
                                        Gửi tin nhắn
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    )}
                </SlideTransition>
            </div>

        </div>
    );
}
