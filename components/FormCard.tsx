'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Form } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/types';
import { formatDateTimeBR } from '@/lib/format';
import { deleteForm, setFormStatus } from '@/app/actions/forms';
import ShareBox from '@/components/ShareBox';

const STATUS_STYLE: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  ativo: 'bg-green-100 text-green-700',
  encerrado: 'bg-amber-100 text-amber-700',
  arquivado: 'bg-gray-100 text-gray-500',
};

export default function FormCard({ form }: { form: Form }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState(false);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{form.name}</h2>
            <span className={`chip ${STATUS_STYLE[form.status]}`}>{STATUS_LABEL[form.status]}</span>
          </div>
          <p className="hint mt-1">
            {form.responses_count ?? 0} respostas · Criado em {formatDateTimeBR(form.created_at)} · Alterado em{' '}
            {formatDateTimeBR(form.updated_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/f/${form.slug}`} target="_blank" className="btn-ghost">
            Abrir
          </Link>
          <Link href={`/formulario/${form.id}/editor`} className="btn-ghost">
            Editar
          </Link>
          <Link href={`/formulario/${form.id}/respostas`} className="btn-ghost">
            Respostas
          </Link>
          <div className="relative">
            <button className="btn-ghost px-2" onClick={() => setOpen(!open)} aria-label="Mais ações">
              ⋮
            </button>
            {open && (
              <div className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-[var(--line)] bg-white py-1 shadow-lg">
                <button
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => {
                    setShare(true);
                    setOpen(false);
                  }}
                >
                  Link público / QR Code
                </button>
                <Link
                  href={`/formulario/${form.id}/configuracoes`}
                  className="block px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Configurações
                </Link>
                {form.status !== 'ativo' && (
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={async () => {
                      await setFormStatus(form.id, 'ativo');
                      setOpen(false);
                      router.refresh();
                    }}
                  >
                    Ativar
                  </button>
                )}
                {form.status === 'ativo' && (
                  <button
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={async () => {
                      await setFormStatus(form.id, 'encerrado');
                      setOpen(false);
                      router.refresh();
                    }}
                  >
                    Encerrar
                  </button>
                )}
                <button
                  className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!confirm('Excluir este formulário e todas as respostas?')) return;
                    await deleteForm(form.id);
                    setOpen(false);
                    router.refresh();
                  }}
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {share && (
        <div className="mt-4 border-t border-[var(--line)] pt-4">
          <ShareBox slug={form.slug} />
        </div>
      )}
    </div>
  );
}
