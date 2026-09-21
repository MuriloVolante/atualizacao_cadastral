'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';
import type { QuestionType, ValidationConfig } from '@/lib/types';

type QuestionPayload = {
  id: string;
  parent_question_id: string | null;
  trigger_value: 'sim' | 'nao' | null;
  field_key: string;
  title: string;
  description: string;
  type: QuestionType;
  required: boolean;
  position: number;
  validation_config: ValidationConfig;
  options?: { id: string; label: string; value: string; position: number }[];
};

export async function createForm(formData: FormData) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const name = String(formData.get('name') || '').trim() || 'Formulário sem título';
  const description = String(formData.get('description') || '');
  const base = slugify(name) || 'formulario';
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from('forms')
    .insert({ name, description, slug, owner_id: user.user?.id ?? null })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/formularios');
  redirect(`/formulario/${data.id}/editor`);
}

export async function saveForm(payload: {
  formId: string;
  name: string;
  description: string;
  questions: QuestionPayload[];
}) {
  const supabase = await createClient();

  const { error: formError } = await supabase
    .from('forms')
    .update({ name: payload.name, description: payload.description })
    .eq('id', payload.formId);
  if (formError) return { ok: false, error: formError.message };

  const keepIds = payload.questions.map((q) => q.id);
  const { data: existing } = await supabase
    .from('form_questions')
    .select('id')
    .eq('form_id', payload.formId);

  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !keepIds.includes(id));
  if (toDelete.length) {
    const { error } = await supabase.from('form_questions').delete().in('id', toDelete);
    if (error) return { ok: false, error: error.message };
  }

  const rows = payload.questions.map((q) => ({
    id: q.id,
    form_id: payload.formId,
    parent_question_id: q.parent_question_id,
    trigger_value: q.parent_question_id ? q.trigger_value : null,
    field_key: q.field_key,
    title: q.title,
    description: q.description ?? '',
    type: q.type,
    required: q.required,
    position: q.position,
    validation_config: q.validation_config ?? {},
  }));

  const roots = rows.filter((r) => !r.parent_question_id);
  const children = rows.filter((r) => r.parent_question_id);

  for (const batch of [roots, children]) {
    if (!batch.length) continue;
    const { error } = await supabase.from('form_questions').upsert(batch);
    if (error) return { ok: false, error: error.message };
  }

  const optionRows = payload.questions.flatMap((q) =>
    (q.options ?? []).map((o) => ({
      id: o.id,
      question_id: q.id,
      label: o.label,
      value: o.value || o.label,
      position: o.position,
    })),
  );
  if (keepIds.length) {
    const { error } = await supabase.from('question_options').delete().in('question_id', keepIds);
    if (error) return { ok: false, error: error.message };
  }
  if (optionRows.length) {
    const { error } = await supabase.from('question_options').insert(optionRows);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/formulario/${payload.formId}/editor`);
  revalidatePath('/dashboard/formularios');
  return { ok: true as const };
}

export async function updateFormSettings(payload: {
  formId: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  access: string;
  opens_at: string | null;
  closes_at: string | null;
  closing_title: string;
  closing_message: string;
  cover_image_url: string | null;
}) {
  const supabase = await createClient();
  const { formId, ...rest } = payload;
  const { error } = await supabase.from('forms').update(rest).eq('id', formId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/formulario/${formId}/configuracoes`);
  revalidatePath('/dashboard/formularios');
  return { ok: true as const };
}

export async function setFormStatus(formId: string, status: string) {
  const supabase = await createClient();
  await supabase.from('forms').update({ status }).eq('id', formId);
  revalidatePath('/dashboard/formularios');
}

export async function deleteForm(formId: string) {
  const supabase = await createClient();
  await supabase.from('forms').delete().eq('id', formId);
  revalidatePath('/dashboard/formularios');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
