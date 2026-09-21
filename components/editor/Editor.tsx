'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import QuestionCard from './QuestionCard';
import { newQuestion, toEditorTree } from './types';
import type { EditorQuestion } from './types';
import FormRenderer from '@/components/FormRenderer';
import { saveForm } from '@/app/actions/forms';
import { slugify } from '@/lib/format';
import type { Form, Question } from '@/lib/types';

export default function Editor({ form, questions }: { form: Form; questions: Question[] }) {
  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description ?? '');
  const [tree, setTree] = useState<EditorQuestion[]>(toEditorTree(questions));
  const [tab, setTab] = useState<'editar' | 'visualizar'>('editar');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function updateRoot(id: string, updated: EditorQuestion) {
    setTree((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  function duplicate(q: EditorQuestion, parentId: string | null): EditorQuestion {
    const id = crypto.randomUUID();
    return {
      ...q,
      id,
      parent_question_id: parentId,
      field_key: '',
      options: q.options.map((o) => ({ ...o, id: crypto.randomUUID() })),
      children: q.children.map((c) => duplicate(c, id)),
    };
  }

  function onDragEndRoots(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTree((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function onDragEndChildren(parentId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTree((prev) =>
      prev.map((q) => {
        if (q.id !== parentId) return q;
        const oldIndex = q.children.findIndex((c) => c.id === active.id);
        const newIndex = q.children.findIndex((c) => c.id === over.id);
        return { ...q, children: arrayMove(q.children, oldIndex, newIndex) };
      }),
    );
  }

  function flatten(): Parameters<typeof saveForm>[0]['questions'] {
    const rows: Parameters<typeof saveForm>[0]['questions'] = [];
    tree.forEach((q, index) => {
      rows.push({
        id: q.id,
        parent_question_id: null,
        trigger_value: null,
        field_key: q.field_key || slugify(q.title) || `campo_${q.id.slice(0, 6)}`,
        title: q.title,
        description: q.description,
        type: q.type,
        required: q.required,
        position: index,
        validation_config: q.validation_config,
        options: q.options.map((o, i) => ({ ...o, position: i })),
      });
      if (q.type === 'sim_nao') {
        q.children.forEach((child, childIndex) => {
          rows.push({
            id: child.id,
            parent_question_id: q.id,
            trigger_value: child.trigger_value ?? 'nao',
            field_key: child.field_key || slugify(child.title) || `campo_${child.id.slice(0, 6)}`,
            title: child.title,
            description: child.description,
            type: child.type,
            required: child.required,
            position: childIndex,
            validation_config: child.validation_config,
            options: child.options.map((o, i) => ({ ...o, position: i })),
          });
        });
      }
    });
    return rows;
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveForm({
        formId: form.id,
        name,
        description,
        questions: flatten(),
      });
      setMessage(result.ok ? 'Formulário salvo.' : `Erro: ${result.error}`);
    });
  }

  const previewQuestions: Question[] = tree.map((q, index) => ({
    id: q.id,
    form_id: form.id,
    parent_question_id: null,
    trigger_value: null,
    field_key: q.field_key,
    title: q.title,
    description: q.description,
    type: q.type,
    required: q.required,
    position: index,
    validation_config: q.validation_config,
    options: q.options.map((o) => ({ ...o, question_id: q.id })),
    children:
      q.type === 'sim_nao'
        ? q.children.map((c, childIndex) => ({
            id: c.id,
            form_id: form.id,
            parent_question_id: q.id,
            trigger_value: c.trigger_value,
            field_key: c.field_key,
            title: c.title,
            description: c.description,
            type: c.type,
            required: c.required,
            position: childIndex,
            validation_config: c.validation_config,
            options: c.options.map((o) => ({ ...o, question_id: c.id })),
            children: [],
          }))
        : [],
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            className={tab === 'editar' ? 'btn-primary' : 'btn-ghost'}
            onClick={() => setTab('editar')}
          >
            Editar
          </button>
          <button
            className={tab === 'visualizar' ? 'btn-primary' : 'btn-ghost'}
            onClick={() => setTab('visualizar')}
          >
            Visualizar
          </button>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="hint">{message}</span>}
          <Link href={`/formulario/${form.id}/configuracoes`} className="btn-ghost">
            Configurações
          </Link>
          <button className="btn-primary" onClick={save} disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {tab === 'editar' ? (
        <div className="space-y-4">
          <div className="card space-y-4 p-5">
            <div>
              <label className="label">Título</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <p className="text-sm font-semibold text-[var(--muted)]">PERGUNTAS</p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndRoots}>
            <SortableContext items={tree.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {tree.map((q, index) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={String(index + 1)}
                    onChange={(updated) => updateRoot(q.id, updated)}
                    onDuplicate={() =>
                      setTree((prev) => {
                        const copy = duplicate(q, null);
                        const at = prev.findIndex((x) => x.id === q.id);
                        return [...prev.slice(0, at + 1), copy, ...prev.slice(at + 1)];
                      })
                    }
                    onRemove={() => setTree((prev) => prev.filter((x) => x.id !== q.id))}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => onDragEndChildren(q.id, e)}
                    >
                      <SortableContext
                        items={q.children.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {q.children.map((child, childIndex) => (
                            <QuestionCard
                              key={child.id}
                              question={child}
                              index={`${index + 1}.${childIndex + 1}`}
                              isChild
                              onChange={(updated) =>
                                updateRoot(q.id, {
                                  ...q,
                                  children: q.children.map((c) => (c.id === child.id ? updated : c)),
                                })
                              }
                              onDuplicate={() =>
                                updateRoot(q.id, {
                                  ...q,
                                  children: [...q.children, duplicate(child, q.id)],
                                })
                              }
                              onRemove={() =>
                                updateRoot(q.id, {
                                  ...q,
                                  children: q.children.filter((c) => c.id !== child.id),
                                })
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </QuestionCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            className="btn-ghost w-full"
            onClick={() => setTree((prev) => [...prev, newQuestion(null, prev.length)])}
          >
            + Adicionar pergunta
          </button>
        </div>
      ) : (
        <div>
          <div className="card mb-4 p-5">
            <h2 className="text-lg font-semibold">{name}</h2>
            {description && <p className="hint mt-1">{description}</p>}
          </div>
          <FormRenderer form={{ ...form, name, description }} questions={previewQuestions} preview />
        </div>
      )}
    </div>
  );
}
