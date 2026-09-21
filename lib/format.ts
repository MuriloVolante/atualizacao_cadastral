import type { MaskType, ValidationConfig, Question } from './types';

export const onlyDigits = (v: string) => (v ?? '').replace(/\D/g, '');

export function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function maskCNPJ(v: string) {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{4})(\d)$/, '$1-$2');
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskCEP(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d.replace(/(\d{5})(\d)/, '$1-$2');
}

export function applyMask(mask: MaskType | undefined, value: string) {
  switch (mask) {
    case 'cpf':
      return maskCPF(value);
    case 'cnpj':
      return maskCNPJ(value);
    case 'telefone':
      return maskPhone(value);
    case 'cep':
      return maskCEP(value);
    default:
      return value;
  }
}

export function maskFor(cfg: ValidationConfig): MaskType {
  if (cfg.mask && cfg.mask !== 'nenhuma') return cfg.mask;
  if (cfg.content === 'cpf') return 'cpf';
  if (cfg.content === 'cnpj') return 'cnpj';
  if (cfg.content === 'telefone') return 'telefone';
  if (cfg.content === 'cep') return 'cep';
  return 'nenhuma';
}

export function storedValue(cfg: ValidationConfig, value: string) {
  const mask = maskFor(cfg);
  return mask === 'nenhuma' ? value : onlyDigits(value);
}

export function displayValue(q: Question, raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '';
  if (Array.isArray(raw)) return raw.join(', ');
  if (q.type === 'sim_nao') return raw === 'sim' ? 'Sim' : 'Não';
  if (q.type === 'data') return formatDateBR(String(raw));
  if (q.type === 'texto') return applyMask(maskFor(q.validation_config || {}), String(raw));
  return String(raw);
}

export function formatDateBR(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDateTimeBR(iso: string | null) {
  if (!iso) return '';
  const dt = new Date(iso);
  return dt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function slugify(text: string) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
