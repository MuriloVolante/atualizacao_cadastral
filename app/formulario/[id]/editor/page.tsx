import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFormById } from '@/lib/queries';
import Editor from '@/components/editor/Editor';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const data = await getFormById(supabase, id);
  if (!data) notFound();

  return <Editor form={data.form} questions={data.questions} />;
}
