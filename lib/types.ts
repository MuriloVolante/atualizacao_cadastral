export type QuestionType =
  | 'texto'
  | 'texto_longo'
  | 'numero'
  | 'multipla_escolha'
  | 'selecao_multipla'
  | 'sim_nao'
  | 'data'
  | 'upload';

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'texto', label: 'Texto' },
  { value: 'texto_longo', label: 'Texto longo' },
  { value: 'numero', label: 'Número' },
  { value: 'multipla_escolha', label: 'Múltipla escolha' },
  { value: 'selecao_multipla', label: 'Seleção múltipla' },
  { value: 'sim_nao', label: 'Sim / Não' },
  { value: 'data', label: 'Data' },
  { value: 'upload', label: 'Upload' },
];

export type ContentRule =
  | 'qualquer'
  | 'numeros'
  | 'letras'
  | 'email'
  | 'cpf'
  | 'cnpj'
  | 'telefone'
  | 'cep'
  | 'url';

export const CONTENT_RULES: { value: ContentRule; label: string }[] = [
  { value: 'qualquer', label: 'Qualquer texto' },
  { value: 'numeros', label: 'Apenas números' },
  { value: 'letras', label: 'Apenas letras' },
  { value: 'email', label: 'E-mail' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'cep', label: 'CEP' },
  { value: 'url', label: 'URL' },
];

export type MaskType = 'nenhuma' | 'cpf' | 'cnpj' | 'telefone' | 'cep';

export type AttachmentConfig = {
  enabled: boolean;
  types: string[];
  maxSizeMb: number;
  maxCount: number;
};

export type ValidationConfig = {
  content?: ContentRule;
  minLength?: number | null;
  maxLength?: number | null;
  mask?: MaskType;
  min?: number | null;
  max?: number | null;
  minDate?: string | null;
  maxDate?: string | null;
  attachments?: AttachmentConfig;
  prefill?: { source?: string; field?: string };
};

export type Question = {
  id: string;
  form_id: string;
  parent_question_id: string | null;
  trigger_value: 'sim' | 'nao' | null;
  field_key: string;
  title: string;
  description: string | null;
  type: QuestionType;
  required: boolean;
  position: number;
  validation_config: ValidationConfig;
  options?: QuestionOption[];
  children?: Question[];
};

export type QuestionOption = {
  id: string;
  question_id: string;
  label: string;
  value: string;
  position: number;
};

export type FormStatus = 'rascunho' | 'ativo' | 'encerrado' | 'arquivado';

export type Form = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: FormStatus;
  access: 'publico' | 'desativado';
  cover_image_url: string | null;
  opens_at: string | null;
  closes_at: string | null;
  closing_title: string | null;
  closing_message: string | null;
  prefill_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  responses_count?: number;
};

export const STATUS_LABEL: Record<FormStatus, string> = {
  rascunho: 'Rascunho',
  ativo: 'Ativo',
  encerrado: 'Encerrado',
  arquivado: 'Arquivado',
};

export const DEFAULT_ATTACHMENTS: AttachmentConfig = {
  enabled: false,
  types: ['PDF', 'JPG', 'PNG'],
  maxSizeMb: 10,
  maxCount: 3,
};

export const MIME_BY_EXT: Record<string, string> = {
  PDF: 'application/pdf',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
};
