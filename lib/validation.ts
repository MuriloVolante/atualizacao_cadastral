import { onlyDigits } from './format';
import type { Question, ValidationConfig } from './types';

export function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

export function isValidCNPJ(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = 0; i < len; i++) {
      sum += parseInt(cnpj[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === parseInt(cnpj[12]) && calc(13) === parseInt(cnpj[13]);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;

export function validateContent(cfg: ValidationConfig, value: string): string | null {
  const content = cfg.content ?? 'qualquer';
  const digits = onlyDigits(value);
  switch (content) {
    case 'numeros':
      if (!/^\d+$/.test(value.trim())) return 'Informe apenas números.';
      break;
    case 'letras':
      if (!/^[A-Za-zÀ-ÿ\s']+$/.test(value.trim())) return 'Informe apenas letras.';
      break;
    case 'email':
      if (!EMAIL_RE.test(value.trim())) return 'E-mail inválido.';
      break;
    case 'cpf':
      if (!isValidCPF(value)) return 'CPF inválido.';
      break;
    case 'cnpj':
      if (!isValidCNPJ(value)) return 'CNPJ inválido.';
      break;
    case 'telefone':
      if (digits.length < 10 || digits.length > 11) return 'Telefone inválido.';
      break;
    case 'cep':
      if (digits.length !== 8) return 'CEP inválido.';
      break;
    case 'url':
      if (!URL_RE.test(value.trim())) return 'URL inválida.';
      break;
  }
  return null;
}

export type AnswerValue = string | string[] | null;

export function validateAnswer(
  question: Question,
  value: AnswerValue,
  fileCount = 0,
): string | null {
  const cfg = question.validation_config || {};
  const empty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  if (question.type === 'upload') {
    const att = cfg.attachments;
    if (question.required && fileCount === 0) return 'Este campo é obrigatório.';
    if (att && att.maxCount && fileCount > att.maxCount)
      return `Máximo de ${att.maxCount} arquivo(s).`;
    return null;
  }

  if (empty) return question.required ? 'Este campo é obrigatório.' : null;

  if (question.type === 'texto' || question.type === 'texto_longo') {
    const raw = String(value);
    const compare = cfg.content && cfg.content !== 'qualquer' && cfg.content !== 'letras' && cfg.content !== 'email' && cfg.content !== 'url'
      ? onlyDigits(raw)
      : raw;
    if (cfg.minLength != null && compare.length < cfg.minLength)
      return `Mínimo de ${cfg.minLength} caracteres.`;
    if (cfg.maxLength != null && compare.length > cfg.maxLength)
      return `Máximo de ${cfg.maxLength} caracteres.`;
    const err = validateContent(cfg, raw);
    if (err) return err;
  }

  if (question.type === 'numero') {
    const n = Number(String(value).replace(',', '.'));
    if (Number.isNaN(n)) return 'Informe um número válido.';
    if (cfg.min != null && n < cfg.min) return `Valor mínimo: ${cfg.min}.`;
    if (cfg.max != null && n > cfg.max) return `Valor máximo: ${cfg.max}.`;
  }

  if (question.type === 'data') {
    const v = String(value);
    if (cfg.minDate && v < cfg.minDate) return `Data mínima: ${cfg.minDate}.`;
    if (cfg.maxDate && v > cfg.maxDate) return `Data máxima: ${cfg.maxDate}.`;
  }

  return null;
}

export function isVisible(question: Question, answers: Record<string, AnswerValue>): boolean {
  if (!question.parent_question_id) return true;
  const parentAnswer = answers[question.parent_question_id];
  return parentAnswer === question.trigger_value;
}
