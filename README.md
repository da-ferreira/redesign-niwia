# niwiaWeb

Frontend React da NiwIA — começa como protótipo do novo design e vira o app.
O layout é o mesmo do loopieeBuilder (Vue); o que muda é a identidade visual.

```bash
npm install
npm run dev   # http://localhost:5180
```

## Identidade

- **Cor:** cinzas neutros (escuro = preto de verdade) + um azul só, o do "ia" do logo,
  para ação principal, seleção e foco. Tokens em `src/index.css` (`canvas`, `surface`,
  `hairline`, `field`, `ink`, `ink-soft`, `dim`, `faint`, `brand`, `live`, `ok`, `caution`, `danger`).
- **O ponto** (`components/brand/Dot.tsx`): estado é ponto, não fundo colorido.
  Ao vivo pulsa; carregando são três pontos (`Waiting`).
- **Tipografia:** uma família na interface (opção A Geist / B Figtree, troca no menu do usuário)
  e Geist Mono só para dado técnico — IDs, variáveis, modelo, ms.
- **Raio:** 6px em controle, 10px no que flutua. Sombra só no que flutua.
- **Fora:** degradês, brilhos, sparkles, `rounded-2xl`, orb.

## Estrutura

- `components/ui` — shadcn (Base UI), já ligados nos tokens
- `components/brand` — logo, ponto, avatar do agente
- `components/layout` — shell (menu lateral), cabeçalho de página, menu do usuário
- `components/patterns` — busca, aviso, cartão de configuração, campo com variáveis
- `pages` — telas; `mocks` — dados de mentira

Telas redesenhadas: Fundamentos, Agente, Workflow, Conversas. As demais rotas mostram um placeholder.
