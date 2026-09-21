import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/forms';
import NavLink from '@/components/NavLink';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-white p-4 md:block">
        <Link href="/dashboard/formularios" className="mb-6 block text-sm font-semibold">
          Plataforma de Formulários
        </Link>
        <nav className="space-y-1">
          <NavLink href="/dashboard/formularios">Meus formulários</NavLink>
          <NavLink href="/dashboard/novo">Criar formulário</NavLink>
          <NavLink href="/dashboard/respostas">Respostas</NavLink>
          <NavLink href="/dashboard/configuracoes">Configurações</NavLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-white px-6 py-3">
          <div className="flex gap-4 md:hidden">
            <NavLink href="/dashboard/formularios">Formulários</NavLink>
            <NavLink href="/dashboard/novo">Criar</NavLink>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hint">{data.user?.email}</span>
            <form action={signOut}>
              <button className="btn-ghost">Sair</button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
