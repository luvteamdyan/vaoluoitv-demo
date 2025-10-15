import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'content',
  title: 'Nội dung trang web',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      description: 'Tên để nhận diện (VD: About Us, Hero, etc.)',
      initialValue: 'Content',
    }),
    defineField({
      name: 'section',
      title: 'Phần',
      type: 'string',
      options: {
        list: [
          {title: 'Logo', value: 'logo'},
          {title: 'Investor Logo', value: 'investor_logo'},
          {title: 'About Us', value: 'about_us'},
          {title: 'Investor', value: 'investor'},
          {title: 'Marquee', value: 'marquee'},
          {title: 'Hero Section', value: 'hero'},
        ],
      },
      initialValue: 'logo',
    }),
    defineField({
      name: 'isActive',
      title: 'Kích hoạt',
      type: 'boolean',
      description: 'Bật/tắt hiển thị nội dung này',
      initialValue: true,
    }),
    // Logo Section Fields
    defineField({
      name: 'logo',
      title: 'Thông tin Logo',
      type: 'object',
      description: 'Logo hiển thị trên website',
      hidden: ({document}) => document?.section !== 'logo',
      fields: [
        {
          name: 'image',
          title: 'Ảnh Logo',
          type: 'image',
          description: 'Upload logo của website',
          options: {
            hotspot: true,
          },
          // validation: (Rule) => Rule.required(), // Bỏ validation để không bị lỗi publish
        },
        {
          name: 'alt',
          title: 'Text thay thế',
          type: 'string',
          description: 'Text mô tả logo (cho SEO)',
          initialValue: 'VaoluoiTV Logo',
        },
      ],
    }),
    // Investor Logo Section Fields
    defineField({
      name: 'investorLogo',
      title: 'Thông tin Logo Nhà đầu tư',
      type: 'object',
      description: 'Logo nhà đầu tư hiển thị ở bottom MatchCard',
      hidden: ({document}) => document?.section !== 'investor_logo',
      fields: [
        {
          name: 'logo1',
          title: 'Logo 1',
          type: 'object',
          description: 'Logo nhà đầu tư đầu tiên',
          fields: [
            {
              name: 'image',
              title: 'Ảnh Logo',
              type: 'image',
              description: 'Upload logo nhà đầu tư',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'alt',
              title: 'Text thay thế',
              type: 'string',
              description: 'Text mô tả logo (cho SEO)',
            },
            {
              name: 'url',
              title: 'Link khi click',
              type: 'url',
              description: 'URL khi click vào logo (optional) - VD: https://example.com',
              validation: (Rule) => Rule.uri({
                scheme: ['http', 'https']
              }),
            },
          ],
        },
        {
          name: 'logo2',
          title: 'Logo 2',
          type: 'object',
          description: 'Logo nhà đầu tư thứ hai',
          fields: [
            {
              name: 'image',
              title: 'Ảnh Logo',
              type: 'image',
              description: 'Upload logo nhà đầu tư',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'alt',
              title: 'Text thay thế',
              type: 'string',
              description: 'Text mô tả logo (cho SEO)',
            },
            {
              name: 'url',
              title: 'Link khi click',
              type: 'url',
              description: 'URL khi click vào logo (optional) - VD: https://example.com',
              validation: (Rule) => Rule.uri({
                scheme: ['http', 'https']
              }),
            },
          ],
        },
      ],
    }),
    // About Us Fields
    defineField({
      name: 'aboutUs',
      title: 'Thông tin About Us',
      type: 'object',
      description: 'Nội dung phần About Us',
      hidden: ({document}) => document?.section !== 'about_us',
      fields: [
        {
          name: 'pageTitle',
          title: 'Tiêu đề chính',
          type: 'string',
          description: 'Tiêu đề của phần About Us',
          initialValue: 'Về VaoluoiTV',
        },
        {
          name: 'subtitle',
          title: 'Mô tả ngắn',
          type: 'text',
          description: 'Mô tả ngắn về công ty',
          rows: 3,
        },
        {
          name: 'mission',
          title: 'Sứ mệnh',
          type: 'text',
          description: 'Nội dung về sứ mệnh của công ty',
          rows: 4,
        },
        {
          name: 'vision',
          title: 'Tầm nhìn',
          type: 'text',
          description: 'Nội dung về tầm nhìn của công ty',
          rows: 4,
        },
        {
          name: 'stats',
          title: 'Thống kê',
          type: 'object',
          description: 'Các số liệu thống kê',
          fields: [
            {
              name: 'users',
              title: 'Người dùng',
              type: 'string',
              initialValue: '50K+',
              description: 'Số lượng người dùng (VD: 50K+, 100K+)',
            },
            {
              name: 'matches',
              title: 'Trận đấu',
              type: 'string',
              initialValue: '1000+',
              description: 'Số lượng trận đấu (VD: 1000+, 5000+)',
            },
            {
              name: 'uptime',
              title: 'Uptime',
              type: 'string',
              initialValue: '99.9%',
              description: 'Tỷ lệ hoạt động (VD: 99.9%, 99.99%)',
            },
            {
              name: 'support',
              title: 'Hỗ trợ',
              type: 'string',
              initialValue: '24/7',
              description: 'Thời gian hỗ trợ (VD: 24/7, 24h)',
            },
          ],
        },
        {
          name: 'contactInfo',
          title: 'Thông tin liên hệ',
          type: 'object',
          fields: [
            {
              name: 'email',
              title: 'Email',
              type: 'string',
            },
            {
              name: 'phone',
              title: 'Số điện thoại',
              type: 'string',
            },
            {
              name: 'chatSupport',
              title: 'Hỗ trợ chat',
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Tiêu đề',
                  type: 'string',
                  initialValue: 'Chat trực tuyến',
                },
                {
                  name: 'description',
                  title: 'Mô tả',
                  type: 'string',
                  initialValue: 'Hỗ trợ 24/7 qua chat',
                },
                {
                  name: 'responseTime',
                  title: 'Thời gian phản hồi',
                  type: 'string',
                  initialValue: 'Phản hồi trong 5 phút',
                },
              ],
            },
          ],
        },
      ],
    }),
    // Investor Section Fields
    defineField({
      name: 'investor',
      title: 'Thông tin Nhà đầu tư',
      type: 'object',
      description: 'Nội dung phần Investor',
      hidden: ({document}) => document?.section !== 'investor',
      fields: [
        {
          name: 'sectionTitle',
          title: 'Tiêu đề phần',
          type: 'string',
          description: 'Tiêu đề của phần Investor',
          initialValue: 'Giới thiệu về nhà đầu tư',
        },
        {
          name: 'description',
          title: 'Mô tả',
          type: 'text',
          description: 'Mô tả về nhà đầu tư',
          rows: 4,
          initialValue: 'Khám phá câu chuyện và tầm nhìn của nhà đầu tư chính đằng sau nền tảng bóng đá trực tiếp hàng đầu. Với kinh nghiệm dày dặn trong lĩnh vực thể thao và công nghệ, chúng tôi cam kết mang đến những trải nghiệm xem bóng đá tuyệt vời nhất cho người hâm mộ.',
        },
        {
          name: 'ctaText',
          title: 'Text nút CTA',
          type: 'string',
          description: 'Text hiển thị trên nút call-to-action',
          initialValue: 'Tìm hiểu thêm',
        },
        {
          name: 'ctaLink',
          title: 'Link CTA',
          type: 'url',
          description: 'URL khi click vào nút CTA',
          initialValue: 'https://luck8event.com/',
        },
        {
          name: 'videoUrl',
          title: 'URL Video',
          type: 'url',
          description: 'URL video giới thiệu nhà đầu tư (nếu có)',
          initialValue: '',
        },
        {
          name: 'videoFile',
          title: 'Video File',
          type: 'file',
          description: 'Upload video file (nếu không dùng URL)',
          options: {
            accept: 'video/*',
          },
        },
      ],
    }),
    // Marquee Section Fields
    defineField({
      name: 'marquee',
      title: 'Thông tin Marquee',
      type: 'object',
      description: 'Nội dung chữ chạy (Marquee)',
      hidden: ({document}) => document?.section !== 'marquee',
      fields: [
        {
          name: 'text',
          title: 'Nội dung chữ chạy',
          type: 'text',
          description: 'Nội dung sẽ hiển thị trên thanh chữ chạy',
          rows: 2,
          initialValue: '🏆 VAOLUOITV - XEM BÓNG ĐÁ TRỰC TIẾP MIỄN PHÍ - CHẤT LƯỢNG CAO - KHÔNG GIẬT LAG - CẬP NHẬT TIN TỨC BÓNG ĐÁ 24/7 🏆',
          // validation: (Rule) => Rule.required(), // Bỏ validation để không bị lỗi publish
        },
        {
          name: 'speed',
          title: 'Tốc độ chạy (giây)',
          type: 'number',
          description: 'Thời gian để chữ chạy hết 1 vòng (càng nhỏ càng nhanh)',
          initialValue: 30,
          // validation: (Rule) => Rule.required().min(5).max(100), // Bỏ validation để không bị lỗi publish
        },
      ],
    }),
    // Hero Section Fields
    defineField({
      name: 'hero',
      title: 'Thông tin Hero Section',
      type: 'object',
      description: 'Nội dung phần Hero (Banner Background)',
      hidden: ({document}) => document?.section !== 'hero',
      fields: [
        {
          name: 'backgroundImage',
          title: 'Ảnh nền Hero',
          type: 'image',
          description: 'Ảnh nền cho phần Hero Section',
          options: {
            hotspot: true,
          },
          // validation: (Rule, context) => {
          //   // Only require if this is a hero section document
          //   if (context?.document?.section === 'hero') {
          //     return Rule.required();
          //   }
          //   return Rule;
          // },
        },
        {
          name: 'backgroundImageAlt',
          title: 'Text thay thế cho ảnh nền',
          type: 'string',
          description: 'Text mô tả ảnh nền (cho SEO)',
          initialValue: 'Hero Background',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      section: 'section',
      isActive: 'isActive',
    },
    prepare({title, section, isActive}) {
      return {
        title: title,
        subtitle: `${section} - ${isActive ? '✅ Đang hoạt động' : '❌ Không hoạt động'}`,
      }
    },
  },
})




