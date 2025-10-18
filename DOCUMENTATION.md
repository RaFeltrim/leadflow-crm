# LeadFlow CRM

Visão geral
---
LeadFlow é um mini-CRM moderno, responsivo e otimizado para produtividade — desenvolvido como teste prático para a Lasy AI. O foco principal foi entregar uma experiência de usuário fluida (UX-first), com desenvolvimento acelerado por IA quando apropriado, mantendo código limpo, seguro e facilmente auditável. O produto inclui um painel Kanban com drag-and-drop, CRUD de leads via modais, importação/exportação de CSV, histórico de interações e sincronização em tempo real com Supabase.

Links importantes
---
- Live Demo: https://<seu-domínio>.vercel.app (placeholder)
- Vídeo de apresentação (Loom): https://www.loom.com/share/<seu-video> (placeholder)
- Repositório: https://github.com/<seu-usuario>/leadflow-crm (placeholder)

Checklist de funcionalidades (status)
---
- [x] Autenticação (signup / login) com Supabase Auth
- [x] Proteção de rota server-side (Server Components + redirect se não autenticado)
- [x] Kanban com drag-and-drop (dnd-kit) e DragOverlay
- [x] CRUD de Leads via formulário/modal (create, read, update, delete)
- [x] Importação de leads via CSV (PapaParse) com preview e validação
- [x] Exportação de leads para CSV (respeita filtros aplicados)
- [x] Busca global (nome / e-mail) e filtro por estágio (status)
- [x] Tela/Modal de detalhes do lead com histórico de interações
- [x] Adição de novas interações (persistência em Supabase)
- [x] Realtime (Supabase realtime channels) para sincronização entre clientes
- [x] Validações básicas em formulários (e-mail válido, nome obrigatório)
- [x] Responsividade total (desktop/tablet/mobile) com scroll horizontal para Kanban em mobile
- [x] Máscara de telefone recomendada (suporte a react-input-mask)
- [x] Mutations otimistas (react-query) com rollback onError
- [x] QueryClient global no layout (evita providers duplicados)
- [x] Toaster (sonner) para feedbacks instantâneos

Tech stack
---
- Frontend
  - Next.js (App Router) — Server + Client Components
  - React (functional components + hooks)
  - TypeScript
  - Tailwind CSS (estilos utilitários)
  - shadcn/ui (componentes primitives)
  - sonner (toasts)
- State / Data fetching / Cache
  - @tanstack/react-query (queries, mutations, cache)
- DnD / UX
  - @dnd-kit/core (DragOverlay, sensors, useDraggable/useDroppable)
- CSV / Import / Export
  - papaparse (parsing de CSV robusto)
- Backend / Infra
  - Supabase (Auth, Postgres, Realtime, RLS)
- Utilidades / UI
  - react-input-mask (máscaras — recomendado)
  - classnames (condicionais de classe)
- Testes (recomendado / futuro)
  - Jest + React Testing Library (sugestão)

Configuração e execução local
---
1. Pré-requisitos
   - Node.js (v18+ recomendado)
   - npm / yarn / pnpm
   - Conta e projeto no Supabase

2. Clonar repositório
   ```bash
   git clone https://github.com/<seu-usuario>/leadflow-crm.git
   cd leadflow-crm
   ```

3. Instalar dependências
   ```bash
   npm install
   # ou
   # yarn
   ```

4. Configurar variáveis de ambiente
   - Crie um arquivo `.env.local` na raiz do projeto com as variáveis do Supabase.
   - Exemplo (commit apenas `.env.local.example`, não comitar `.env.local`):
   ```env
   # filepath: .env.local.example
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...SEU_ANON_KEY...
   ```
   - Observações:
     - Nunca commite chaves secretas (service_role_key não deve estar no cliente).
     - Para testes locais do Supabase, ative as tabelas e policies conforme seção SQL abaixo.

5. Rodar localmente
   ```bash
   npm run dev
   # abrir http://localhost:3000
   ```

6. Build para produção
   ```bash
   npm run build
   npm run start
   ```

