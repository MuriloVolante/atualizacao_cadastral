import { createForm } from '@/app/actions/forms';
import SubmitButton from '@/components/SubmitButton';

export default function NovoFormulario() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Criar formulário</h1>
      <p className="hint mb-6">Defina título e descrição. As perguntas são adicionadas no editor.</p>
      <form action={createForm} className="card space-y-4 p-6">
        <div>
          <label className="label">Título</label>
          <input name="name" className="input" placeholder="Atualização Cadastral 2026" required />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea name="description" rows={3} className="input" placeholder="Confirme seus dados cadastrais..." />
        </div>
        <SubmitButton pendingLabel="Criando formulário...">Criar e abrir editor</SubmitButton>
      </form>
    </div>
  );
}
