'use client';

import { CONTENT_RULES, DEFAULT_ATTACHMENTS } from '@/lib/types';
import type { QuestionType, ValidationConfig } from '@/lib/types';

const FILE_TYPES = ['PDF', 'JPG', 'PNG', 'DOCX', 'XLSX'];

export default function ValidationEditor({
  type,
  config,
  onChange,
}: {
  type: QuestionType;
  config: ValidationConfig;
  onChange: (cfg: ValidationConfig) => void;
}) {
  const attachments = config.attachments ?? DEFAULT_ATTACHMENTS;
  const patch = (partial: Partial<ValidationConfig>) => onChange({ ...config, ...partial });

  return (
    <div className="space-y-4 rounded-lg bg-gray-50 p-4">
      <p className="text-sm font-medium">Validação</p>

      {(type === 'texto' || type === 'texto_longo') && (
        <>
          <div>
            <label className="label">Tipo de conteúdo</label>
            <select
              className="input"
              value={config.content ?? 'qualquer'}
              onChange={(e) => patch({ content: e.target.value as ValidationConfig['content'] })}
            >
              {CONTENT_RULES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Mínimo de caracteres</label>
              <input
                className="input"
                type="number"
                value={config.minLength ?? ''}
                onChange={(e) => patch({ minLength: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Máximo de caracteres</label>
              <input
                className="input"
                type="number"
                value={config.maxLength ?? ''}
                onChange={(e) => patch({ maxLength: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
          </div>
          {type === 'texto' && (
            <div>
              <label className="label">Máscara de exibição</label>
              <select
                className="input"
                value={config.mask ?? 'nenhuma'}
                onChange={(e) => patch({ mask: e.target.value as ValidationConfig['mask'] })}
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="cpf">CPF — 123.456.789-01</option>
                <option value="cnpj">CNPJ — 12.345.678/0001-99</option>
                <option value="telefone">Telefone — (43) 99999-9999</option>
                <option value="cep">CEP — 86000-000</option>
              </select>
              <p className="hint mt-1">O valor é armazenado sem formatação.</p>
            </div>
          )}
        </>
      )}

      {type === 'numero' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor mínimo</label>
            <input
              className="input"
              type="number"
              value={config.min ?? ''}
              onChange={(e) => patch({ min: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Valor máximo</label>
            <input
              className="input"
              type="number"
              value={config.max ?? ''}
              onChange={(e) => patch({ max: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {type === 'data' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data mínima</label>
            <input
              className="input"
              type="date"
              value={config.minDate ?? ''}
              onChange={(e) => patch({ minDate: e.target.value || null })}
            />
          </div>
          <div>
            <label className="label">Data máxima</label>
            <input
              className="input"
              type="date"
              value={config.maxDate ?? ''}
              onChange={(e) => patch({ maxDate: e.target.value || null })}
            />
          </div>
        </div>
      )}

      {type === 'upload' && (
        <div className="space-y-3">
          <div>
            <p className="label">Tipos permitidos</p>
            <div className="flex flex-wrap gap-3">
              {FILE_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={attachments.types.includes(t)}
                    onChange={(e) =>
                      patch({
                        attachments: {
                          ...attachments,
                          enabled: true,
                          types: e.target.checked
                            ? [...attachments.types, t]
                            : attachments.types.filter((x) => x !== t),
                        },
                      })
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tamanho máximo (MB)</label>
              <input
                className="input"
                type="number"
                value={attachments.maxSizeMb}
                onChange={(e) =>
                  patch({ attachments: { ...attachments, enabled: true, maxSizeMb: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <label className="label">Quantidade máxima</label>
              <input
                className="input"
                type="number"
                value={attachments.maxCount}
                onChange={(e) =>
                  patch({ attachments: { ...attachments, enabled: true, maxCount: Number(e.target.value) } })
                }
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Campo pré-preenchido (opcional)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Fonte de dados"
            value={config.prefill?.source ?? ''}
            onChange={(e) => patch({ prefill: { ...config.prefill, source: e.target.value } })}
          />
          <input
            className="input"
            placeholder="Campo da fonte"
            value={config.prefill?.field ?? ''}
            onChange={(e) => patch({ prefill: { ...config.prefill, field: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
}