Criação de tabelas e políticas (Supabase)
---
Execute no SQL editor do Supabase (ajuste conforme necessidade do seu projeto):

```sql
-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'New',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- interactions
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  author uuid references auth.users,
  type text,
  note text,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.leads enable row level security;
create policy "owners can manage leads" on public.leads
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.interactions enable row level security;
create policy "owners can read interactions for their leads" on public.interactions
  for select using (true); -- ajustar conforme modelo de ownership
```

Decisões de arquitetura (visão sênior)
---
1. Por que Next.js (App Router)?
   - Server Components reduzem bundle no cliente e permitem carregar dados no server para SEO e performance.
   - App Router simplifica roteamento, layouts aninhados e permite isolar providers (QueryClient no layout).
   - A arquitetura do Next permite proteger rotas server-side (createServerComponentClient) mantendo segurança e UX sem round-trips extras.

2. Por que Supabase?
   - Solução all-in-one (Auth + Postgres + Realtime) que acelera implementação do backend.
   - Postgres+RLS oferece controle fino sobre segurança: RLS garante que cada usuário só acesse seus dados se as policies estiverem corretamente definidas.
   - Realtime simplifica sincronização entre clientes sem infra adicional.

3. Por que shadcn/ui + Tailwind?
   - shadcn/ui fornece primitives acessíveis e não opinativas que se integram direto com Tailwind.
   - Mantém consistência visual sem impor um design system complexo — ideal para protótipos rápidos que precisam escalar em UI customizada.

4. Por que @tanstack/react-query?
   - Gerencia cache, refetch e políticas de invalidação de forma previsível.
   - Facilita mutações otimistas — essencial para boa UX no Kanban (atualizações instantâneas com rollback em falhas).

Desafios enfrentados e soluções implementadas
---
Desafio 1 — Limitação da ferramenta de geração de código
- Problema: A ferramenta de IA usada inicialmente gerava componentes React fora do contexto do App Router Next.js, o que quebrou a integração nativa do Next.
- Solução: Adotamos uma estratégia híbrida: usar a IA para acelerar geração de componentes isolados (ui components, modais, cards) e integrar manualmente esses componentes na arquitetura Next.js (Server/Client Components, layout global).
- Por quê importa: demonstra capacidade de adaptação e compreensão da arquitetura Next — priorizamos a segurança e performance do framework em vez de aplicar o output da IA tal qual.

Desafio 2 — Bug na importação de CSV
- Problema: Parser inicial assumia cabeçalhos fixos e ordem, quebrando em arquivos reais com colunas faltantes ou em ordens diferentes.
- Solução:
  - Migração para PapaParse com header:true e transformHeader para normalizar nomes.
  - Implementação de mapeamento heurístico de cabeçalhos (pt/en) para campos esperados (name, email, phone, status).
  - Validação por linha com preview das primeiras N linhas, apresentação de erros por linha e importação em chunks (100 linhas) para evitar timeouts.
  - Garantir owner ao inserir (owner = auth.user.id) para compatibilidade com RLS.
- Por quê importa: aumenta a robustez do produto para uso real e evita surpresas em dados diversos.

Desafio 3 — Responsividade do Kanban
- Problema: Kanban em telas pequenas ficava ilegível ou quebrou layout quando tentamos forçar colunas fixas.
- Solução:
  - Container horizontal scrollable com classes Tailwind (overflow-x-auto, min-w para colunas e w-[80vw] em mobile).
  - Smooth scrolling iOS (-webkit-overflow-scrolling: touch).
  - Inclusão de TouchSensor/MouseSensor/PointerSensor no dnd-kit e DragOverlay para preview visual durante o arraste.
- Por quê importa: Prioriza UX em dispositivos móveis, mantendo usabilidade do Kanban sem sacrificar legibilidade.

