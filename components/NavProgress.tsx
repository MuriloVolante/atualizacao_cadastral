'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('/api/')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname + url.search === window.location.pathname + window.location.search) return;

      setLoading(true);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (!loading) return;
    document.body.classList.add('is-loading');
    const timer = setTimeout(() => setLoading(false), 20000);
    return () => {
      document.body.classList.remove('is-loading');
      clearTimeout(timer);
    };
  }, [loading]);

  if (!loading) return null;
  return (
    <>
      <div className="nav-progress" />
      <div className="nav-progress-badge">
        <span className="nav-progress-dot" />
        Carregando...
      </div>
    </>
  );
}
