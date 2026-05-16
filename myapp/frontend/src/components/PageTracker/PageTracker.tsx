'use client';

import { useEffect } from 'react';

export default function PageTracker() {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
      method: 'POST',
    }).catch(() => {});
  }, []);

  return null;
}
