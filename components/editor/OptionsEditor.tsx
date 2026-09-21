'use client';

import type { EditorOption } from './types';

export default function OptionsEditor({
  options,
  onChange,
}: {
  options: EditorOption[];
  onChange: (options: EditorOption[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="label">Opções</p>
      {options.map((opt, index) => (
        <div key={opt.id} className="flex gap-2">
          <input
            className="input"
            value={opt.label}
            placeholder={`Opção ${index + 1}`}
            onChange={(e) =>
              onChange(
                options.map((o) =>
                  o.id === opt.id ? { ...o, label: e.target.value, value: e.target.value } : o,
                ),
              )
            }
          />
          <button
            type="button"
            className="btn-ghost shrink-0"
            onClick={() => onChange(options.filter((o) => o.id !== opt.id).map((o, i) => ({ ...o, position: i })))}
          >
            Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost"
        onClick={() =>
          onChange([
            ...options,
            { id: crypto.randomUUID(), label: '', value: '', position: options.length },
          ])
        }
      >
        + Adicionar opção
      </button>
    </div>
  );
}
