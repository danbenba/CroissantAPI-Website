'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Image from 'next/image';
import Link from 'next/link';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// YouTube embed component
const YouTubeEmbed = ({ url }: { url: string }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  
  if (!videoId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        URL YouTube invalide: {url}
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// Custom components for markdown rendering
const components = {
  // Custom code block with syntax highlighting
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        className="rounded-lg"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },

  // Custom image component with Next.js Image optimization
  img({ src, alt, ...props }: any) {
    if (!src) return null;
    
    return (
      <div className="my-6 flex justify-center">
        <Image
          src={src}
          alt={alt || ''}
          width={800}
          height={600}
          className="rounded-lg shadow-lg max-w-full h-auto"
          {...props}
        />
      </div>
    );
  },

  // Custom link component
  a({ href, children, ...props }: any) {
    // Check if it's a YouTube link
    if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
      return <YouTubeEmbed url={href} />;
    }

    // External links
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    }

    // Internal links
    return (
      <Link href={href || '#'} className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>
        {children}
      </Link>
    );
  },

  // Custom headings with anchor links
  h1({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return (
      <h1 id={id} className="text-3xl font-bold mb-6 mt-8 scroll-mt-20" {...props}>
        {children}
      </h1>
    );
  },

  h2({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return (
      <h2 id={id} className="text-2xl font-semibold mb-4 mt-6 scroll-mt-20" {...props}>
        {children}
      </h2>
    );
  },

  h3({ children, ...props }: any) {
    const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return (
      <h3 id={id} className="text-xl font-semibold mb-3 mt-5 scroll-mt-20" {...props}>
        {children}
      </h3>
    );
  },

  // Custom blockquote
  blockquote({ children, ...props }: any) {
    return (
      <blockquote 
        className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-950/30 italic"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  // Custom table styling
  table({ children, ...props }: any) {
    return (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props}>
          {children}
        </table>
      </div>
    );
  },

  th({ children, ...props }: any) {
    return (
      <th 
        className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold"
        {...props}
      >
        {children}
      </th>
    );
  },

  td({ children, ...props }: any) {
    return (
      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props}>
        {children}
      </td>
    );
  },

  // Custom paragraph spacing
  p({ children, ...props }: any) {
    return (
      <p className="mb-4 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },

  // Custom list styling
  ul({ children, ...props }: any) {
    return (
      <ul className="list-disc list-inside mb-4 space-y-1" {...props}>
        {children}
      </ul>
    );
  },

  ol({ children, ...props }: any) {
    return (
      <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>
        {children}
      </ol>
    );
  },

  li({ children, ...props }: any) {
    return (
      <li className="ml-4" {...props}>
        {children}
      </li>
    );
  },

  // Custom horizontal rule
  hr({ ...props }: any) {
    return (
      <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" {...props} />
    );
  }
};

// Sanitization options to allow HTML while keeping it safe
const sanitizeOptions = {
  allowedTags: [
    'div', 'span', 'p', 'br', 'strong', 'em', 'u', 'del', 'ins', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'iframe', 'video', 'audio', 'source',
    'details', 'summary',
    'hr'
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'style'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    'video': ['src', 'controls', 'width', 'height'],
    'audio': ['src', 'controls'],
    'source': ['src', 'type']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
    iframe: ['https']
  }
};

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Préserver les retours à la ligne en ajoutant deux espaces avant chaque saut de ligne
  const processedContent = content
    .replace(/\n/g, '  \n') // Ajouter deux espaces avant chaque saut de ligne pour forcer le break en markdown
    .replace(/  \n  \n/g, '\n\n') // Éviter les doubles espaces pour les paragraphes séparés
    .replace(/^  \n/gm, '\n'); // Éviter les espaces en début de ligne

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeOptions]]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
