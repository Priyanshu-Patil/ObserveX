import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_PAGES = ['/about', '/privacy', '/terms'];

export function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        if (hash) {
            const targetId = hash.replace('#', '');
            const element = document.getElementById(targetId);
            if (element) {
                if (window.__lenis) {
                    window.__lenis.scrollTo(element, { offset: -70, duration: 1.2 });
                } else {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
        }

        // Reset scroll position on route transitions
        if (window.__lenis) {
            window.__lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }

        // Reset scroll in main page container if present
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
    }, [pathname, hash]);

    return null;
}

export default ScrollToTop;
