import { useEffect, useRef } from 'react';
import gsap from 'gsap';


export function useHeroAnimation() {
  const headlineRef = useRef(null);
  const pipelineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        gsap.fromTo(
          words,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: 'power2.out' }
        );
      }
      if (pipelineRef.current) {
        const steps = pipelineRef.current.querySelectorAll('.pipeline-step');
        gsap.fromTo(
          steps,
          { opacity: 0, x: 8 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.09, delay: 0.3, ease: 'power2.out' }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return { headlineRef, pipelineRef };
}

export function SplitWords({ text }) {
  return text.split(' ').map((word, i) => (
    <span key={i} className="word inline-block opacity-0">
      {word}
      {i < text.split(' ').length - 1 ? '\u00A0' : ''}
    </span>
  ));
}