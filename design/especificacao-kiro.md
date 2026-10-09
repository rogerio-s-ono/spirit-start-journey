# Spirit Start — Especificação de Redesign Visual (para o Kiro)

> **Como usar este documento:** entregue-o ao Kiro como contexto principal da tarefa de redesign.
> Ele contém diagnóstico, paleta com tokens prontos, direção de arte do background, mudanças por
> tela, plano de implementação passo a passo e critérios de aceitação.
> Arquivos de apoio (mesma pasta): `mockups.html` (visual de referência),
> `pesquisa-e-referencias.md` (pesquisa que fundamenta as decisões),
> `backgrounds/login-amanhecer.svg` (arte final do background da tela de login).

---

## 1. Objetivo

Substituir o tema atual **escuro com dourado** por um tema claro **"Amanhecer"** — céu claro,
nuvens, luz dourada pontual — que transmita leveza, esperança e acolhimento, coerente com a
proposta do app (jornada de fé para novos cristãos).

**Intenção espiritual do background de login:** retratar a luz de Deus Pai nascendo no amanhecer,
atravessando as nuvens — a "glória" clássica da arte sacra (Barroco/Renascimento), sem clichês
nem exageros. A luz deve parecer vinda de trás das nuvens, não um efeito decorativo.

**Não muda:** estrutura de navegação, componentes funcionais, fluxo de lições/quiz, lógica de
XP/badges/Supabase. Este redesign é 100% de identidade visual (tokens, estilos e arte).

---

## 2. Diagnóstico do estado atual

Arquivo principal da tela de login: `src/pages/Welcome.tsx`

| Problema | Detalhe |
|---|---|
| Fundo quase preto | A imagem `src/assets/heaven-bg.jpg` recebe overlay `bg-gradient-to-b from-background/40 via-background/70 to-background` — o "céu" desaparece sob o gradiente escuro |
| Dourado como cor dominante | Título em `text-gold-gradient`, botão principal `bg-primary` (dourado), brilho `glow-gold` — dourado sobre preto remete a luxo/noturno, não a acolhimento |
| Sem elementos reais de céu | Nenhuma nuvem, luz ou horizonte — só um glow dourado difuso |
| Hierarquia fraca | Botão Google (ghost) e botão de e-mail competem visualmente; nada guia o olho para a ação principal |

O restante das telas (Dashboard, Trilha, Lição, Diário, Perfil) usa o mesmo tema escuro —
a mudança de tokens abaixo aplica-se a todas automaticamente.

---

## 3. Paleta "Amanhecer" (tokens prontos)

Regra **60 / 30 / 10**: ~60% céu/creme (fundos), ~30% branco (cartões/conteúdo), ~10% dourado
(apenas CTAs, ícones de destaque e conquistas). **Nunca** usar dourado como fundo grande.

