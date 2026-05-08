import { useEffect, useRef } from 'react';

export default function useScrollReveal() {
  const ioRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ioRef.current) {
      ioRef.current = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('visible');
          if (e.target.classList.contains('stagger')) {
            Array.from(e.target.children).forEach((c, i) => {
              c.style.transitionDelay = (i * 0.065) + 's';
              c.classList.add('visible');
            });
          }
          ioRef.current.unobserve(e.target);
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -32px 0px' });
    }
    const els = document.querySelectorAll('.reveal,.reveal-scale,.stagger');
    els.forEach(el => ioRef.current.observe(el));
    return () => {
      // Don't disconnect, just stop observing new ones
    };
  });
}
