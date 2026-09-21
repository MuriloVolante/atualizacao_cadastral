'use server';

import { createClient } from '@/lib/supabase/server';

export type SubmitFilePayload = {
  questionId: string;
  filename: string;
  storagePath: string;
  size: number;
  mimeType: string;
};

export async function submitResponse(payload: {
  formId: string;
  respondentIdentifier: string | null;
  answers: { questionId: string; value: unknown }[];
  files: SubmitFilePayload[];
}) {
  const supabase = await createClient();

  const { data: response, error } = await supabase
    .from('responses')
    .insert({
      form_id: payload.formId,
      respondent_identifier: payload.respondentIdentifier,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !response) {
    return { ok: false as const, error: 'Não foi possível registrar sua resposta.' };
  }

  if (payload.answers.length) {
    const { error: answersError } = await supabase.from('response_answers').insert(
      payload.answers.map((a) => ({
        response_id: response.id,
        question_id: a.questionId,
        value: a.value ?? null,
      })),
    );
    if (answersError) return { ok: false as const, error: answersError.message };
  }

  if (payload.files.length) {
    const { error: filesError } = await supabase.from('files').insert(
      payload.files.map((f) => ({
        response_id: response.id,
        question_id: f.questionId,
        filename: f.filename,
        storage_path: f.storagePath,
        size: f.size,
        mime_type: f.mimeType,
      })),
    );
    if (filesError) return { ok: false as const, error: filesError.message };
  }

  return { ok: true as const, responseId: response.id };
}
