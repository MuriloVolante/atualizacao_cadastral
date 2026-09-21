import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFormById, flatOrdered } from '@/lib/queries';
import { displayValue, formatDateTimeBR } from '@/lib/format';

type AnswerRow = { question_id: string; value: unknown };
type FileRow = { question_id: string; filename: string };
type ResponseRow = {
  id: string;
  created_at: string;
  response_answers: AnswerRow[];
  files: FileRow[];
};

export default async function RespostasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const data = await getFormById(supabase, id);
  if (!data) notFound();

  const { data: responses } = await supabase
    .from('responses')
    .select('id, created_at, response_answers(question_id, value), files(question_id, filename)')
    .eq('form_id', id)
    .order('created_at', { ascending: false })
    .limit(500);

  const rows = (responses ?? []) as ResponseRow[];
  const questions = flatOrdered(data.questions);
  const columns = questions.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{data.form.name}</h2>
          <p className="hint">{rows.length} respostas</p>
        </div>
        <div className="flex gap-2">
          <a className="btn-ghost" href={`/api/forms/${id}/export?format=csv`}>
            Exportar CSV
          </a>
          <a className="btn-ghost" href={`/api/forms/${id}/export?format=xlsx`}>
            Exportar Excel
          </a>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--line)] bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              {columns.map((q) => (
                <th key={q.id} className="px-4 py-3 font-medium">
                  {q.title || q.field_key}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[var(--muted)]" colSpan={columns.length + 2}>
                  Nenhuma resposta recebida.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const answers = new Map(r.response_answers.map((a) => [a.question_id, a.value]));
              return (
                <tr key={r.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTimeBR(r.created_at)}</td>
                  {columns.map((q) => (
                    <td key={q.id} className="px-4 py-3">
                      {q.type === 'upload'
                        ? r.files.filter((f) => f.question_id === q.id).map((f) => f.filename).join(', ')
                        : displayValue(q, answers.get(q.id))}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link className="text-[var(--brand)] underline" href={`/formulario/${id}/resposta/${r.id}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
