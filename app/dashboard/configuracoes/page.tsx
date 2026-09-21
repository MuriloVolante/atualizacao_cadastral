import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/forms';
import SubmitButton from '@/components/SubmitButton';

export default async function Configuracoes() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user?.id ?? '')
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold">Configurações</h1>
      <div className="card divide-y divide-[var(--line)]">
        <div className="p-5">
          <p className="label">Conta</p>
          <p className="text-sm">{profile?.username ?? data.user?.email}</p>
          <p className="hint">{data.user?.email}</p>
        </div>
        <div className="p-5">
          <p className="label">Senha</p>
          <Link href="/trocar-senha" className="btn-ghost">
            Alterar minha senha
          </Link>
        </div>
        <div className="p-5">
          <p className="label">Sessão</p>
          <form action={signOut}>
            <SubmitButton className="btn-danger" pendingLabel="Saindo...">
              Encerrar sessão
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