Possíveis melhorias futuras (roadmap curto)
---
- Reordering intra-coluna (persistir position/index) para controlar a ordem exata dos cards.
- Filtros avançados: por data de criação, origem, tags, intervalo customizado.
- Paginação / cursor-based loading / infinite scroll para grandes bases de leads.
- Implementar testes: unitários (parser CSV, export util) e e2e (Playwright/Cypress) para validar fluxos críticos (import, DnD, auth).
- Acessibilidade avançada: keyboard reordering do DnD, aria-live para updates em tempo real.
- Melhorias de observabilidade: logs de erro, sentry/monitoramento e métricas de performance.
- Polimento visual: tema escuro, tokens de design e componentes compartilhados mais robustos.

Estrutura do repositório (resumo)
---
- src/
  - app/                       → rotas e layouts Next.js
  - components/                → componentes React (Header, KanbanBoard, LeadCard, modais)
  - lib/                       → wrappers (supabase client, queryClient, utils)
  - styles/ ou globals.css     → estilos globais Tailwind
  - pages/ (caso legacy)       → (não usado com App Router)
- package.json
- README.md / DOCUMENTATION.md
- .env.local.example

Boas práticas e recomendações para contribuidores
---
- Sempre crie uma branch por feature/bugfix: feature/<descrição>
- Teste manualmente fluxos críticos antes de abrir PR (auth, DnD, import/export).
- Evite commitar credenciais (.env.local) — use `.env.local.example`.
- Mantenha o QueryClient único no layout para evitar problemas de cache duplicado.
- Revise e atualize políticas RLS no Supabase ao alterar schema.

Contato / suporte
---
- Autor: Lasy AI — LeadFlow Architect (equipe)
- Para dúvidas técnicas, abrir issue no repositório com título claro e passos para reproduzir.

Licença
---
- MIT (sugestão — ajustar conforme necessidade).

--- 
Fim do documento — este DOCUMENTATION.md foi criado para ser a single source of truth do projeto. Se desejar, gero também:
- `.env.local.example` real no repositório,
- GitHub Actions básico para CI (npm run build + typecheck),
- Exemplo de script SQL para inicializar dados de teste.
```// filepath: c:\Users\Submarino\Desktop\Lasy AI\leadflow-crm\DOCUMENTATION.md
# LeadFlow CRM

Visão geral
---
LeadFlow é um mini-CRM moderno, responsivo e otimizado para produtividade — desenvolvido como teste prático para a Lasy AI. O foco principal foi entregar uma experiência de usuário fluida (UX-first), com desenvolvimento acelerado por IA quando apropriado, mantendo código limpo, seguro e facilmente auditável. O produto inclui um painel Kanban com drag-and-drop, CRUD de leads via modais, importação/exportação de CSV, histórico de interações e sincronização em tempo real com Supabase.

Links importantes
---
- Live Demo: https://<seu-domínio>.vercel.app (placeholder)
- Vídeo de apresentação (Loom): https://www.loom.com/share/<seu-video> (placeholder)
- Repositório: https://github.com/<seu-usuario>/leadflow-crm (placeholder)

Checklist de funcionalidades (status)
---
- [x] Autenticação (signup / login) com Supabase Auth
- [x] Proteção de rota server-side (Server Components + redirect se não autenticado)
- [x] Kanban com drag-and-drop (dnd-kit) e DragOverlay
- [x] CRUD de Leads via formulário/modal (create, read, update, delete)
- [x] Importação de leads via CSV (PapaParse) com preview e validação
- [x] Exportação de leads para CSV (respeita filtros aplicados)
- [x] Busca global (nome / e-mail) e filtro por estágio (status)
- [x] Tela/Modal de detalhes do lead com histórico de interações
- [x] Adição de novas interações (persistência em Supabase)
- [x] Realtime (Supabase realtime channels) para sincronização entre clientes
- [x] Validações básicas em formulários (e-mail válido, nome obrigatório)
- [x] Responsividade total (desktop/tablet/mobile) com scroll horizontal para Kanban em mobile
- [x] Máscara de telefone recomendada (suporte a react-input-mask)
- [x] Mutations otimistas (react-query) com rollback onError
- [x] QueryClient global no layout (evita providers duplicados)
- [x] Toaster (sonner) para feedbacks instantâneos

Tech stack
---
- Frontend
  - Next.js (App Router) — Server + Client Components
  - React (functional components + hooks)
  - TypeScript
  - Tailwind CSS (estilos utilitários)
  - shadcn/ui (componentes primitives)
  - sonner (toasts)
- State / Data fetching / Cache
  - @tanstack/react-query (queries, mutations, cache)
- DnD / UX
  - @dnd-kit/core (DragOverlay, sensors, useDraggable/useDroppable)
- CSV / Import / Export
  - papaparse (parsing de CSV robusto)
- Backend / Infra
  - Supabase (Auth, Postgres, Realtime, RLS)
- Utilidades / UI
  - react-input-mask (máscaras — recomendado)
  - classnames (condicionais de classe)
- Testes (recomendado / futuro)
  - Jest + React Testing Library (sugestão)

Configuração e execução local
---
1. Pré-requisitos
   - Node.js (v18+ recomendado)
   - npm / yarn / pnpm
   - Conta e projeto no Supabase

2. Clonar repositório
   ```bash
   git clone https://github.com/<seu-usuario>/leadflow-crm.git
   cd leadflow-crm
   ```

3. Instalar dependências
   ```bash
   npm install
   # ou
   # yarn
   ```

4. Configurar variáveis de ambiente
   - Crie um arquivo `.env.local` na raiz do projeto com as variáveis do Supabase.
   - Exemplo (commit apenas `.env.local.example`, não comitar `.env.local`):
   ```env
   # filepath: .env.local.example
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...SEU_ANON_KEY...
   ```
   - Observações:
     - Nunca commite chaves secretas (service_role_key não deve estar no cliente).
     - Para testes locais do Supabase, ative as tabelas e policies conforme seção SQL abaixo.

5. Rodar localmente
   ```bash
   npm run dev
   # abrir http://localhost:3000
   ```

6. Build para produção
   ```bash
   npm run build
   npm run start
   ```

Criação de tabelas e políticas (Supabase)
---
Execute no SQL editor do Supabase (ajuste conforme necessidade do seu projeto):

```sql
-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'New',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- interactions
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  author uuid references auth.users,
  type text,
  note text,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.leads enable row level security;
