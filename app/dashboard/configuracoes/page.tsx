import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/forms';

export default async function Configuracoes() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold">Configurações</h1>
      <div className="card divide-y divide-[var(--line)]">
        <div className="p-5">
          <p className="label">Conta</p>
          <p className="text-sm">{data.user?.email}</p>
        </div>
        <div className="p-5">
          <p className="label">Sessão</p>
          <form action={signOut}>
            <button className="btn-danger">Encerrar sessão</button>
          </form>
        </div>
      </div>
    </div>
  );
}
