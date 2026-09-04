import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const objRef = useRef({ val: 0 });

  useEffect(() => {
    const obj = objRef.current;
    const tween = gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setDisplay(obj.val),
    });
    return () => tween.kill();
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}