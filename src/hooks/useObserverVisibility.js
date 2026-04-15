import { useEffect, useState } from "react";

export const useObserverVisibility = (selector, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!selector) return;

    const observerOptions = {
      threshold: 0.1,
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      const anyVisible = entries.some((entry) => entry.isIntersecting);
      setIsVisible(anyVisible);
    }, observerOptions);

    const observedElements = new Set();

    const syncObservedElements = () => {
      const elements = Array.from(document.querySelectorAll(selector));

      // Observar nuevos elementos
      elements.forEach((element) => {
        if (!observedElements.has(element)) {
          observer.observe(element);
          observedElements.add(element);
        }
      });

      // Dejar de observar elementos removidos del DOM
      Array.from(observedElements).forEach((element) => {
        if (!elements.includes(element)) {
          observer.unobserve(element);
          observedElements.delete(element);
        }
      });

      if (elements.length === 0) {
        setIsVisible(false);
      }
    };

    // Primera sincronización y luego reaccionar a cambios del DOM
    syncObservedElements();

    const mutationObserver = new MutationObserver(() => {
      syncObservedElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observedElements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [selector, options.root, options.rootMargin, options.threshold]);

  return isVisible;
};
