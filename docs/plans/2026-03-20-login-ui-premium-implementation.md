# Login UI Premium Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Melhorar o UI do `Login` com um layout premium full-screen (hero lateral + card) e melhores estados de erro/loading.

**Architecture:** Atualizar apenas a página de login em `src/app/login/page.tsx`, reaproveitando os componentes existentes (`Card`, `Input`, `Button`, `Form`). Criar alert/loader inline com Tailwind (sem depender de um componente `Alert` inexistente). Usar estado local para `showPassword`.

**Tech Stack:** Next.js App Router (React + TypeScript), `react-hook-form`, `zod`, `@supabase/auth-helpers-nextjs`, `lucide-react`, Tailwind/shadcn-like components.

---

### Task 1: Preparar layout full-screen premium

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Definir estrutura do `main`**
1. Trocar o `main` atual por um `main` full-screen (`min-h-svh`) com fundo e uma `grid` responsiva.
2. Desktop: `grid-cols-2` com coluna esquerda (branding) e coluna direita (form).
3. Mobile: empilhar (branding acima do card).

**Step 2: Adicionar fundo/efeitos**
1. Inserir camadas decorativas com `absolute` (gradiente + baixa opacidade + blur).

**Step 3: Integrar hero com SVG**
1. Incluir imagens decorativas usando `public/globe.svg`, `public/window.svg`, `public/file.svg` (qualquer combinação que fique bem no layout).
2. Marcar as imagens como decorativas (sem impacto semântico).

**Step 4: Garantir que o card mantém legibilidade**
1. Ajustar `max-w-sm`/`max-w-md`, `p-*` e espaçamentos dentro do card.

**Step 5: Verificar manualmente**
1. Abrir `http://localhost:3000/login`.
2. Confirmar que o layout aparece corretamente no desktop e mobile (resize).

---

### Task 2: Polir header do card

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Header mais hierárquico**
1. Adicionar ícone/logo pequeno no topo do card (decorativo).
2. Ajustar tamanhos/padding do `CardHeader` e `CardTitle`/`CardDescription`.

**Step 2: Verificar manualmente**
1. Confirmar alinhamento e contraste em `dark`.

---

### Task 3: Melhorar erro de autenticação

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Substituir erro textual solto**
1. Remover o `<p role="alert" ...>` atual.
2. Criar um bloco de alerta dentro do card com:
   - ícone (ex: `AlertTriangle` de `lucide-react`)
   - `role="alert"`
   - classes `text-destructive` / `bg-destructive/10` (ou equivalente)

**Step 2: Verificar manualmente**
1. Tentar login com credenciais inválidas.
2. Confirmar que o erro aparece como alerta com boa legibilidade.

---

### Task 4: Melhorar estado de loading

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Botão com feedback**
1. Manter `disabled={loading}`.
2. Trocar o texto para “Entrando…” e adicionar spinner (ex: `animate-spin`) ao lado do texto.

**Step 2: Verificar manualmente**
1. Ao submeter o form, confirmar que o botão fica desabilitado e o spinner aparece.

---

### Task 5 (Opcional Premium): Toggle show/hide password

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Implementar UX**
1. Adicionar `showPassword` em `useState`.
2. Alterar o `type` do password `password`/`text`.
3. Adicionar botão/ícone (ex: `Eye`/`EyeOff`) no lado direito do input.
4. Garantir acessibilidade (botão com `aria-label`).

**Step 2: Verificar manualmente**
1. Testar mostrar/ocultar sem quebrar a submissão.

---

### Task 6: Teste final e checklist

**Files:**
- Review: `src/app/login/page.tsx`

**Step 1: Teste de regressão**
1. Login válido: confirmar redirect para `/dashboard`.
2. Login inválido: confirmar alerta e mensagens genéricas.
3. Responsividade: confirmar layout no mobile.

