'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ShareBox({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const link = `${window.location.origin}/f/${slug}`;
    setUrl(link);
    QRCode.toDataURL(link, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [slug]);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="min-w-0 flex-1">
        <label className="label">Link público</label>
        <div className="flex gap-2">
          <input className="input" readOnly value={url} />
          <button
            className="btn-ghost shrink-0"
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'Copiado' : 'Copiar link'}
          </button>
        </div>
        <p className="hint mt-2">Distribua por WhatsApp, e-mail, cartazes, comunicados e intranet.</p>
      </div>
      {qr && (
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR Code" className="rounded-lg border border-[var(--line)]" width={140} height={140} />
          <a href={qr} download={`qrcode-${slug}.png`} className="hint mt-1 block underline">
            Baixar QR Code
          </a>
        </div>
      )}
    </div>
  );
}
