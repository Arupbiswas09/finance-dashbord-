import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

/**
 * Custom hook for scroll-triggered reveal animations using IntersectionObserver
 * Returns a ref to attach to the element and a boolean indicating if it's visible
 */
export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
    delay = 0,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already animated and triggerOnce is true, don't observe again
    if (hasAnimated && triggerOnce) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                if (triggerOnce) {
                  setHasAnimated(true);
                  observer.unobserve(element);
                }
              }, delay);
            } else {
              setIsVisible(true);
              if (triggerOnce) {
                setHasAnimated(true);
                observer.unobserve(element);
              }
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated]);

  return { ref: elementRef, isVisible, hasAnimated };
};

