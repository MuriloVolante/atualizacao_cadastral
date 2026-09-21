'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { finishPasswordChange } from '@/app/actions/users';
import Spinner from '@/components/Spinner';

export default function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (password === 'formularios2026') {
      setError('Escolha uma senha diferente da senha padrão.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError('Não foi possível alterar a senha. Tente novamente.');
      return;
    }

    const result = await finishPasswordChange();
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.replace('/dashboard/formularios');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Nova senha</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">Confirme a nova senha</label>
        <input
          className="input"
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading && <Spinner />}
        {loading ? 'Salvando...' : 'Salvar senha'}
      </button>
    </form>
  );
}
