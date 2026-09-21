import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FormTabs from '@/components/FormTabs';

export default async function FormLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', auth.user?.id ?? '')
    .maybeSingle();
  if (profile?.must_change_password) redirect('/trocar-senha');

  const { data: form } = await supabase.from('forms').select('id, name, slug').eq('id', id).maybeSingle();
  if (!form) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/formularios" className="btn-ghost">
              ← Formulários
            </Link>
            <h1 className="font-medium">{form.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <FormTabs id={form.id} />
            <Link href={`/f/${form.slug}`} target="_blank" className="btn-ghost">
              Abrir público
            </Link>
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