| Papel | Hex | HSL | Uso |
|---|---|---|---|
| Céu claro | `#DFF0FB` | `hsl(204 78% 93%)` | Fundo base das telas |
| Azul horizonte | `#BCDCF4` | `hsl(206 72% 85%)` | Gradientes de fundo, chips informativos |
| Luz do sol | `#FDF6E8` | `hsl(40 84% 95%)` | Fundo de cartões quentes, versículo destacado |
| Dourado (acento) | `#C99A42` | `hsl(39 56% 52%)` | Botão principal, XP, badges, links ativos |
| Dourado claro | `#E7C783` | `hsl(41 66% 71%)` | Gradiente do botão principal (com o dourado) |
| Tinta (texto) | `#233244` | `hsl(213 32% 20%)` | Texto principal (contraste 12.9:1 sobre #DFF0FB — AAA) |
| Texto suave | `#5B6B7D` | `hsl(212 16% 42%)` | Texto secundário (contraste 5.4:1 sobre #DFF0FB — AA) |
| Cartão | `#FFFFFF` | `hsl(0 0% 100%)` | Cartões, sheet de login |
| Linha/borda | `#E2E8F0` | `hsl(214 32% 91%)` | Bordas de cartões, divisores |

**Contraste verificado (WCAG AA, mínimo 4.5:1):**
- `#233244` sobre `#DFF0FB` → 12.9:1 ✅
- `#5B6B7D` sobre `#DFF0FB` → 5.4:1 ✅
- `#5B6B7D` sobre `#FFFFFF` → 5.9:1 ✅
- Texto do botão dourado: usar `#3A2C0F` sobre gradiente `#E7C783→#C99A42` → 6.8:1 ✅
- **Não** usar `#C99A42` como cor de texto sobre fundos claros (2.7:1 — falha AA).

### 3.1 Mapeamento para `src/index.css` (tokens shadcn/Tailwind atuais)

Substituir os valores HSL das variáveis existentes (mantendo os nomes, para não quebrar as classes):

```css
:root {
  --background: 204 78% 93%;        /* era escura → céu claro */
  --foreground: 213 32% 20%;        /* tinta */
  --card: 0 0% 100%;
  --card-foreground: 213 32% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 213 32% 20%;
  --primary: 39 56% 52%;            /* dourado vira acento */
  --primary-foreground: 40 84% 6%;  /* #3A2C0F */
  --secondary: 206 72% 85%;         /* azul horizonte */
  --secondary-foreground: 213 32% 20%;
  --muted: 206 72% 89%;
  --muted-foreground: 212 16% 42%;
  --accent: 40 84% 95%;             /* luz do sol */
  --accent-foreground: 213 32% 20%;
  --destructive: 0 62% 45%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 39 56% 52%;
  --radius: 1rem;
}
```

Remover/neutralizar utilitários legados do tema escuro: `text-gold-gradient`, `glow-gold`,
`divine-line` (ou redefini-los: gradiente dourado `#E7C783→#C99A42` só em ícones/badges, sem glow).

---

## 4. Background da tela de login — "Logos do Amanhecer"

Arte final pronta: **`design/backgrounds/login-amanhecer.svg`** (1080×1920, `preserveAspectRatio="xMidYMid slice"` — funciona como `background-size: cover` em qualquer proporção).

### 4.1 Descrição da direção de arte
- Céu em gradiente vertical: azul sereno no topo → céu claro → horizonte dourado.
- **Gloria**: resplendor radial dourado centrado levemente abaixo do meio, com 7 raios de luz
  suaves irradiando de trás de um banco de nuvens (referência: luz da glória na pintura sacra
  clássica). A luz **vem de trás das nuvens**, nunca por cima delas.
- Nuvens em 4 camadas de profundidade (altas distantes, medianas, banco central junto ao
  resplendor, baixas douradas no horizonte), todas com blur gaussiano para fosidade.
- Sol velado (nunca um disco nítido) + coluna de luz vertical sutil.
- 3 pássaros distantes em traço fino (escala, vida, liberdade).
- Grão fino (5% de opacidade) para acabamento fosco premium.

### 4.2 Como aplicar
1. Gerar/converter para **WebP** (ex.: 1080×1920, qualidade 80) e salvar em `src/assets/heaven-bg-dawn.webp`. Manter o SVG no repo como fonte da arte.
2. Em `src/pages/Welcome.tsx`, trocar a camada de fundo por:

```tsx
<div className="absolute inset-0">
  <img src={heavenBgDawn} alt="" className="w-full h-full object-cover" />
  {/* vinheta leve só para assentar o cartão — SEM escurecer o céu */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-[hsl(40_84%_95%)]" />
</div>
```

3. O formulário/login deve "pousar" sobre o céu em um **cartão branco arredondado**
   (`bg-white/95 backdrop-blur rounded-3xl shadow-[0_20px_50px_rgba(90,110,140,0.15)]`),
   não flutuar solto sobre o fundo.

### 4.3 Se preferir imagem fotográfica em vez de SVG
Critérios para escolher/gerar a foto: amanhecer real (não pôr do sol intenso), nuvens macias,
luz atravessando por trás delas, horizonte baixo, sem pessoas/edifícios/texto. Mesmo overlay
claro do passo 2. O SVG anexo já define a referência exata de composição e cores.

---

## 5. Tipografia

Mantém a estrutura atual (serifada para display, sans para corpo) — muda apenas o contexto de cor:

| Papel | Fonte | Tamanho | Cor |
|---|---|---|---|
| Display/marca | Serifada (font-display atual) | 32-38px | `#233244` |
| Títulos de seção/lição | Serifada | 20-24px | `#233244` |
| Corpo de lição | Sans | 16-17px, line-height 1.65 | `#3d4a5a` |
| Legenda/metadata | Sans | 12-13px | `#5B6B7D` |
| Versículo em destaque | Serifada itálica, em card `#FDF6E8` | 15-16px | `#6B5420` |

---

## 6. Mudanças por tela

### 6.1 Welcome/Login (`src/pages/Welcome.tsx`) — prioridade 1
- Fundo: SVG/WebP "Logos do Amanhecer" (seção 4) — **sem overlay escuro**.
- Logotipo e título: saem do dourado sobre preto; título em tinta `#233244`, logo mantém dourado.
- Botão principal = **Continuar com Google** (`bg-primary` dourado com gradiente `#E7C783→#C99A42`, sombra suave dourada).
- Login por e-mail = botão secundário branco com borda `#E2E8F0` (pesquisa Duolingo: OAuth em primeiro, e-mail secundário — ver `pesquisa-e-referencias.md`).
- Formulários (login/cadastro) em cartão branco arredondado com backdrop-blur.
- Divisores "ou": linhas finas `#E2E8F0`, texto `#5B6B7D`.

### 6.2 Dashboard (`src/pages/Dashboard.tsx`) — prioridade 2
- Fundo céu claro; cartões brancos flutuando (`shadow-[0_6px_18px_rgba(90,120,150,0.06)]`, borda `#EEF2F6`).
- Anel/barra de progresso do nível em dourado (único foco de cor da tela).
- Saudação ("Bom dia/Boa tarde, {nome}") em serifada; streak/XP com ícone em dourado.
- Card "Versículo do dia" com fundo `#FDF6E8` e borda `#F1DFAB`.

### 6.3 Trilha de aprendizado (`src/pages/LearningPath.tsx`) — prioridade 2
- Trilha vertical sobre o céu; nós concluídos em dourado, atual com anel dourado pulsante leve, futuros em branco com borda.

### 6.4 Lição (`src/pages/LessonPage.tsx`) — prioridade 2
- Corpo de leitura em cartão branco largo; versículo em card `#FDF6E8` com serifada itálica.
- Botão "Concluir · +XP" em dourado gradiente; quiz com opções brancas/seleção dourada.

### 6.5 Diário (`src/pages/Journal.tsx`) e Perfil (`src/pages/Profile.tsx`) — prioridade 3
- Mesmos cartões brancos; entradas do diário em papel `#FBF8F1` com data em `#5B6B7D`.
- Badges/conquistas: ativas em dourado, bloqueadas em cinza `#D9DEE5` — nunca em vermelho.

---

## 7. Plano de implementação (ordem sugerida)

1. **Tokens** — substituir variáveis em `src/index.css` (seção 3.1); remover/neutrar `text-gold-gradient`, `glow-gold`, `divine-line`.
2. **Arte** — converter `design/backgrounds/login-amanhecer.svg` → `src/assets/heaven-bg-dawn.webp`.
3. **Welcome/Login** — aplicar fundo novo, cartão branco, hierarquia de botões (seção 6.1).
4. **Dashboard → Trilha → Lição** — conferir que os cartões/tipos herdaram os tokens bem; ajustar sombras/bordas conforme seções 6.2-6.4.
5. **Diário e Perfil** — ajustes finais (seção 6.5).
6. **Auditoria de contraste** — varrer por restos de `text-foreground/xx` escuro herdade ou fundos dourados grandes.
7. **Build e revisão visual** — `npm run build` + conferência em 390px, 768px e 1440px de largura.

## 8. Critérios de aceitação

- [ ] Nenhuma tela usa fundo escuro/pretão; dourado aparece apenas em CTAs, ícones de destaque, XP/badges (regra 60/30/10).
- [ ] Tela de login exibe o céu do amanhecer com luz vindo de trás das nuvens; formulário em cartão branco legível.
- [ ] "Continuar com Google" é o botão visualmente primário da tela de login.
- [ ] Todos os pares texto/fundo ≥ 4.5:1 (AA); texto dourado sobre claro não existe.
- [ ] `npm run build` passa sem erros; nenhuma tela quebra em mobile (390px) ou desktop (1440px).
- [ ] Nenhuma mudança de lógica: rotas, Supabase, XP/badges e fluxo de lições intactos.

## 9. Arquivos de apoio (esta pasta)

| Arquivo | Conteúdo |
|---|---|
| `mockups.html` | Mockups antes/depois (login), dashboard e lição + paleta visual |
| `pesquisa-e-referencias.md` | Pesquisa completa (paletas de fé/meditação, onboarding Duolingo, acessibilidade) com fontes |
| `backgrounds/login-amanhecer.svg` | Arte final do background de login (fonte vetorial) |
