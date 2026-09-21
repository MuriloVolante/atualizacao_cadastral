import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { getFormById, flatOrdered } from '@/lib/queries';
import { displayValue, formatDateTimeBR, slugify } from '@/lib/format';

type AnswerRow = { question_id: string; value: unknown };
type FileRow = { question_id: string; filename: string };

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const format = new URL(request.url).searchParams.get('format') ?? 'csv';

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const data = await getFormById(supabase, id);
  if (!data) return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });

  const { data: responses } = await supabase
    .from('responses')
    .select('id, created_at, response_answers(question_id, value), files(question_id, filename)')
    .eq('form_id', id)
    .order('created_at', { ascending: true });

  const questions = flatOrdered(data.questions);
  const header = ['Data', ...questions.map((q) => q.title || q.field_key)];

  const rows = (responses ?? []).map((r) => {
    const answers = new Map((r.response_answers as AnswerRow[]).map((a) => [a.question_id, a.value]));
    const files = r.files as FileRow[];
    return [
      formatDateTimeBR(r.created_at),
      ...questions.map((q) =>
        q.type === 'upload'
          ? files.filter((f) => f.question_id === q.id).map((f) => f.filename).join(' | ')
          : displayValue(q, answers.get(q.id)),
      ),
    ];
  });

  const filename = `${slugify(data.form.name) || 'respostas'}-respostas`;

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Respostas');
    sheet.addRow(header);
    sheet.getRow(1).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((col) => {
      col.width = 24;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
