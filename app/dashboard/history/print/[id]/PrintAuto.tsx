'use client';

import { useEffect } from 'react';

export function PrintAuto() {
  useEffect(() => {
    // Give the browser a tick to paint before printing
    const t = window.setTimeout(() => {
      window.print();
    }, 250);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
