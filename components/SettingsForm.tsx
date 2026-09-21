'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateFormSettings } from '@/app/actions/forms';
import ShareBox from '@/components/ShareBox';
import Spinner from '@/components/Spinner';
import type { Form } from '@/lib/types';

const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export default function SettingsForm({ form }: { form: Form }) {
  const router = useRouter();
  const [state, setState] = useState({
    name: form.name,
    description: form.description ?? '',
    slug: form.slug,
    status: form.status as string,
    access: form.access as string,
    opens_at: toLocalInput(form.opens_at),
    closes_at: toLocalInput(form.closes_at),
    closing_title: form.closing_title ?? '',
    closing_message: form.closing_message ?? '',
    cover_image_url: form.cover_image_url ?? '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const patch = (p: Partial<typeof state>) => setState((prev) => ({ ...prev, ...p }));

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateFormSettings({
        formId: form.id,
        name: state.name,
        description: state.description,
        slug: state.slug,
        status: state.status,
        access: state.access,
        opens_at: state.opens_at ? new Date(state.opens_at).toISOString() : null,
        closes_at: state.closes_at ? new Date(state.closes_at).toISOString() : null,
        closing_title: state.closing_title,
        closing_message: state.closing_message,
        cover_image_url: state.cover_image_url || null,
      });
      setMessage(result.ok ? 'Configurações salvas.' : `Erro: ${result.error}`);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Geral</h2>
        <div>
          <label className="label">Título</label>
          <input className="input" value={state.name} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="input"
            rows={2}
            value={state.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Imagem / capa (URL)</label>
          <input
            className="input"
            value={state.cover_image_url}
            onChange={(e) => patch({ cover_image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="label">Endereço público</label>
          <div className="flex items-center gap-2">
            <span className="hint">/f/</span>
            <input className="input" value={state.slug} onChange={(e) => patch({ slug: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Acesso</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input" value={state.status} onChange={(e) => patch({ status: e.target.value })}>
              <option value="rascunho">Rascunho</option>
              <option value="ativo">Ativo</option>
              <option value="encerrado">Encerrado</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
          <div>
            <label className="label">Acesso</label>
            <select className="input" value={state.access} onChange={(e) => patch({ access: e.target.value })}>
              <option value="publico">Público</option>
              <option value="desativado">Desativado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Período</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Data de abertura</label>
            <input
              className="input"
              type="datetime-local"
              value={state.opens_at}
              onChange={(e) => patch({ opens_at: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Data de encerramento</label>
            <input
              className="input"
              type="datetime-local"
              value={state.closes_at}
              onChange={(e) => patch({ closes_at: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Página de encerramento</h2>
        <div>
          <label className="label">Título</label>
          <input
            className="input"
            value={state.closing_title}
            onChange={(e) => patch({ closing_title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Mensagem</label>
          <textarea
            className="input"
            rows={2}
            value={state.closing_message}
            onChange={(e) => patch({ closing_message: e.target.value })}
          />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Distribuição</h2>
        <ShareBox slug={form.slug} />
      </div>

      <div className="flex items-center justify-end gap-3">
        {message && <span className="hint">{message}</span>}
        <button className="btn-primary" onClick={save} disabled={pending}>
          {pending && <Spinner />}
          {pending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
}
