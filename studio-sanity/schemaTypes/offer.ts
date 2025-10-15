import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'offer',
  title: 'Ưu đãi khuyến mãi',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'subtitle',
      title: 'Mô tả ngắn',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'imageUrl',
      title: 'Hình ảnh chính',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Mô tả hình ảnh cho SEO',
        },
      ],
    }),
    defineField({
      name: 'headerImage',
      title: 'Hình ảnh header',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Mô tả hình ảnh cho SEO',
        },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Điều kiện',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'conditionBlock',
          title: 'Khối điều kiện',
          fields: [
            {
              name: 'type',
              title: 'Loại điều kiện',
              type: 'string',
              options: {
                list: [
                  {title: 'Văn bản', value: 'text'},
                  {title: 'Hình ảnh', value: 'image'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Nội dung điều kiện',
              type: 'text',
              rows: 4,
              hidden: ({parent}) => parent?.type === 'image',
            },
            {
              name: 'image',
              title: 'Hình ảnh',
              type: 'image',
              options: {
                hotspot: true,
              },
              hidden: ({parent}) => parent?.type !== 'image',
            },
          ],
          preview: {
            select: {
              title: 'type',
              subtitle: 'value',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'terms',
      title: 'Thể lệ',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'termBlock',
          title: 'Khối thể lệ',
          fields: [
            {
              name: 'type',
              title: 'Loại thể lệ',
              type: 'string',
              options: {
                list: [
                  {title: 'Văn bản', value: 'text'},
                  {title: 'Hình ảnh', value: 'image'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Nội dung thể lệ',
              type: 'text',
              rows: 3,
              hidden: ({parent}) => parent?.type === 'image',
            },
            {
              name: 'image',
              title: 'Hình ảnh',
              type: 'image',
              options: {
                hotspot: true,
              },
              hidden: ({parent}) => parent?.type !== 'image',
            },
          ],
          preview: {
            select: {
              title: 'type',
              subtitle: 'value',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Lưu ý',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'isActive',
      title: 'Kích hoạt',
      type: 'boolean',
      initialValue: true,
      description: 'Hiển thị ưu đãi này trên website',
    }),
    defineField({
      name: 'priority',
      title: 'Độ ưu tiên',
      type: 'number',
      initialValue: 0,
      description: 'Số càng cao càng hiển thị trước',
    }),
    defineField({
      name: 'startDate',
      title: 'Ngày bắt đầu',
      type: 'datetime',
      description: 'Thời gian bắt đầu hiển thị ưu đãi',
    }),
    defineField({
      name: 'endDate',
      title: 'Ngày kết thúc',
      type: 'datetime',
      description: 'Thời gian kết thúc hiển thị ưu đãi',
    }),
  ],
  orderings: [
    {
      title: 'Độ ưu tiên (cao đến thấp)',
      name: 'priorityDesc',
      by: [
        {field: 'priority', direction: 'desc'},
        {field: '_createdAt', direction: 'desc'},
      ],
    },
    {
      title: 'Mới nhất',
      name: 'newest',
      by: [
        {field: '_createdAt', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'imageUrl',
      isActive: 'isActive',
    },
    prepare(selection) {
      const {title, subtitle, media, isActive} = selection;
      return {
        title: title || 'Không có tiêu đề',
        subtitle: `${subtitle ? subtitle.substring(0, 50) + '...' : 'Không có mô tả'} ${isActive ? '✅' : '❌'}`,
        media: media,
      };
    },
  },
});
