import type { SupabaseClient } from '@supabase/supabase-js';
import type { Form, Question } from './types';

const QUESTION_SELECT = '*, question_options(*)';

type RawQuestion = Question & { question_options?: Question['options'] };

function normalize(rows: RawQuestion[]): Question[] {
  return rows.map((row) => ({
    ...row,
    options: (row.question_options ?? []).slice().sort((a, b) => a.position - b.position),
  }));
}

export function buildTree(questions: Question[]): Question[] {
  const roots = questions
    .filter((q) => !q.parent_question_id)
    .sort((a, b) => a.position - b.position)
    .map((q) => ({ ...q, children: [] as Question[] }));

  const byId = new Map(roots.map((q) => [q.id, q]));
  questions
    .filter((q) => q.parent_question_id)
    .sort((a, b) => a.position - b.position)
    .forEach((q) => byId.get(q.parent_question_id!)?.children.push({ ...q, children: [] }));

  return roots;
}

export function flatOrdered(questions: Question[]): Question[] {
  const out: Question[] = [];
  for (const root of buildTree(questions)) {
    out.push(root);
    (root.children ?? []).forEach((child) => out.push(child));
  }
  return out;
}

export async function getFormById(supabase: SupabaseClient, id: string) {
  const { data: form } = await supabase.from('forms').select('*').eq('id', id).maybeSingle();
  if (!form) return null;
  const { data: questions } = await supabase
    .from('form_questions')
    .select(QUESTION_SELECT)
    .eq('form_id', id)
    .order('position');
  return { form: form as Form, questions: normalize((questions ?? []) as RawQuestion[]) };
}

export async function getFormBySlug(supabase: SupabaseClient, slug: string) {
  const { data: form } = await supabase.from('forms').select('*').eq('slug', slug).maybeSingle();
  if (!form) return null;
  const { data: questions } = await supabase
    .from('form_questions')
    .select(QUESTION_SELECT)
    .eq('form_id', form.id)
    .order('position');
  return { form: form as Form, questions: normalize((questions ?? []) as RawQuestion[]) };
}

export function formOpenState(form: Form) {
  const now = new Date();
  if (form.access !== 'publico') return 'fechado' as const;
  if (form.status !== 'ativo') return 'fechado' as const;
  if (form.opens_at && new Date(form.opens_at) > now) return 'aguardando' as const;
  if (form.closes_at && new Date(form.closes_at) < now) return 'fechado' as const;
  return 'aberto' as const;
}
