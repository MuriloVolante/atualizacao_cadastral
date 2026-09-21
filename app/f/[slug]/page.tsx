import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFormBySlug, buildTree, formOpenState } from '@/lib/queries';
import FormRenderer from '@/components/FormRenderer';

export const dynamic = 'force-dynamic';

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const data = await getFormBySlug(supabase, slug);
  if (!data) notFound();

  const state = formOpenState(data.form);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {data.form.cover_image_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={data.form.cover_image_url}
          alt=""
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      )}
      <div className="card mb-4 p-6">
        <h1 className="text-xl font-semibold">{data.form.name}</h1>
        {data.form.description && <p className="hint mt-1">{data.form.description}</p>}
      </div>

      {state === 'aberto' ? (
        <FormRenderer form={data.form} questions={buildTree(data.questions)} />
      ) : (
        <div className="card p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            {state === 'aguardando'
              ? 'Este formulário ainda não está aberto para respostas.'
              : 'Este formulário não está mais aceitando respostas.'}
          </p>
        </div>
      )}
    </main>
  );
}
