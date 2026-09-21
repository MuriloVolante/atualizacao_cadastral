# Plataforma de Formulários

Criação, publicação e coleta de respostas de formulários, conforme o escopo v1.0.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js 15 (App Router) |
| Banco | Supabase / PostgreSQL |
| Arquivos | Supabase Storage (bucket `anexos`) |
| Hospedagem | Vercel |
| UI | Tailwind CSS |
| Excel | ExcelJS |
| CSV | Geração direta no servidor |

## Estrutura

```
/
├── login
├── dashboard
│   ├── formularios
│   ├── novo
│   ├── respostas
│   └── configuracoes
├── formulario/[id]
│   ├── editor
│   ├── respostas
│   ├── resposta/[responseId]
│   └── configuracoes
└── f/[slug]            # público, sem conta
```

## Banco

`forms`, `form_questions`, `question_options`, `responses`, `response_answers`, `files`.
A regra condicional vive na própria subpergunta (`parent_question_id` + `trigger_value`), sem tabela de regras.
RLS: anônimo lê formulários ativos/públicos e insere respostas; autenticado administra tudo.

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Desenvolvimento

```bash
npm install
npm run dev
```
