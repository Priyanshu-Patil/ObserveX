import { useEffect } from 'react';

const DEFAULT_METADATA = {
  title: 'ObserveX - Real-Time API Monitoring & Observability Platform',
  description: 'Monitor every API. Detect problems before users notice. Track latency, uptime, traffic, failures, and endpoint health across your infrastructure.',
  keywords: 'api monitoring, api observability, real-time analytics, latency tracker, error detection, endpoint analytics, developer tools, system health, uptime tracking, telemetry',
  author: 'ObserveX',
  robots: 'index, follow',
  ogType: 'website',
  ogImage: '/1.png',
  ogImageAlt: 'ObserveX API Monitoring & Observability Platform',
  twitterCard: 'summary_large_image',
  twitterSite: '@ObserveX',
};

/**
 * Safely converts relative paths to absolute URLs using window.location.origin
 */
const toAbsoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}${cleanPath}`;
  }
  return `https://observe-x.vercel.app${cleanPath}`;
};

export function MetaTags({
  title,
  description,
  keywords,
  author,
  robots,
  ogTitle,
  ogDescription,
  ogType,
  ogUrl,
  ogImage,
  ogImageAlt,
  twitterCard,
  twitterSite,
  twitterCreator,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterImageAlt,
  canonical,
}) {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = title || DEFAULT_METADATA.title;
    document.title = finalTitle;

    // Helper to set or update meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (content === undefined || content === null) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const finalDesc = description || DEFAULT_METADATA.description;
    const finalKeywords = keywords || DEFAULT_METADATA.keywords;
    const finalAuthor = author || DEFAULT_METADATA.author;
    const finalRobots = robots || DEFAULT_METADATA.robots;
    const finalOgTitle = ogTitle || finalTitle;
    const finalOgDesc = ogDescription || finalDesc;
    const finalOgImage = toAbsoluteUrl(ogImage || DEFAULT_METADATA.ogImage);
    const finalOgImageAlt = ogImageAlt || finalOgTitle;
    const finalUrl = toAbsoluteUrl(ogUrl || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/'));
    const finalCanonical = toAbsoluteUrl(canonical || (typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/'));

    // 2. Standard Meta Tags
    setMetaTag('name', 'title', finalTitle);
    setMetaTag('name', 'description', finalDesc);
    setMetaTag('name', 'keywords', finalKeywords);
    setMetaTag('name', 'author', finalAuthor);
    setMetaTag('name', 'robots', finalRobots);

    // 3. Open Graph
    setMetaTag('property', 'og:site_name', 'ObserveX');
    setMetaTag('property', 'og:title', finalOgTitle);
    setMetaTag('property', 'og:description', finalOgDesc);
    setMetaTag('property', 'og:type', ogType || DEFAULT_METADATA.ogType);
    setMetaTag('property', 'og:url', finalUrl);
    setMetaTag('property', 'og:image', finalOgImage);
    setMetaTag('property', 'og:image:secure_url', finalOgImage);
    setMetaTag('property', 'og:image:type', 'image/png');
    setMetaTag('property', 'og:image:alt', finalOgImageAlt);

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', twitterCard || DEFAULT_METADATA.twitterCard);
    setMetaTag('name', 'twitter:site', twitterSite || DEFAULT_METADATA.twitterSite);
    setMetaTag('name', 'twitter:creator', twitterCreator || DEFAULT_METADATA.twitterSite);
    setMetaTag('name', 'twitter:title', twitterTitle || finalOgTitle);
    setMetaTag('name', 'twitter:description', twitterDescription || finalOgDesc);
    setMetaTag('name', 'twitter:image', toAbsoluteUrl(twitterImage || finalOgImage));
    setMetaTag('name', 'twitter:image:alt', twitterImageAlt || finalOgImageAlt);

    // 5. Canonical link
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'canonical');
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute('href', finalCanonical);
  }, [
    title,
    description,
    keywords,
    author,
    robots,
    ogTitle,
    ogDescription,
    ogType,
    ogUrl,
    ogImage,
    ogImageAlt,
    twitterCard,
    twitterSite,
    twitterCreator,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    canonical,
  ]);

  return null;
}

export default MetaTags;
