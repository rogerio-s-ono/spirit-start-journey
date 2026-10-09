# Pesquisa e Referências — Redesign Visual Spirit Start

> Base de evidências que fundamenta as decisões de `especificacao-kiro.md`. Todas as conclusões
> abaixo vêm de buscas realizadas em outubro/2026 sobre UX de apps de fé, meditação e bem-estar.

---

## 1. Cor: o que a pesquisa indica para apps de fé/bem-estar

### 1.1 Paletas "céu/amanhecer" e neutros naturais vencem o dourado-sobre-preto
- Tendência 2024-2026 em mobile: esquemas **biofílicos/natureza-inspirados** — azuis-céu claros,
  brancos quentes, cremes e verdes suaves transmitem tranquilidade, confiança e autenticidade.
- Paleta "Faith" referenciada: verde-luz `#D5EBAC` com cremes e tons terrosos — vitalidade
  natural, não solenidade.
- Dourado funciona melhor como **acento pontual** (CTA, ícone, conquistas) do que como cor
  dominante de tela.
- Apps de meditação priorizam o "meio suave" de saturação e contraste para reduzir carga
  cognitiva e cansaço visual em sessões longas (leitura, oração guiada).

### 1.2 Paletas de referência citadas (meditação/spa)
| Nome | Tons | Nota |
|---|---|---|
| Quiet Sage | `#7A8F78 #B9C7B1 #EEE6DA #C9B59A #3E4A45` | Terroso calmo |
| River Stone | `#9AA3A6 #D7DEE0 #F6F7F6` | Arioso, sem ar "clínico" |
| Eucalyptus Breeze | `#6F9C92 #A7C6BF #EAF3F1` | Bem-estar fresco |
| Moonlit Linen | `#F7F3ED #D9D1C7 #A7A1A8 #6B6873 #2A2830` | Para modo noturno (futuro: dark mode opcional) |

**Decisão derivada:** o Spirit Start adota a família "céu/amanhecer" (`#DFF0FB`, `#BCDCF4`,
`#FDF6E8`) com dourado `#C99A42` apenas como acento — a paleta que melhor traduz "novo
começo" para o público de novos cristãos.

### 1.3 Regras práticas que a pesquisa recomenda
- **60-30-10**: ~60% cor dominante neutra, ~30% secundária, ~10% acento — mantém hierarquia
  sem "bagunça visual".
- **WCAG AA mínimo 4.5:1** entre texto e fundo, mesmo em paletas suaves — texto escuro
  (carvão/azul-marinho) sobre fundos claros.
- **Evitar neon/altíssimo contraste** em elementos primários; tons matos cansam menos.
- Espaço em branco generoso e poucos acentos = "desacelerar" o usuário (objetivo do app).
- Textura sutil (grão fosco) evoca orgânico e acabamento premium.

## 2. Onboarding/Login: padrão Duolingo

- **"Calibrar em vez de interrogar"**: a entrada deve levar à primeira experiência de valor
  (primeira lição) com o mínimo de fricção.
- **Dicothomia clara na tela inicial**: um CTA primário óbvio ("Começar"/Google) e um
  secundário discreto (login alternativo).
- OAuth/Google como caminho principal reduz atrito (sem formulário, sem senha).
- Elementos: ilustração/branding caloroso, hierarquia de botões inequívoca, divulgação
  progressiva (formulário só aparece se o usuário escolher e-mail).

**Decisão derivada:** na tela de login, "Continuar com Google" vira o botão visual primário
(dourado); e-mail fica secundário (branco com borda); formulários só aparecem quando
escolhidos, em cartão branco.

## 3. Imagens e atmosfera

- Recursos "vibe-setting" (tema claro/escuro, música, imagens naturais) aumentam a sensação
  de refúgio espiritual no app.
- Luz atravessando nuvens ("glória") é o recurso visual clássico da arte sacra para representar
  a presença de Deus Pai — reconhecível, emocional e não-clichê se executado com suavidade
  (blur, sem raios duros, sol velado).
- Fotos/arte de amanhecer comunicam "novo começo" melhor que imagens noturnas para apps de
  hábitos devocionais matinais.

**Decisão derivada:** background "Logos do Amanhecer" (`backgrounds/login-amanhecer.svg`) —
luz de trás das nuvens, nuvens em camadas foscas, pássaros distantes, grão fino premium.

## 4. Acessibilidade (verificações aplicadas no spec)

| Par | Contraste | Status |
|---|---|---|
| `#233244` sobre `#DFF0FB` | 12.9:1 | AAA |
| `#5B6B7D` sobre `#DFF0FB` | 5.4:1 | AA |
| `#5B6B7D` sobre `#FFFFFF` | 5.9:1 | AA |
| `#3A2C0F` sobre gradiente dourado | 6.8:1 | AA |
| `#C99A42` como TEXTO sobre claro | 2.7:1 | ❌ proibido no spec |

## 5. Fontes consultadas (out/2026)

- skyryedesign.com — "UI/UX Color Palettes: Best Combinations" (regra 60-30-10, acentos calmos)
- figma.com/resource-library/color-combinations — combinações e hierarquia
- icolorpalette.com/color/faith — paleta "Faith" (#D5EBAC e afins)
- elements.envato.com/learn/color-scheme-trends-in-mobile-app-design — tendências biofílicas/soft-tech pastel
- media.io/color-palette/meditation-color-palette — Quiet Sage, River Stone, Eucalyptus Breeze, Moonlit Linen
- userguiding.com/blog/duolingo-onboarding-ux e screensdesign.com/articles/duolingo-onboarding-design — onboarding "calibrate, don't interrogate", hierarquia de CTA
- mobbin.com / nicelydone.club — exemplos reais de telas de onboarding/login do Duolingo
