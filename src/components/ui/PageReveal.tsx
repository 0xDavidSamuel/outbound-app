'use client';

import { useEffect, useState } from 'react';

export default function PageReveal({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .page-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.45s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .page-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <div className={`page-reveal${revealed ? ' visible' : ''}`}>
        {children}
      </div>
    </>
  );
}
