'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QUESTION_TYPES } from '@/lib/types';
import type { QuestionType } from '@/lib/types';
import ValidationEditor from './ValidationEditor';
import OptionsEditor from './OptionsEditor';
import { defaultValidation, newQuestion, OPTION_DEFAULTS } from './types';
import type { EditorQuestion } from './types';
import { slugify } from '@/lib/format';

type Props = {
  question: EditorQuestion;
  index: string;
  isChild?: boolean;
  onChange: (q: EditorQuestion) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  children?: React.ReactNode;
};

export default function QuestionCard({
  question,
  index,
  isChild = false,
  onChange,
  onDuplicate,
  onRemove,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const patch = (partial: Partial<EditorQuestion>) => onChange({ ...question, ...partial });

  function changeType(type: QuestionType) {
    const options =
      OPTION_DEFAULTS[type]?.map((label, position) => ({
        id: crypto.randomUUID(),
        label,
        value: label,
        position,
      })) ?? [];
    patch({
      type,
      validation_config: defaultValidation(type),
      options: OPTION_DEFAULTS[type] ? (question.options.length ? question.options : options) : [],
      children: type === 'sim_nao' && !isChild ? question.children : [],
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card p-4 ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <button
          type="button"
          className="cursor-grab select-none px-1 pt-2 text-[var(--muted)]"
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
        >
          ☰
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">{index}.</span>
            <input
              className="input"
              placeholder="Título da pergunta"
              value={question.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>
          <input
            className="input mt-2"
            placeholder="Descrição (opcional)"
            value={question.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={question.type} onChange={(e) => changeType(e.target.value as QuestionType)}>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Identificador do campo</label>
          <input
            className="input"
            placeholder={slugify(question.title) || 'campo'}
            value={question.field_key}
            onChange={(e) => patch({ field_key: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => patch({ required: e.target.checked })}
            />
            Pergunta obrigatória
          </label>
        </div>
      </div>

      {(question.type === 'multipla_escolha' || question.type === 'selecao_multipla') && (
        <div className="mt-4">
          <OptionsEditor options={question.options} onChange={(options) => patch({ options })} />
        </div>
      )}

      <div className="mt-4">
        <ValidationEditor
          type={question.type}
          config={question.validation_config}
          onChange={(validation_config) => patch({ validation_config })}
        />
      </div>

      {isChild && (
        <div className="mt-3">
          <label className="label">Exibir quando a resposta da pergunta pai for</label>
          <select
            className="input"
            value={question.trigger_value ?? 'nao'}
            onChange={(e) => patch({ trigger_value: e.target.value as 'sim' | 'nao' })}
          >
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      )}

      {question.type === 'sim_nao' && !isChild && (
        <div className="mt-4 rounded-lg border border-[var(--line)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Subperguntas</p>
            <span className="hint">Abrem conforme a resposta configurada em cada subpergunta.</span>
          </div>
          {children}
          <button
            type="button"
            className="btn-ghost mt-3"
            onClick={() =>
              patch({ children: [...question.children, newQuestion(question.id, question.children.length)] })
            }
          >
            + Adicionar subpergunta
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-ghost" onClick={onDuplicate}>
          Duplicar
        </button>
        <button type="button" className="btn-danger" onClick={onRemove}>
          Excluir
        </button>
      </div>
    </div>
  );
}
