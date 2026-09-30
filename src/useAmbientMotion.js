import { useEffect } from 'react';
import { content as c } from './content';

// Animate only when entering the viewport. Content stays readable if motion is unavailable.
export function useAmbientMotion() {
  useEffect(() => {
    if (!c.appearance.motion || !window.IntersectionObserver || !Element.prototype.animate) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const completed = new WeakSet();
    const running = new Set();
    const targets = document.querySelectorAll(
      '.hero h1 > span, .hero-title > .eyebrow, .hero-bottom > p, main h2, .transport h3, .pause-story, .section-heading > p',
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
          const heroLine = target.matches('.hero h1 > span');
          const heroDelay = heroLine ? [...target.parentElement.children].indexOf(target) * 160 : 0;
          const animation = target.animate(
            [
              { opacity: 0.2, transform: 'translateY(28px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: heroLine ? 1400 : 1100, delay: heroDelay, fill: 'backwards', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
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
