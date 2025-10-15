import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'layout',
  title: 'Header & Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      description: 'Tên để nhận diện (VD: Header Main, Footer Social)',
      initialValue: 'Layout Content',
    }),
    defineField({
      name: 'section',
      title: 'Phần',
      type: 'string',
      options: {
        list: [
          {title: 'Header', value: 'header'},
          {title: 'Footer', value: 'footer'},
        ],
      },
      initialValue: 'footer',
    }),
    defineField({
      name: 'isActive',
      title: 'Kích hoạt',
      type: 'boolean',
      description: 'Bật/tắt hiển thị nội dung này',
      initialValue: true,
    }),
    // Header Section Fields
    defineField({
      name: 'header',
      title: 'Thông tin Header',
      type: 'object',
      description: 'Nội dung phần Header',
      hidden: ({document}) => document?.section !== 'header',
      fields: [
        {
          name: 'placeholder',
          title: 'Header Content (Coming Soon)',
          type: 'string',
          description: 'Nội dung header sẽ được thêm sau',
          readOnly: true,
          initialValue: 'Header fields will be added here',
        },
      ],
    }),
    // Footer Section Fields
    defineField({
      name: 'footer',
      title: 'Thông tin Footer',
      type: 'object',
      description: 'Nội dung phần Footer',
      hidden: ({document}) => document?.section !== 'footer',
      fields: [
        {
          name: 'facebookLink',
          title: 'Link Facebook',
          type: 'string',
          description: 'Đường dẫn tới trang Facebook (VD: https://facebook.com/yourpage)',
          placeholder: 'https://facebook.com',
        },
        {
          name: 'tiktokLink',
          title: 'Link TikTok',
          type: 'string',
          description: 'Đường dẫn tới trang TikTok (VD: https://tiktok.com/@username)',
          placeholder: 'https://tiktok.com',
        },
        {
          name: 'description',
          title: 'Mô tả Footer',
          type: 'text',
          description: 'Dòng mô tả về nền tảng hiển thị ở footer',
          placeholder: 'Nền tảng xem bóng đá trực tiếp hàng đầu...',
          initialValue: 'Nền tảng xem bóng đá trực tiếp hàng đầu với chất lượng cao và trải nghiệm tuyệt vời. Theo dõi các trận đấu hot nhất mọi lúc, mọi nơi.',
          rows: 3,
        },
        {
          name: 'serviceLinks',
          title: 'Danh sách dịch vụ',
          type: 'array',
          description: 'Các mục dịch vụ hiển thị ở footer',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'text',
                  title: 'Tên mục',
                  type: 'string',
                  description: 'Tên hiển thị của mục (VD: Trang chủ)',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'url',
                  title: 'Đường dẫn',
                  type: 'string',
                  description: 'Link khi nhấn vào mục (VD: / hoặc /match-schedule)',
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: {
                  title: 'text',
                  subtitle: 'url',
                },
              },
            },
          ],
          initialValue: [
            {text: 'Trang chủ', url: '/'},
            {text: 'Lịch thi đấu', url: '/match-schedule'},
            {text: 'Kết quả trận đấu', url: '/match-result'},
            {text: 'Khuyến mãi', url: '/special-offer'},
            {text: 'Tin tức', url: '/news'},
          ],
        },
        {
          name: 'supportLinks',
          title: 'Danh sách hỗ trợ',
          type: 'array',
          description: 'Các mục hỗ trợ hiển thị ở footer',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'text',
                  title: 'Tên mục',
                  type: 'string',
                  description: 'Tên hiển thị của mục (VD: Trung tâm trợ giúp)',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'url',
                  title: 'Đường dẫn',
                  type: 'string',
                  description: 'Link khi nhấn vào mục (VD: https://luck8event.com/help)',
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: {
                  title: 'text',
                  subtitle: 'url',
                },
              },
            },
          ],
          initialValue: [
            {text: 'Trung tâm trợ giúp', url: 'https://luck8event.com/'},
            {text: 'Liên hệ', url: 'https://luck8event.com/'},
            {text: 'Điều khoản sử dụng', url: 'https://luck8event.com/'},
            {text: 'Chính sách bảo mật', url: 'https://luck8event.com/'},
            {text: 'Báo lỗi', url: 'https://luck8event.com/'},
          ],
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
        subtitle: `${section === 'header' ? 'Header' : 'Footer'} - ${isActive ? '✅ Đang hoạt động' : '❌ Không hoạt động'}`,
      }
    },
  },
})

