import { Suspense } from 'react';
import type { Metadata } from 'next';
import NavProgress from '@/components/NavProgress';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plataforma de Formulários',
  description: 'Criação, publicação e coleta de respostas de formulários.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
