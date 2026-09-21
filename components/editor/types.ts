import type { Question, QuestionType, ValidationConfig } from '@/lib/types';
import { DEFAULT_ATTACHMENTS } from '@/lib/types';

export type EditorOption = { id: string; label: string; value: string; position: number };

export type EditorQuestion = {
  id: string;
  parent_question_id: string | null;
  trigger_value: 'sim' | 'nao' | null;
  field_key: string;
  title: string;
  description: string;
  type: QuestionType;
  required: boolean;
  position: number;
  validation_config: ValidationConfig;
  options: EditorOption[];
  children: EditorQuestion[];
};

export function defaultValidation(type: QuestionType): ValidationConfig {
  if (type === 'upload') return { attachments: { ...DEFAULT_ATTACHMENTS, enabled: true } };
  if (type === 'texto') return { content: 'qualquer', minLength: null, maxLength: null, mask: 'nenhuma' };
  if (type === 'numero') return { min: null, max: null };
  if (type === 'data') return { minDate: null, maxDate: null };
  return {};
}

export function newQuestion(parentId: string | null, position: number): EditorQuestion {
  const id = crypto.randomUUID();
  return {
    id,
    parent_question_id: parentId,
    trigger_value: parentId ? 'nao' : null,
    field_key: '',
    title: '',
    description: '',
    type: 'texto',
    required: false,
    position,
    validation_config: defaultValidation('texto'),
    options: [],
    children: [],
  };
}

export function toEditorTree(questions: Question[]): EditorQuestion[] {
  const map = new Map<string, EditorQuestion>();
  const roots: EditorQuestion[] = [];

  const convert = (q: Question): EditorQuestion => ({
    id: q.id,
    parent_question_id: q.parent_question_id,
    trigger_value: q.trigger_value,
    field_key: q.field_key,
    title: q.title,
    description: q.description ?? '',
    type: q.type,
    required: q.required,
    position: q.position,
    validation_config: q.validation_config ?? {},
    options: (q.options ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value,
      position: o.position,
    })),
    children: [],
  });

  questions
    .filter((q) => !q.parent_question_id)
    .sort((a, b) => a.position - b.position)
    .forEach((q) => {
      const item = convert(q);
      map.set(q.id, item);
      roots.push(item);
    });

  questions
    .filter((q) => q.parent_question_id)
    .sort((a, b) => a.position - b.position)
    .forEach((q) => {
      const parent = map.get(q.parent_question_id!);
      if (parent) parent.children.push(convert(q));
    });

  return roots;
}

export const OPTION_DEFAULTS: Record<string, string[]> = {
  multipla_escolha: ['Opção 1', 'Opção 2'],
  selecao_multipla: ['Opção 1', 'Opção 2'],
};
