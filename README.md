# CRA System

Sistema web interno para gerenciamento de **protocolos de atendimento, retornos e monitoria** — dashboard, Kanban em tempo real, histórico completo, relatórios em PDF/Excel e controle de usuários.

> ⚠️ **Ambiente 100% fictício.** Nenhum nome, empresa, CPF, e-mail ou dado real deve ser inserido neste sistema, em código, seeds, commits ou testes. Todos os usuários e protocolos gerados pelo `seed.ts` são sintéticos.

---

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL (Supabase) · Supabase Realtime · JWT (`jose`) · React Hook Form + Zod · TanStack Query · dnd-kit · Recharts · Framer Motion · Lucide React

---

## 1. Configuração do banco (Supabase)

1. Crie (ou use) um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database**, copie:
   - **Connection string (Transaction pooler, porta 6543)** → `DATABASE_URL`
   - **Connection string (Direct connection, porta 5432)** → `DIRECT_URL`
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca prefixar com `NEXT_PUBLIC_`, nunca expor no cliente)

Preencha essas variáveis em `.env.local` (veja `.env.example`). Gere um `JWT_SECRET` forte, por exemplo:

```bash
openssl rand -base64 32
```

## 2. Rodando localmente

```bash
npm install
npm run db:push      # cria as tabelas no Supabase a partir do schema.prisma
npm run db:seed      # popula o banco com usuários e protocolos fictícios
npm run dev
```

Acesse `http://localhost:3000`.

### Credenciais do ambiente de demonstração

| Perfil | Usuário | Senha |
|---|---|---|
| Administrador | `cramonitoria` | `cramonitoria2026` |
| Colaboradores | padrão `X00XXXX` (gerado no seed, ex.: `X001234`) | `123456` |

A lista completa de usuários gerados fica visível na tela **Usuários** (acesso admin) após rodar o seed.

### Dados já preenchidos ao abrir

O seed gera cerca de **160 protocolos distribuídos nos últimos 5 meses**, com volume crescente mês a mês, histórico completo de andamento (Novo → Em análise → Em atendimento → Concluído), comentários e notificações — então o Dashboard, o Kanban e a aba **Usuários → Desempenho** já abrem preenchidos, sem precisar cadastrar nada manualmente antes de mostrar o sistema.

### Modo apresentação

No topo direito (ícone de "apresentação", ao lado do tema) ou em **Configurações**, existe um toggle de **Modo apresentação**. Ele:
- Esconde as dicas de login/senha padrão e os avisos de "ambiente fictício" na tela de login;
- Congela a atualização automática do Dashboard (evita números mudando na tela durante a fala).

É só visual, salvo no navegador (localStorage) — não altera nada no banco. Ative antes de apresentar e desative depois.

## 3. Deploy no Netlify

Este projeto usa rotas de API, middleware de autenticação e SSR — **não é um site estático**. Isso significa que **arrastar um .zip do código-fonte direto no Netlify não funciona**, pois o drag-and-drop apenas publica arquivos como estão, sem rodar build. Use um dos dois caminhos abaixo:

### Opção A — GitHub (recomendado)
1. Suba este projeto para um repositório no GitHub.
2. No Netlify: **Add new site → Import an existing project → GitHub**, selecione o repositório.
3. O Netlify detecta o `netlify.toml` automaticamente (build command `npm run build`, plugin `@netlify/plugin-nextjs`).
4. Em **Site settings → Environment variables**, adicione todas as variáveis de `.env.example` (com os valores reais do seu Supabase).
5. Dispare o deploy.

### Opção B — Netlify CLI (a partir da pasta local)
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set DATABASE_URL "..."
netlify env:set DIRECT_URL "..."
netlify env:set NEXT_PUBLIC_SUPABASE_URL "..."
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "..."
netlify env:set SUPABASE_SERVICE_ROLE_KEY "..."
netlify env:set JWT_SECRET "..."
netlify deploy --prod
```

### Sobre o build automático de banco

O script `npm run build` (usado pelo Netlify) roda, nesta ordem:
`prisma generate → prisma db push → prisma/seed.ts → next build`

Ou seja, **a cada novo deploy o schema é sincronizado e os dados fictícios são recriados do zero** — conveniente para este ambiente de teste descartável, mas **não recomendado para produção** (apagaria dados reais a cada deploy). Ao migrar para um banco definitivo:

```jsonc
// package.json — troque o script "build" por:
"build": "prisma generate && next build"
```
e rode `prisma migrate deploy` manualmente/via pipeline controlado.

## 4. Estrutura do projeto

```
prisma/
  schema.prisma        # modelos: User, Protocol, HistoryLog, Comment, Attachment, Notification
  seed.ts               # geração de dados 100% fictícios
src/
  app/
    login/               # tela de autenticação
    (app)/                # rotas protegidas (sidebar + topbar)
      dashboard/          # cards + gráficos (Recharts)
      protocols/          # lista, busca, filtros, detalhe, criação
      kanban/              # board com dnd-kit
      users/               # gestão de usuários (admin)
      reports/             # exportação PDF/Excel (admin)
      settings/            # tema e conta
    api/                   # rotas REST (auth, protocols, users, dashboard, reports, notifications)
  components/              # UI, layout, dashboard, kanban, protocols
  lib/                     # prisma client, auth (JWT/bcrypt), fake-data, labels, validators (zod)
  middleware.ts            # proteção de rotas + autorização por papel (admin/colaborador)
```

## 5. Segurança implementada

- Senhas com **bcrypt**; sessão via **JWT** assinado (HS256) em cookie `httpOnly`.
- Validação de entrada com **Zod** em todas as rotas de API.
- Sanitização básica de campos de texto livre (proteção contra XSS refletido).
- `middleware.ts` bloqueia rotas autenticadas e restringe `/users` e `/reports` a administradores.
- Rate limiting simples no login (proteção contra força bruta) — para produção multi-instância, troque por um limitador distribuído (ex.: Upstash Redis).
- Prisma (queries parametrizadas) elimina risco de SQL Injection.
- Cabeçalhos de cookie (`sameSite: lax`, `secure` em produção) mitigam CSRF em conjunto com a arquitetura same-origin do app.

## 6. Realtime (Supabase)

O schema está pronto para Supabase Realtime. Para ativar atualizações ao vivo no Kanban/notificações sem recarregar a página, habilite Realtime nas tabelas `protocols` e `notifications` no painel do Supabase (**Database → Replication**) e assine os canais no client usando `@supabase/supabase-js` com `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. A versão atual já revalida os dados automaticamente via polling do TanStack Query (dashboard a cada 30s); a assinatura Realtime pode substituir esse polling por eventos push.

---

**Todos os dados deste repositório — usuários, protocolos, nomes, números — são fictícios e gerados automaticamente.**
