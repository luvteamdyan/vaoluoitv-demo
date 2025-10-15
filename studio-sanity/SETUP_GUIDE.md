# Sanity Studio - Quick Setup Guide

## 🚀 Chạy nhanh

```bash
npm install
npm run dev
```

Studio sẽ chạy tại: http://localhost:3333

---

## 📋 Các bước setup từ đầu

### 1. Cài dependencies
```bash
npm install
```

### 2. Tạo schemas cho bài viết

#### Tạo `schemaTypes/category.ts`
```typescript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: Rule => Rule.required(),
    }),
  ],
})
```

#### Tạo `schemaTypes/author.ts`
```typescript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})
```

#### Tạo `schemaTypes/post.ts`
```typescript
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],
})
```

#### Cập nhật `schemaTypes/index.ts`
```typescript
import post from './post'
import author from './author'
import category from './category'

export const schemaTypes = [post, author, category]
```

### 3. Chạy dev server
```bash
npm run dev
```

---

## 🎯 Sử dụng với Next.js

### Setup Client

```bash
cd ../nextjs
npm install @sanity/client next-sanity
```

Tạo `lib/sanity.ts`:
```typescript
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '3mt74yqx',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

### Fetch Posts

```typescript
// Lấy tất cả posts
const posts = await client.fetch(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    author->{name, image},
    categories[]->{title}
  }
`)

// Lấy post theo slug
const post = await client.fetch(
  `*[_type == "post" && slug.current == $slug][0]`,
  { slug: 'my-post' }
)
```

---

## 📚 Full Documentation

Xem file chi tiết tại: `documentation/backend/SANITY_SETUP_GUIDE.md`

---

## 🛠️ Commands

```bash
npm run dev              # Development mode
npm run build            # Build production
npm run deploy           # Deploy to Sanity hosting
npm run deploy-graphql   # Deploy GraphQL schema
```

---

## 🔗 Resources

- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Queries](https://www.sanity.io/docs/groq)
- [Schema Types](https://www.sanity.io/docs/schema-types)

