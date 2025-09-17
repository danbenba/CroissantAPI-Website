"use client"

import Head from 'next/head'
import { useLanguage } from '@/contexts/LanguageContext'
import { SEOData } from '@/lib/seo'

interface SEOHeadProps {
  data: SEOData
}

export default function SEOHead({ data }: SEOHeadProps) {
  const { locale } = useLanguage()
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://koalyx.com'
  const siteName = 'Koalyx'
  
  const {
    title,
    description,
    keywords = [],
    image = '/storage/icon.png',
    url = baseUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = data

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author || siteName} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={locale === 'fr' ? 'French' : 'English'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale === 'fr' ? 'fr_FR' : 'en_US'} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@koalyx" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      {author && <meta name="twitter:creator" content={`@${author}`} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* Structured Data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === 'article' ? 'Article' : 'WebSite',
            "name": title,
            "description": description,
            "url": fullUrl,
            "image": fullImageUrl,
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/storage/icon.png`
              }
            },
            ...(publishedTime && { "datePublished": publishedTime }),
            ...(modifiedTime && { "dateModified": modifiedTime }),
            ...(author && { 
              "author": {
                "@type": "Person",
                "name": author
              }
            }),
            ...(type === 'website' && {
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${baseUrl}/explore?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          })
        }}
      />
    </Head>
  )
}
