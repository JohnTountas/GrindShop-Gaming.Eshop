import { useEffect, useState } from 'react';

// Tracks scroll direction with thresholding so the sticky header hides without flicker.
export function useHeaderVisibility() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const minimumDelta = 7;
    let ticking = false;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        if (currentScrollY <= 0) {
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY + minimumDelta) {
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY - minimumDelta) {
          setIsHeaderVisible(true);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return isHeaderVisible;
}
