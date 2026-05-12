# LeadFlow — Mini CRM

Resumo
---
LeadFlow é um mini-CRM focado em produtividade: kanban com drag-and-drop, CRUD de leads, histórico de interações, import/export CSV e busca/filtragem. Construído com Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui (parcial) e Supabase (Auth + DB + RLS). O projeto prioriza UX fluida, sincronização em tempo real e mutações otimistas.

Status
---
- Funcionalidades principais implementadas: autenticação, kanban DnD (dnd-kit), CRUD via modal, import CSV (PapaParse), export CSV, busca/filtro, detalhes do lead e interações, responsividade e realtime (Supabase channels).
- Pontos pendentes: testes automatizados (unit/e2e), polimento de acessibilidade keyboard para DnD, validações avançadas por fluxo de negócios (opcional).

Tech stack
---
- Frontend: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- UI primitives: shadcn/ui (componentes), Sonner para toasts
- DnD: @dnd-kit/core (DragOverlay, sensors, draggable/droppable)
- State/Cache: @tanstack/react-query
- CSV parsing: papaparse
- Backend: Supabase (Auth, Postgres, Realtime, RLS)
- Ferramentas: npm, GitHub (recomendado gh CLI)

Como rodar localmente
---
1. Clone o repositório e entre na pasta:
   ```powershell
   git clone https://github.com/RaFeltrim/leadflow-crm.git
   cd leadflow-crm
   ```

2. Instale dependências:
   ```powershell
   npm install
   npm install @tanstack/react-query papaparse sonner @dnd-kit/core @dnd-kit/sortable @supabase/supabase-js
   ```

3. Crie `.env.local` na raiz com:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua_anon_key>
   # NÃO comite este arquivo
   ```

4. Crie as tabelas e políticas no Supabase (SQL mínimo):
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

   -- habilitar RLS e políticas exemplo (ajuste conforme necessidade):
   alter table public.leads enable row level security;
   create policy "owners can manage leads" on public.leads
     for all using (owner = auth.uid()) with check (owner = auth.uid());
   ```

5. Rodar app:
   ```powershell
   npm run dev
   # abrir http://localhost:3000
   ```

Funcionalidades e fluxo UX
---
- Kanban:
  - Colunas responsivas com min-width para habilitar scroll horizontal em mobile.
  - Drag-and-drop com @dnd-kit (Pointer/Touch/Mouse sensors), DragOverlay para preview.
  - Mutations otimistas via react-query com rollback onError.
  - Realtime: canais Supabase atualizam board em múltiplas janelas.
- CRUD:
  - Modal de criação/edição de lead com validações básicas.
  - Máscara de telefone recomendada (ex: react-input-mask) — verificar se já instalada.
- Import/Export CSV:
  - Import robusto com PapaParse: mapeamento de cabeçalhos (pt/en), validação e preview antes de inserir.
  - Export respeita filtros aplicados na UI e exporta colunas explícitas.
- Busca/Filtro:
  - Campo de busca global no Header ligado ao Kanban (filtra nome/email).
  - Filtro de status disponível.
- Detalhes e Interações:
  - Tela/modal de detalhes com histórico de interações e criação de novas interações (persistência no Supabase).

Arquitetura e decisões importantes
---
- QueryClientProvider movido para layout global (evita múltiplos clients).
- Supabase: autenticação + RLS — garantir que políticas no dashboard estejam ativas.
- Parser CSV: PapaParse (header: true, transformHeader normaliza).
- Export CSV: utilitário central que recebe os leads filtrados (não faz fetch adicional).

Checklist de qualidade
---
- [ ] Validar políticas RLS no Supabase (owner checks).
- [ ] Testes manuais: signup/login, mover card, export com filtro, importar CSV com variações.
- [ ] Confirmar que `.env.local` está no `.gitignore`.
- [ ] Rodar `npm run build` e corrigir warnings/erros.
- [ ] Manter README e `.env.example` atualizados.
- [ ] Adicionar 1-2 testes unitários (parser CSV e export util).

Comandos úteis
---
- Dev: `npm run dev`
- Build: `npm run build`
- Start (produção): `npm start`
- Type check: `npx tsc --noEmit`
- Lint: ESLint (configurar conforme estilo do time)

Problemas conhecidos e recomendações
---
- Keyboard reordering do DnD não implementado — acessibilidade avançada recomendada.
- Reordering intra-coluna (ordem/posição) não persiste atualmente — seria útil armazenar index.
- Verifique se `papaparse`, `@dnd-kit/*`, `@tanstack/react-query` e `sonner` estão no `package.json` antes do build.
- Se ocorrer erro de imports deslocados, garanta que `use client` e imports estejam no topo dos arquivos.

Contribuição
---
- Fork, branch dedicada, PR com descrição curta.
- Convenções: commit conciso, testes mínimos para mudanças significativas.
- Prioridade: correções de UX e regressões de segurança.

Licença
---
MIT.

Próximos passos sugeridos
---
- `.env.example` automático.
- CI básico (GitHub Actions) para build/test.
- Reordering persistente e testes E2E (Cypress / Playwright).
