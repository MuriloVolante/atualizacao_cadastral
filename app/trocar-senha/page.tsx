import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChangePasswordForm from './ChangePasswordForm';

export default async function TrocarSenhaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password, username')
    .eq('id', data.user.id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <h1 className="text-lg font-semibold">
          {profile?.must_change_password ? 'Defina sua senha' : 'Alterar senha'}
        </h1>
        <p className="hint mt-1 mb-5">
          {profile?.must_change_password
            ? 'Este é seu primeiro acesso. Crie uma senha pessoal para continuar.'
            : 'Informe a nova senha e confirme para alterar.'}
        </p>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
