import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_PAGES = ['/about', '/privacy', '/terms'];

export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (SCROLL_PAGES.includes(pathname)) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}

export default ScrollToTop;
