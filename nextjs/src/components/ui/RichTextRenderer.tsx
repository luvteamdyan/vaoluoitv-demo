'use client';

import React from 'react';
import Image from 'next/image';
import { RichTextBlock } from '@/types/article';
import VideoPlayer from '@/components/videos/VideoPlayer';

interface RichTextRendererProps {
  content: RichTextBlock[] | unknown[];
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!Array.isArray(content)) {
    return null;
  }

  const renderTextNode = (node: Record<string, unknown>, index: number) => {
    if (!node || !node.text) return null;

    let text: React.ReactNode = node.text as string;

    // Apply text formatting
    if (node.bold) {
      text = <strong key={index}>{text}</strong>;
    }
    if (node.italic) {
      text = <em key={index}>{text}</em>;
    }
    if (node.underline) {
      text = <u key={index}>{text}</u>;
    }
    if (node.strikethrough) {
      text = <s key={index}>{text}</s>;
    }
    if (node.code) {
      text = <code key={index} className="bg-gray-800 px-2 py-1 rounded text-yellow-400">{text}</code>;
    }
    if (node.type === 'link' && node.url) {
      text = (
        <a 
          key={index}
          href={node.url as string} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {text}
        </a>
      );
    }

    return text;
  };

  const renderBlock = (block: Record<string, unknown>, index: number) => {
    if (!block || !block.type) return null;

    switch (block.type) {
      case 'heading':
        const level = Math.min(Math.max((block.level as number) || 2, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
        const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const headingClasses: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
          1: 'text-4xl md:text-5xl font-bold text-white mb-6',
          2: 'text-3xl md:text-4xl font-bold text-white mb-5',
          3: 'text-2xl md:text-3xl font-bold text-white mb-4',
          4: 'text-xl md:text-2xl font-bold text-white mb-3',
          5: 'text-lg md:text-xl font-bold text-white mb-2',
          6: 'text-base md:text-lg font-bold text-white mb-2',
        };
        
        return React.createElement(
          HeadingTag,
          { key: index, className: headingClasses[level] },
          Array.isArray(block.children) && block.children.map((child: Record<string, unknown>, i: number) => renderTextNode(child, i))
        );

      case 'paragraph':
        return (
          <p key={index} className="text-gray-200 leading-relaxed mb-4">
            {Array.isArray(block.children) && block.children.map((child: Record<string, unknown>, i: number) => renderTextNode(child, i))}
          </p>
        );

      case 'list':
        const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
        const listClass = block.format === 'ordered' 
          ? 'list-decimal list-inside space-y-2 mb-4 text-gray-200'
          : 'list-disc list-inside space-y-2 mb-4 text-gray-200';
        
        return (
          <ListTag key={index} className={listClass}>
            {Array.isArray(block.children) && block.children.map((child: Record<string, unknown>, i: number) => {
              // Handle list-item type
              if (child.type === 'list-item' && Array.isArray(child.children)) {
                return (
                  <li key={i} className="leading-relaxed">
                    {child.children.map((textNode: Record<string, unknown>, j: number) => renderTextNode(textNode, j))}
                  </li>
                );
              }
              // Fallback: direct text node
              return (
                <li key={i} className="leading-relaxed">
                  {renderTextNode(child, i)}
                </li>
              );
            })}
          </ListTag>
        );

      case 'image':
        // Handle both formats: block.image (simple) or block.image with full metadata
        const imageData = block.image as Record<string, unknown> | undefined;
        if (!imageData?.url) return null;
        
        // Get caption from multiple possible sources
        const caption = (imageData.caption as string) || (imageData.alternativeText as string) || (block.image as { alt?: string })?.alt || 'Article image';
        const imageUrl = imageData.url as string;
        const imageWidth = imageData.width;
        const imageHeight = imageData.height;
        
        return (
          <div key={index} className="my-6 rounded-xl overflow-hidden">
            <div className="relative w-full" style={{ 
              aspectRatio: imageWidth && imageHeight ? `${imageWidth}/${imageHeight}` : '16/9' 
            }}>
              <Image
                src={imageUrl}
                alt={caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            </div>
            {caption && (
              <p className="text-sm text-gray-400 text-center mt-2 italic">
                {caption}
              </p>
            )}
          </div>
        );

      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-yellow-500 pl-4 py-2 my-4 bg-gray-800/30 italic text-gray-300">
            {Array.isArray(block.children) && block.children.map((child: Record<string, unknown>, i: number) => renderTextNode(child, i))}
          </blockquote>
        );

      case 'video':
        // Handle video blocks in rich text content
        const videoData = block.video as Record<string, unknown> | undefined;
        if (!videoData?.url) return null;
        
        const videoUrl = videoData.url as string;
        const videoPoster = videoData.poster || videoData.thumbnail;
        const videoTitle = videoData.title || videoData.caption || 'Video content';
        
        return (
          <div key={index} className="my-6">
            <VideoPlayer 
              videoUrl={videoUrl}
              posterUrl={videoPoster as string}
              title={videoTitle as string}
            />
            {videoData.caption ? (
              <p className="text-sm text-gray-400 text-center mt-2 italic">
                {String(videoData.caption)}
              </p>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="prose prose-invert max-w-none">
      {content.map((block, index: number) => renderBlock(block as Record<string, unknown>, index))}
    </div>
  );
}