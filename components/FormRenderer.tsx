'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { submitResponse } from '@/app/actions/public';
import { applyMask, maskFor, storedValue } from '@/lib/format';
import { validateAnswer } from '@/lib/validation';
import type { AnswerValue } from '@/lib/validation';
import type { Form, Question } from '@/lib/types';
import { MIME_BY_EXT } from '@/lib/types';

type Props = { form: Form; questions: Question[]; preview?: boolean };

export default function FormRenderer({ form, questions, preview = false }: Props) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const visibleQuestions = useMemo(() => {
    const list: Question[] = [];
    for (const q of questions) {
      list.push(q);
      for (const child of q.children ?? []) {
        if (answers[q.id] === child.trigger_value) list.push(child);
      }
    }
    return list;
  }, [questions, answers]);

  function setAnswer(q: Question, value: AnswerValue) {
    setAnswers((prev) => {
      const next = { ...prev, [q.id]: value };
      if (q.type === 'sim_nao') {
        for (const child of q.children ?? []) {
          if (value !== child.trigger_value) delete next[child.id];
        }
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [q.id]: '' }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const nextErrors: Record<string, string> = {};
    for (const q of visibleQuestions) {
      const error = validateAnswer(q, answers[q.id] ?? null, (files[q.id] ?? []).length);
      if (error) nextErrors[q.id] = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (preview) return;

    setSending(true);
    try {
      const supabase = createClient();
      const folder = crypto.randomUUID();
      const uploaded: {
        questionId: string;
        filename: string;
        storagePath: string;
        size: number;
        mimeType: string;
      }[] = [];

      for (const q of visibleQuestions) {
        for (const file of files[q.id] ?? []) {
          const safeName = file.name.replace(/[^\w.\-]+/g, '_');
          const path = `${form.id}/${folder}/${crypto.randomUUID()}-${safeName}`;
          const { error } = await supabase.storage.from('anexos').upload(path, file);
          if (error) throw new Error('Falha ao enviar anexo: ' + file.name);
          uploaded.push({
            questionId: q.id,
            filename: file.name,
            storagePath: path,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
          });
        }
      }

      const identifierQuestion = visibleQuestions.find(
        (q) => q.validation_config?.content === 'cpf' || q.validation_config?.content === 'cnpj',
      );

      const result = await submitResponse({
        formId: form.id,
        respondentIdentifier: identifierQuestion
          ? String(answers[identifierQuestion.id] ?? '') || null
          : null,
        answers: visibleQuestions
          .filter((q) => q.type !== 'upload')
          .map((q) => ({ questionId: q.id, value: answers[q.id] ?? null })),
        files: uploaded,
      });

      if (!result.ok) {
        setGlobalError(result.error);
        setSending(false);
        return;
      }
      setDone(true);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
    setSending(false);
  }

  if (done) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-xl font-semibold">{form.closing_title || 'Atualização concluída!'}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{form.closing_message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {questions.map((q, index) => (
        <div key={q.id} className="card p-5">
          <QuestionField
            question={q}
            index={index + 1}
            value={answers[q.id] ?? null}
            files={files[q.id] ?? []}
            error={errors[q.id]}
            onChange={(v) => setAnswer(q, v)}
            onFiles={(f) => setFiles((prev) => ({ ...prev, [q.id]: f }))}
          />
          {(q.children ?? [])
            .filter((child) => answers[q.id] === child.trigger_value)
            .map((child, childIndex) => (
              <div key={child.id} className="mt-4 border-l-2 border-blue-200 pl-4">
                <QuestionField
                  question={child}
                  index={`${index + 1}.${childIndex + 1}`}
                  value={answers[child.id] ?? null}
                  files={files[child.id] ?? []}
                  error={errors[child.id]}
                  onChange={(v) => setAnswer(child, v)}
                  onFiles={(f) => setFiles((prev) => ({ ...prev, [child.id]: f }))}
                />
              </div>
            ))}
        </div>
      ))}

      {globalError && <p className="text-sm text-red-600">{globalError}</p>}

      <div className="flex justify-end">
        <button className="btn-primary" disabled={sending || preview}>
          {preview ? 'Enviar (desativado no preview)' : sending ? 'Enviando...' : 'Enviar respostas'}
        </button>
      </div>
    </form>
  );
}

function QuestionField({
  question,
  index,
  value,
  files,
  error,
  onChange,
  onFiles,
}: {
  question: Question;
  index: number | string;
  value: AnswerValue;
  files: File[];
  error?: string;
  onChange: (v: AnswerValue) => void;
  onFiles: (f: File[]) => void;
}) {
  const cfg = question.validation_config || {};
  const mask = maskFor(cfg);
  const attachments = cfg.attachments;
  const accept = (attachments?.types ?? ['PDF', 'JPG', 'PNG'])
    .map((t) => MIME_BY_EXT[t])
    .filter(Boolean)
    .join(',');

  return (
    <div>
      <label className="label">
        <span className="mr-1 text-[var(--muted)]">{index}.</span>
        {question.title || 'Pergunta sem título'}
        {question.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {question.description && <p className="hint mb-2">{question.description}</p>}

      {question.type === 'texto' && (
        <input
          className="input"
          value={applyMask(mask, String(value ?? ''))}
          maxLength={mask === 'nenhuma' ? (cfg.maxLength ?? undefined) : undefined}
          onChange={(e) => onChange(storedValue(cfg, e.target.value))}
        />
      )}

      {question.type === 'texto_longo' && (
        <textarea
          className="input"
          rows={4}
          value={String(value ?? '')}
          maxLength={cfg.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'numero' && (
        <input
          className="input"
          type="number"
          value={String(value ?? '')}
          min={cfg.min ?? undefined}
          max={cfg.max ?? undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'data' && (
        <input
          className="input"
          type="date"
          value={String(value ?? '')}
          min={cfg.minDate ?? undefined}
          max={cfg.maxDate ?? undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'multipla_escolha' && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {question.type === 'selecao_multipla' && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            return (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={arr.includes(opt.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked ? [...arr, opt.value] : arr.filter((v) => v !== opt.value),
                    )
                  }
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}

      {question.type === 'sim_nao' && (
        <div className="space-y-2">
          {[
            { v: 'sim', l: 'Sim' },
            { v: 'nao', l: 'Não' },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={value === o.v}
                onChange={() => onChange(o.v)}
              />
              {o.l}
            </label>
          ))}
        </div>
      )}

      {question.type === 'upload' && (
        <div>
          <input
            type="file"
            multiple={(attachments?.maxCount ?? 1) > 1}
            accept={accept || undefined}
            className="text-sm"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              const maxSize = (attachments?.maxSizeMb ?? 10) * 1024 * 1024;
              onFiles(list.filter((f) => f.size <= maxSize).slice(0, attachments?.maxCount ?? 3));
            }}
          />
          <p className="hint mt-1">
            {(attachments?.types ?? ['PDF', 'JPG', 'PNG']).join(', ')} · até {attachments?.maxSizeMb ?? 10}MB ·
            máximo {attachments?.maxCount ?? 3} arquivo(s)
          </p>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              {files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
