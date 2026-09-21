'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { formatDateTimeBR } from '@/lib/format';
import type { Profile } from '@/lib/types';
import { createUser, deleteUser, resetUserPassword, updateUser } from '@/app/actions/users';

const DEFAULT_PASSWORD = 'formularios2026';

export default function UsersManager({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState({ username: '', email: '' });
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editValues, setEditValues] = useState({ username: '', email: '' });

  function run(id: string | null, action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setMessage(null);
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await action();
      setBusyId(null);
      if (!result.ok) {
        setError(result.error ?? 'Erro inesperado.');
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuários</h1>
      </div>
      <p className="hint mb-5">
        Todos os usuários têm acesso à gestão. A senha inicial é <strong>{DEFAULT_PASSWORD}</strong> e é trocada
        no primeiro acesso.
      </p>

      <div className="card mb-4 p-5">
        <h2 className="mb-3 text-sm font-semibold">Novo usuário</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              'novo',
              async () => {
                const result = await createUser(creating.username, creating.email);
                if (result.ok) setCreating({ username: '', email: '' });
                return result;
              },
              'Usuário criado com a senha padrão.',
            );
          }}
        >
          <div className="min-w-[200px] flex-1">
            <label className="label">Nome de usuário</label>
            <input
              className="input"
              value={creating.username}
              onChange={(e) => setCreating({ ...creating, username: e.target.value })}
              placeholder="joao.silva"
              required
            />
          </div>
          <div className="min-w-[240px] flex-1">
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              value={creating.email}
              onChange={(e) => setCreating({ ...creating, email: e.target.value })}
              placeholder="joao@empresa.com"
              required
            />
          </div>
          <button className="btn-primary" disabled={pending}>
            {busyId === 'novo' && <Spinner />}
            {busyId === 'novo' ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>

      {(message || error) && (
        <p className={`mb-3 text-sm ${error ? 'text-red-600' : 'text-green-700'}`}>{error ?? message}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--line)] bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nome de usuário</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Senha</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-3">
                  {user.username}
                  {user.id === currentUserId && <span className="hint ml-2">(você)</span>}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`chip ${
                      user.must_change_password ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.must_change_password ? 'Padrão (troca no 1º acesso)' : 'Definida pelo usuário'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatDateTimeBR(user.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-ghost"
                      disabled={pending}
                      onClick={() => {
                        setEditing(user);
                        setEditValues({ username: user.username, email: user.email });
                        setMessage(null);
                        setError(null);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      disabled={pending || user.id === currentUserId}
                      onClick={() => {
                        if (!confirm(`Excluir o usuário ${user.username}?`)) return;
                        run(user.id, () => deleteUser(user.id), 'Usuário excluído.');
                      }}
                    >
                      {busyId === user.id && <Spinner />}
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card mt-4 space-y-4 p-5">
          <h2 className="text-sm font-semibold">Editar usuário</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Nome de usuário</label>
              <input
                className="input"
                value={editValues.username}
                onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
              />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                value={editValues.email}
                onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() =>
                run(
                  editing.id,
                  async () => {
                    const result = await updateUser(editing.id, editValues.username, editValues.email);
                    if (result.ok) setEditing(null);
                    return result;
                  },
                  'Usuário atualizado.',
                )
              }
            >
              {busyId === editing.id && <Spinner />}
              {busyId === editing.id ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button
              className="btn-ghost"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Resetar a senha de ${editing.username} para a padrão?`)) return;
                run(editing.id, () => resetUserPassword(editing.id), 'Senha redefinida para a padrão.');
              }}
            >
              Resetar senha para padrão
            </button>
            <button className="btn-ghost" disabled={pending} onClick={() => setEditing(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
