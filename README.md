# Atlas Eleitoral

Dashboard educacional e interativo sobre as **eleições presidenciais do Brasil de 2026**: fichas dos candidatos com biografia, posições por tema, declarações e controvérsias — **sempre com a fonte original clicável** —, compasso político de 2 eixos, ferramenta de comparação lado a lado e gráficos de intenção de voto.

> Projeto sem filiação partidária. A classificação no compasso é interpretação editorial baseada em evidências citadas (veja [Metodologia](src/data/research/) no site).

## Stack

- **Astro 7** (site estático, ilhas React hidratadas sob demanda)
- **React 19** + **shadcn/ui** (base **Base UI**) + **Tailwind CSS v4**
- **Recharts** (gráficos) via `Chart` do shadcn
- **npm** · sem etapa de build custom além de `astro build`

## Comandos

```bash
npm install        # dependências
npm run dev        # desenvolvimento em http://localhost:4321
npm run build      # build de produção em dist/
npm run preview    # serve o build
npx astro check    # type-check (0 erros)
```

## Design system

### Temas — paleta Catppuccin (4 variantes)

O seletor no topo altera `data-theme` no `<html>` e persiste em `localStorage` (`atlas-flavor`), com script inline anti-flash e respeito a `prefers-color-scheme` na primeira visita.

| Variante | Modo | Papel |
|---|---|---|
| **Latte** | claro | tema padrão em ambientes claros |
| **Frappé** | escuro | médio |
| **Macchiato** | escuro | intenso |
| **Mocha** | escuro | padrão em ambientes escuros |

Mapeamento semântico (idêntico nas 4 variantes, via `var(--ctp-*)` em `src/styles/global.css`):

| Token shadcn | Cor Catppuccin | Uso |
|---|---|---|
| `--background` | `mantle` | página (recessivo) |
| `--card` / `--popover` | `base` | superfícies elevadas |
| `--primary` | `mauve` | ações, marca, títulos de seção |
| `--secondary` / `--muted` | `surface0` | chips, badges, wells |
| `--accent` | `surface1` | hover |
| `--border` / `--input` | `surface0` / `surface1` | divisores / campos |
| `--ring` | `blue` | foco |
| `--chart-1..5` | `blue · mauve · teal · peach · green` | gráficos |
| `--foreground` / `--muted-foreground` | `text` / `subtext0` | texto |

### Tipografia

- **Fraunces** (`font-heading`) — títulos editoriais
- **Geist Variable** (`font-sans`) — corpo e UI
- **JetBrains Mono** (`font-mono`) — números, coordenadas, nº de urna

### Regra de cor dos candidatos

`candidateColor(econ)` em `src/lib/palette.ts` interpola no eixo econômico:
`−10 vermelho → 0 mauve → +10 azul` (`color-mix` sobre `--ctp-*`, portanto acompanha o tema). A cor é usada em cards, bolhas do compasso e gráficos.

### Componentes

- **shadcn/ui**: `button`, `card`, `badge`, `avatar`, `tabs`, `table`, `select`, `input`, `toggle-group`, `tooltip`, `accordion`, `alert`, `separator`, `empty`, `chart`
- **Do projeto** (`src/components/`): `SiteHeader/SiteFooter`, `ThemeSwitcher`, `CandidateCard`, `CandidateExplorer` (busca/filtro/ordenação), `CompassMap` (compasso interativo), `CompassGlyph` (mini-mapa), `CompareTool` (comparação 2–4), `PollsPanel` (abas de pesquisas + barras), `PhotoAvatar`, `SourceChip`, `OrientationBadge`, `LinkButton`, `SectionHeading`, `FeaturedGrid`

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | hero + números da eleição, pesquisas, mapa do compasso, destaques |
| `/candidatos` | busca, filtro por partido, ordenação (urna/nome/eixos) |
| `/candidatos/[slug]` | ficha: perfil, posições (9 temas), declarações, compasso, controvérsias |
| `/compasso` | mapa interativo, quadrantes, tabela de coordenadas |
| `/comparar` | 2–4 candidatos lado a lado com fontes |
| `/pesquisas` | abas por levantamento (1º e 2º turno), leitura da disputa, fontes |
| `/metodologia` | eixos, confiança, cores, controvérsias, limites |

## Dados e fontes

- `src/data/research/<id>.json` — uma ficha por candidato (13 deferidos em 26/09/2026), validada contra o contrato em `src/lib/types.ts`: cada `keyPosition`, `statement`, `scandal` e a `compass` carregam `Source { title, publisher, url, date }`.
- `src/data/polls.json` — 12 pesquisas (Datafolha, RealTime, AtlasIntel, Quaest; 1º e 2º turno) com `asOf`.
- `src/data/election-facts.json` — datas, eleitorado e cronograma oficiais (TSE).
- Todas as URLs de citação são verificadas (168/168 abrem em navegador; bloqueios de bot em TSE/UOL documentados).

Coordenadas do compasso: **X econômico** −10 estatista … +10 livre-mercado; **Y social** −10 conservador/autoritário … +10 progressista/libertário — com raciocínio e evidências na ficha de cada candidato.
