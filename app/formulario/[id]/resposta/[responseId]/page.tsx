import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFormById, flatOrdered } from '@/lib/queries';
import { displayValue, formatDateTimeBR } from '@/lib/format';

export default async function RespostaPage({
  params,
}: {
  params: Promise<{ id: string; responseId: string }>;
}) {
  const { id, responseId } = await params;
  const supabase = await createClient();
  const data = await getFormById(supabase, id);
  if (!data) notFound();

  const { data: response } = await supabase
    .from('responses')
    .select('id, created_at, completed_at, respondent_identifier, response_answers(question_id, value)')
    .eq('id', responseId)
    .maybeSingle();
  if (!response) notFound();

  const { data: files } = await supabase
    .from('files')
    .select('id, question_id, filename, storage_path, size')
    .eq('response_id', responseId);

  const signed = await Promise.all(
    (files ?? []).map(async (f) => {
      const { data: url } = await supabase.storage.from('anexos').createSignedUrl(f.storage_path, 3600);
      return { ...f, url: url?.signedUrl ?? null };
    }),
  );

  const answers = new Map(
    (response.response_answers as { question_id: string; value: unknown }[]).map((a) => [a.question_id, a.value]),
  );
  const questions = flatOrdered(data.questions);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/formulario/${id}/respostas`} className="btn-ghost mb-4">
        ← Respostas
      </Link>
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Resposta</h2>
        <p className="hint mb-5">Respondido em {formatDateTimeBR(response.created_at)}</p>
        <dl className="divide-y divide-[var(--line)]">
          {questions.map((q) => {
            const qFiles = signed.filter((f) => f.question_id === q.id);
            const value = answers.get(q.id);
            const shown =
              q.type === 'upload' ? (
                qFiles.length ? (
                  <ul className="space-y-1">
                    {qFiles.map((f) => (
                      <li key={f.id}>
                        {f.url ? (
                          <a href={f.url} target="_blank" className="text-[var(--brand)] underline">
                            {f.filename}
                          </a>
                        ) : (
                          f.filename
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )
              ) : (
                <span>{displayValue(q, value) || <span className="text-[var(--muted)]">—</span>}</span>
              );

            return (
              <div key={q.id} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
                <dt className="text-sm text-[var(--muted)]">
                  {q.parent_question_id && <span className="mr-1">↳</span>}
                  {q.title || q.field_key}
                </dt>
                <dd className="text-sm sm:col-span-2">{shown}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
