# Login UI Premium Design (Estilo 3)

> **Objetivo:** Transformar a página de login num “hero” full-screen com branding premium (lado esquerdo) e um card de autenticação elegante (lado direito), melhorando a hierarquia visual, feedback de erro e estado de loading, mantendo a lógica atual (Supabase Auth + validação Zod + react-hook-form).

## Contexto atual
- A página atual está em `src/app/login/page.tsx`.
- Usa `Card`, `Input`, `Button` e componentes do padrão shadcn-like em `src/components/ui/*`.
- O layout atual é um card simples centralizado com erro exibido como texto.
- O projeto está em `dark` por padrão e usa a cor primária `#1DBF73` em `src/app/globals.css`.

## Layout / Experiência (UX)
### Estrutura geral
- `main` full-screen com `min-h-svh`.
- Fundo com:
  - gradiente sutil (tons escuros)
  - pontos/mesh decorativos com cor primária `#1DBF73` em baixa opacidade
- `grid` responsiva:
  - Desktop: 2 colunas
    - Coluna esquerda (branding):
      - marca/título (“3D Studio”)
      - subtítulo curto (“Operador de Impressão 3D” ou similar)
      - ilustração decorativa usando assets em `public/*.svg`
    - Coluna direita (form):
      - card com glass/blur leve e borda suave
  - Mobile: empilhar (branding acima do card)

### Card do login
- Header do card:
  - ícone/logo pequeno (decorativo)
  - título “Login”
  - descrição curta (“Autentique-se para acessar o dashboard”)
- Conteúdo:
  - grid/spacing consistente entre campos
  - botão de submit full width

### Feedback de estado
- **Loading (submissão):**
  - desabilitar `Button`
  - texto: “Entrando…” (ou equivalente)
  - opcional: spinner pequeno ao lado do texto
- **Erro:**
  - substituir `p` solto por um alerta dentro do card:
    - ícone (ex: `AlertTriangle` de `lucide-react`)
    - borda/área com destaque em vermelho (via classe `text-destructive` / `bg-destructive/10`)
    - manter mensagem genérica (“Credenciais inválidas.”) para segurança, como já existe

## Acessibilidade
- Manter labels via `FormLabel` + `FormControl`.
- Garantir `role="alert"` no alerta de erro.
- `Button` deve ter `disabled={loading}`.
- A ilustração decorativa deve ser `aria-hidden`/sem impacto na semântica.

## Assets / Branding
- Usar SVGs do diretório `public/` como ilustração.
- Sugestão: combinar `globe.svg` ou `window.svg` + um `file.svg` pequeno (conforme o que fica melhor na UI).

## Responsividade
- Garantir que o card fica com largura confortável:
  - `max-w-sm` (ou `max-w-md` no desktop, dependendo do look)
  - padding ajustado para `sm/md`.
- Evitar overflow em telas pequenas.

## Restrições / Requisitos não-funcionais
- Não alterar lógica de auth (Supabase) nem endpoints.
- Não alterar validação Zod.
- Só mudar UI/estrutura visual e componentes necessários (ex: alerta, layout, classes).

## Critérios de sucesso
- Visual premium (hero + card com hierarquia).
- Erro e loading com feedback claramente visível.
- UI consistente com o tema e componentes já usados no projeto.

