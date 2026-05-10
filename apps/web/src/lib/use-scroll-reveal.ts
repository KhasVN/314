'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE = 20;

export function useScrollReveal<T>(
  items: readonly T[],
  options?: { pageSize?: number; resetKey?: string | number },
) {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE;
  const resetKey = options?.resetKey ?? '';

  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(pageSize, items.length),
  );

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, items.length));
  }, [resetKey, pageSize, items.length]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || items.length === 0 || visibleCount >= items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + pageSize, items.length));
        }
      },
      { root: null, rootMargin: '320px', threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [items.length, pageSize, visibleCount]);

  const visibleItems = items.slice(0, visibleCount) as T[];
  const hasMore = visibleCount < items.length;

  return { visibleItems, sentinelRef, hasMore, totalShown: visibleItems.length, total: items.length };
}