create policy "owners can manage leads" on public.leads
  for all using (owner = auth.uid()) with check (owner = auth.uid());

alter table public.interactions enable row level security;
create policy "owners can read interactions for their leads" on public.interactions
  for select using (true); -- ajustar conforme modelo de ownership
```

Decisões de arquitetura (visão sênior)
---
1. Por que Next.js (App Router)?
   - Server Components reduzem bundle no cliente e permitem carregar dados no server para SEO e performance.
   - App Router simplifica roteamento, layouts aninhados e permite isolar providers (QueryClient no layout).
   - A arquitetura do Next permite proteger rotas server-side (createServerComponentClient) mantendo segurança e UX sem round-trips extras.

2. Por que Supabase?
   - Solução all-in-one (Auth + Postgres + Realtime) que acelera implementação do backend.
   - Postgres+RLS oferece controle fino sobre segurança: RLS garante que cada usuário só acesse seus dados se as policies estiverem corretamente definidas.
   - Realtime simplifica sincronização entre clientes sem infra adicional.

3. Por que shadcn/ui + Tailwind?
   - shadcn/ui fornece primitives acessíveis e não opinativas que se integram direto com Tailwind.
   - Mantém consistência visual sem impor um design system complexo — ideal para protótipos rápidos que precisam escalar em UI customizada.

4. Por que @tanstack/react-query?
   - Gerencia cache, refetch e políticas de invalidação de forma previsível.
   - Facilita mutações otimistas — essencial para boa UX no Kanban (atualizações instantâneas com rollback em falhas).

Desafios enfrentados e soluções implementadas
---
Desafio 1 — Limitação da ferramenta de geração de código
- Problema: A ferramenta de IA usada inicialmente gerava componentes React fora do contexto do App Router Next.js, o que quebrou a integração nativa do Next.
- Solução: Adotamos uma estratégia híbrida: usar a IA para acelerar geração de componentes isolados (ui components, modais, cards) e integrar manualmente esses componentes na arquitetura Next.js (Server/Client Components, layout global).
- Por quê importa: demonstra capacidade de adaptação e compreensão da arquitetura Next — priorizamos a segurança e performance do framework em vez de aplicar o output da IA tal qual.

Desafio 2 — Bug na importação de CSV
- Problema: Parser inicial assumia cabeçalhos fixos e ordem, quebrando em arquivos reais com colunas faltantes ou em ordens diferentes.
- Solução:
  - Migração para PapaParse com header:true e transformHeader para normalizar nomes.
  - Implementação de mapeamento heurístico de cabeçalhos (pt/en) para campos esperados (name, email, phone, status).
  - Validação por linha com preview das primeiras N linhas, apresentação de erros por linha e importação em chunks (100 linhas) para evitar timeouts.
  - Garantir owner ao inserir (owner = auth.user.id) para compatibilidade com RLS.
- Por quê importa: aumenta a robustez do produto para uso real e evita surpresas em dados diversos.

Desafio 3 — Responsividade do Kanban
- Problema: Kanban em telas pequenas ficava ilegível ou quebrou layout quando tentamos forçar colunas fixas.
- Solução:
  - Container horizontal scrollable com classes Tailwind (overflow-x-auto, min-w para colunas e w-[80vw] em mobile).
  - Smooth scrolling iOS (-webkit-overflow-scrolling: touch).
  - Inclusão de TouchSensor/MouseSensor/PointerSensor no dnd-kit e DragOverlay para preview visual durante o arraste.
- Por quê importa: Prioriza UX em dispositivos móveis, mantendo usabilidade do Kanban sem sacrificar legibilidade.

Possíveis melhorias futuras (roadmap curto)
---
- Reordering intra-coluna (persistir position/index) para controlar a ordem exata dos cards.
- Filtros avançados: por data de criação, origem, tags, intervalo customizado.
- Paginação / cursor-based loading / infinite scroll para grandes bases de leads.
- Implementar testes: unitários (parser CSV, export util) e e2e (Playwright/Cypress) para validar fluxos críticos (import, DnD, auth).
- Acessibilidade avançada: keyboard reordering do DnD, aria-live para updates em tempo real.
- Melhorias de observabilidade: logs de erro, sentry/monitoramento e métricas de performance.
- Polimento visual: tema escuro, tokens de design e componentes compartilhados mais robustos.

Estrutura do repositório (resumo)
---
- src/
  - app/                       → rotas e layouts Next.js
  - components/                → componentes React (Header, KanbanBoard, LeadCard, modais)
  - lib/                       → wrappers (supabase client, queryClient, utils)
  - styles/ ou globals.css     → estilos globais Tailwind
  - pages/ (caso legacy)       → (não usado com App Router)
- package.json
- README.md / DOCUMENTATION.md
- .env.local.example

Boas práticas e recomendações para contribuidores
---
- Sempre crie uma branch por feature/bugfix: feature/<descrição>
- Teste manualmente fluxos críticos antes de abrir PR (auth, DnD, import/export).
- Evite commitar credenciais (.env.local) — use `.env.local.example`.
- Mantenha o QueryClient único no layout para evitar problemas de cache duplicado.
- Revise e atualize políticas RLS no Supabase ao alterar schema.

Contato / suporte
---
- Autor: Lasy AI — LeadFlow Architect (equipe)
- Para dúvidas técnicas, abrir issue no repositório com título claro e passos para reproduzir.

Licença
---
- MIT (sugestão — ajustar conforme necessidade).

--- 
Fim do documento — este DOCUMENTATION.md foi criado para ser a single source of truth do projeto. Se desejar, gero também:
- `.env.local.example` real no repositório,
- GitHub Actions básico para CI (npm run build + typecheck),
- Exemplo de script SQL para inicializar dados de teste.