import { useEffect, useState, useCallback } from 'react';

export function useScroll(threshold = 64) {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    const isScrolled = window.scrollY > threshold;
    setScrolled(isScrolled);
  }, [threshold]);

  useEffect(() => {
    // Ejecutar inmediatamente para establecer el estado inicial
    onScroll();
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return scrolled;
} 