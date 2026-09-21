'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';


type Result = { ok: true } | { ok: false; error: string };

function fail(message?: string): Result {
  return { ok: false, error: message || 'Não foi possível concluir a operação.' };
}

export async function createUser(username: string, email: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_create_user', { p_username: username, p_email: email });
  if (error) return fail(error.message);
  revalidatePath('/dashboard/usuarios');
  return { ok: true };
}

export async function updateUser(id: string, username: string, email: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_update_user', {
    p_id: id,
    p_username: username,
    p_email: email,
  });
  if (error) return fail(error.message);
  revalidatePath('/dashboard/usuarios');
  return { ok: true };
}

export async function resetUserPassword(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_reset_password', { p_id: id });
  if (error) return fail(error.message);
  revalidatePath('/dashboard/usuarios');
  return { ok: true };
}

export async function deleteUser(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_delete_user', { p_id: id });
  if (error) return fail(error.message);
  revalidatePath('/dashboard/usuarios');
  return { ok: true };
}

export async function finishPasswordChange(): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('finish_password_change');
  if (error) return fail(error.message);
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}
