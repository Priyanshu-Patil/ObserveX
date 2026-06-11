import { useEffect } from 'react';

const DEFAULT_METADATA = {
  title: 'ObserveX - Real-Time API Monitoring & Observability Platform',
  description: 'Monitor every API. Detect problems before users notice. Track latency, uptime, traffic, failures, and endpoint health across your infrastructure.',
  keywords: 'api monitoring, api observability, real-time analytics, latency tracker, error detection, endpoint analytics, developer tools, system health, uptime tracking',
  ogType: 'website',
  ogImage: '/2.png',
  twitterCard: 'summary_large_image',
};

export function MetaTags({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogType,
  ogUrl,
  ogImage,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
}) {
  useEffect(() => {
    // 1. Title
    const finalTitle = title || DEFAULT_METADATA.title;
    document.title = finalTitle;

    // Helper to set/update meta tag
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

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description || DEFAULT_METADATA.description);
    setMetaTag('name', 'keywords', keywords || DEFAULT_METADATA.keywords);

    // 3. Open Graph
    setMetaTag('property', 'og:title', ogTitle || finalTitle);
    setMetaTag('property', 'og:description', ogDescription || description || DEFAULT_METADATA.description);
    setMetaTag('property', 'og:type', ogType || DEFAULT_METADATA.ogType);
    setMetaTag('property', 'og:url', ogUrl || window.location.href);
    setMetaTag('property', 'og:image', ogImage || DEFAULT_METADATA.ogImage);

    // 4. Twitter
    setMetaTag('name', 'twitter:card', twitterCard || DEFAULT_METADATA.twitterCard);
    setMetaTag('name', 'twitter:title', twitterTitle || ogTitle || finalTitle);
    setMetaTag('name', 'twitter:description', twitterDescription || ogDescription || description || DEFAULT_METADATA.description);
    setMetaTag('name', 'twitter:image', twitterImage || ogImage || DEFAULT_METADATA.ogImage);

    // 5. Canonical link
    const finalCanonical = canonical || window.location.href;
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
    ogTitle,
    ogDescription,
    ogType,
    ogUrl,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonical,
  ]);

  return null;
}

export default MetaTags;
