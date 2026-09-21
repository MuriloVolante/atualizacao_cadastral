import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/SettingsForm';
import type { Form } from '@/lib/types';

export default async function ConfiguracoesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('forms').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();

  return <SettingsForm form={data as Form} />;
}
