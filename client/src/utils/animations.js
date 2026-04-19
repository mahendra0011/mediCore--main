import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Smooth reveal animation for sections
export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(elementRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        },
        ...options
      });
    });

    return () => ctx.revert();
  }, []);

  return elementRef;
};

// Stagger animation for lists/grids
export const useStaggerAnimation = (children, options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(children, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
        ...options
      });
    });

    return () => ctx.revert();
  }, [children]);

  return containerRef;
};

// Parallax effect for background elements
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return elementRef;
};

// Counter animation for stats
export const useCounter = (endValue, duration = 2, startOnView = true) => {
  const counterRef = useRef(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const ctx = gsap.context(() => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: endValue,
        duration,
        ease: 'power2.out',
        scrollTrigger: startOnView ? {
          trigger: counterRef.current,
          start: 'top 80%',
          once: true
        } : null,
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.floor(obj.value).toLocaleString();
          }
        }
      });
    });

    return () => ctx.revert();
  }, [endValue, duration, startOnView]);

  return counterRef;
};

// Magnetic button effect
export const useMagnetic = (elementRef, strength = 0.3) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const bounds = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });

      bounds.x = x;
      bounds.y = y;
    };

    const onMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [strength]);
};

// Text scramble effect
export const useTextScramble = (text, duration = 1) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const chars = '!<>-_\\/{}[]=+*^?#';
    let frames = 0;
    const totalFrames = 30;

    const update = () => {
      const progress = frames / totalFrames;
      const charsCount = chars.length;

      el.innerHTML = text
        .split('')
        .map((char, i) => {
          const start = Math.floor(i / text.length * totalFrames);
          const end = start + 10;

          if (progress < start / totalFrames) return char;
          if (progress > end / totalFrames) return char;

          const charIndex = Math.floor(Math.random() * charsCount);
          return chars[charIndex];
        })
        .join('');

      frames++;
      if (frames <= totalFrames) {
        requestAnimationFrame(update);
      } else {
        el.innerHTML = text;
      }
    };

    requestAnimationFrame(update);
  }, [text]);

  return ref;
};

// Tilt effect for cards
export const useTilt = (elementRef, maxTilt = 15) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const onMouseMove = (e) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const rotateX = ((y - height / 2) / height) * -maxTilt;
      const rotateY = ((x - width / 2) / width) * maxTilt;

      gsap.to(element, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1000,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [maxTilt]);
};

// Floating animation
export const useFloating = (ref, amplitude = 20, duration = 3) => {
  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: `+=${amplitude}`,
      duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, [amplitude, duration]);
};

// Smooth scale animation on hover
export const useSmoothHover = (ref, scale = 1.05) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const onMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', onMouseEnter);
      element.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [scale]);
};
