import { useEffect } from 'react';

// Animate only when entering the viewport. Content stays readable if motion is unavailable.
export function useAmbientMotion() {
  useEffect(() => {
    if (!window.IntersectionObserver || !Element.prototype.animate) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const completed = new WeakSet();
    const running = new Set();
    const targets = document.querySelectorAll(
      'main h2, main h3, .story > p, .chapter-copy > p, .section-heading > p',
    );
    let observer;

    function syncPreference() {
      observer?.disconnect();
      running.forEach(animation => animation.cancel());
      running.clear();
      if (preference.matches) return;

      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting || completed.has(target)) return;
          completed.add(target);
          observer.unobserve(target);
          const animation = target.animate(
            [
              { opacity: 0.65, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 850, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          );
          running.add(animation);
          animation.finished.then(
            () => running.delete(animation),
            () => running.delete(animation),
          );
        });
      }, { threshold: 0.12 });
      targets.forEach(target => {
        if (!completed.has(target)) observer.observe(target);
      });
    }

    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', syncPreference);
      running.forEach(animation => animation.cancel());
    };
  }, []);
}
