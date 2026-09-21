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

  const { data, error } = await supabase.rpc('submit_response', {
    p_form_id: payload.formId,
    p_identifier: payload.respondentIdentifier,
    p_answers: payload.answers,
    p_files: payload.files,
  });

  if (error) {
    return { ok: false as const, error: 'Não foi possível registrar sua resposta.' };
  }

  return { ok: true as const, responseId: data as string };
}
