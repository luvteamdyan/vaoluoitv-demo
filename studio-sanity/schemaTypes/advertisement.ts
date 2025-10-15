import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'advertisement',
  title: 'Quảng cáo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      description: 'Tên/tiêu đề của quảng cáo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Vị trí quảng cáo',
      type: 'string',
      options: {
        list: [
          {title: 'Main Ads (Banner chính)', value: 'main_ads'},
          {title: 'Sub Ads 1 (Banner phụ 1)', value: 'sub_ads_1'},
          {title: 'Sub Ads 2 (Banner phụ 2)', value: 'sub_ads_2'},
          {title: 'Hero Main (Banner hero chính)', value: 'hero_main'},
          {title: 'Hero Left (Banner hero trái)', value: 'hero_left'},
          {title: 'Hero Right (Banner hero phải)', value: 'hero_right'},
          {title: 'Catfish Banner (Banner dưới cùng)', value: 'catfish_banner'},
          {title: 'Catfish Banner 2 (Banner dưới cùng 2)', value: 'catfish_banner_2'},
          {title: 'Match Schedule Banner (Banner lịch thi đấu)', value: 'match_schedule_banner'},
          {title: 'Live Ads Banner 1 (Banner live trên)', value: 'live_ads_banner_1'},
          {title: 'Live Ads Banner 2 (Banner live dưới)', value: 'live_ads_banner_2'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'text',
      description: 'Mô tả chi tiết về quảng cáo',
    }),
    defineField({
      name: 'mediaType',
      title: 'Loại media',
      type: 'string',
      options: {
        list: [
          {title: 'Hình ảnh', value: 'image'},
          {title: 'Video', value: 'video'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaImage',
      title: 'Hình ảnh',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({document}) => document?.mediaType !== 'image',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mediaType = (context.document as any)?.mediaType
          if (mediaType === 'image' && !value) {
            return 'Vui lòng tải lên hình ảnh'
          }
          return true
        }),
    }),
    defineField({
      name: 'mediaVideo',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({document}) => document?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const mediaType = (context.document as any)?.mediaType
          if (mediaType === 'video' && !value) {
            return 'Vui lòng tải lên video'
          }
          return true
        }),
    }),
    defineField({
      name: 'mediaUrl',
      title: 'URL Media (CDN)',
      type: 'url',
      description: 'URL trực tiếp đến hình ảnh hoặc video trên CDN (nếu có)',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link đích',
      type: 'url',
      description: 'URL trang đích khi click vào quảng cáo',
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      description: 'Văn bản thay thế cho SEO và accessibility',
    }),
    defineField({
      name: 'isActive',
      title: 'Kích hoạt',
      type: 'boolean',
      description: 'Bật/tắt hiển thị quảng cáo',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Độ ưu tiên',
      type: 'number',
      description: 'Số càng cao, ưu tiên càng cao (0-100)',
      validation: (Rule) => Rule.required().min(0).max(100),
      initialValue: 50,
    }),
    defineField({
      name: 'startDate',
      title: 'Ngày bắt đầu',
      type: 'datetime',
      description: 'Ngày bắt đầu hiển thị quảng cáo',
    }),
    defineField({
      name: 'endDate',
      title: 'Ngày kết thúc',
      type: 'datetime',
      description: 'Ngày kết thúc hiển thị quảng cáo',
    }),
    defineField({
      name: 'targetAudience',
      title: 'Đối tượng mục tiêu',
      type: 'string',
      description: 'Mô tả đối tượng mục tiêu của quảng cáo',
    }),
    defineField({
      name: 'clickCount',
      title: 'Số lượt click',
      type: 'number',
      description: 'Số lượt click vào quảng cáo (do backend tracking)',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'impressionCount',
      title: 'Số lượt hiển thị',
      type: 'number',
      description: 'Số lượt hiển thị quảng cáo (do backend tracking)',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'customData',
      title: 'Dữ liệu tùy chỉnh',
      type: 'object',
      description: 'Các trường dữ liệu tùy chỉnh khác',
      fields: [
        {
          name: 'campaignId',
          title: 'ID Chiến dịch',
          type: 'string',
        },
        {
          name: 'advertiser',
          title: 'Nhà quảng cáo',
          type: 'string',
        },
        {
          name: 'budget',
          title: 'Ngân sách',
          type: 'number',
        },
        {
          name: 'notes',
          title: 'Ghi chú',
          type: 'text',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      position: 'position',
      mediaImage: 'mediaImage',
      isActive: 'isActive',
    },
    prepare({title, position, mediaImage, isActive}) {
      return {
        title: title,
        subtitle: `${position} - ${isActive ? '✅ Đang hoạt động' : '❌ Không hoạt động'}`,
        media: mediaImage,
      }
    },
  },
  orderings: [
    {
      title: 'Độ ưu tiên (Cao → Thấp)',
      name: 'priorityDesc',
      by: [{field: 'priority', direction: 'desc'}],
    },
    {
      title: 'Ngày tạo (Mới → Cũ)',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
    {
      title: 'Vị trí',
      name: 'position',
      by: [{field: 'position', direction: 'asc'}],
    },
  ],
})

