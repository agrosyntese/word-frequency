# CLAUDE.md

Guia para trabalhar neste repositório. A especificação original está em [APP.MD](APP.MD).

## Projeto

**Word Frequency**: app web que recebe um texto (até 2048 caracteres), conta quantas vezes cada palavra aparece e mostra uma tabela com cada palavra única e sua contagem, em ordem decrescente de frequência. Bônus: gráfico das frequências e análise do texto de uma página a partir de uma URL.

### Requisitos obrigatórios (user stories)
1. Tela com caixa de texto, botão "Translate" e tabela de frequência
2. A caixa aceita textos longos e colados, com limite de **2048 caracteres**
3. O botão dispara a análise
4. Mensagem de erro se o texto estiver vazio (ou só tiver espaços)
5. Tabela com uma linha por palavra: palavra e contagem
6. Tabela ordenada por frequência decrescente

### Extras
- Bônus do APP.MD: gráfico de frequência; análise por URL
- Sugeridos: contador de caracteres, stopwords, totais, filtro, exportar CSV, botão Limpar

### Regras de contagem (padrão adotado)
- Sem diferença entre maiúsculas e minúsculas: "Casa" e "casa" são a mesma palavra (normalizar com `toLocaleLowerCase()`)
- Pontuação é descartada
- Acentos, hífens e apóstrofos internos fazem parte da palavra ("não", "guarda-chuva", "don't")
- Regex de extração: `/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu`
- Desempate: em frequências iguais, ordem alfabética (`localeCompare`)

## Stack

| Camada | Ferramenta |
|---|---|
| Build/dev | Vite |
| Linguagem | TypeScript (strict) |
| UI | HTML + CSS + TS puro, sem framework |
| Gráficos | Chart.js + chartjs-chart-wordcloud |
| Testes | Vitest |
| Bônus URL | Função serverless (Vercel) + `cheerio` |
| Deploy | Vercel |

## Estrutura de pastas

```
WORLD_FRE/
├── APP.MD                  # especificação original
├── CLAUDE.md
├── index.html              # ponto de entrada do Vite
├── package.json
├── tsconfig.json
├── vite.config.ts
├── api/
│   └── fetch-text.ts       # função serverless (Vercel): GET /api/fetch-text?url=…
├── server/                 # lógica do servidor, roda em Node (sem DOM)
│   ├── urlPolicy.ts        # validação de URL e bloqueio de IPs internos (SSRF)
│   ├── extractText.ts      # HTML → título + texto visível (cheerio)
│   ├── fetchPage.ts        # busca com redirecionamentos, timeout e limite de tamanho
│   └── *.test.ts
├── src/
│   ├── main.ts             # inicialização e ligação dos eventos
│   ├── styles.css
│   ├── core/               # lógica pura, sem DOM
│   │   ├── wordFrequency.ts
│   │   ├── wordFrequency.test.ts
│   │   ├── wordCloud.ts    # escala frequência → tamanho da fonte
│   │   ├── wordCloud.test.ts
│   │   ├── stopwords.ts    # palavras comuns PT/EN
│   │   ├── filter.ts       # filtro sem acento / maiúscula
│   │   ├── csv.ts          # exportação (separador ; + BOM)
│   │   ├── url.ts          # normaliza a URL digitada (completa https://)
│   │   └── types.ts        # inclui FetchedPage, compartilhado com server/
│   └── ui/                 # tudo que manipula o DOM
│       ├── form.ts         # seletor Texto | URL, contador, validação, erro, loading
│       ├── urlSource.ts    # chama /api/fetch-text e mostra a fonte analisada
│       ├── table.ts        # renderização da tabela
│       ├── summary.ts      # resumo "N palavras · M únicas"
│       ├── toolbar.ts      # status do filtro e download do CSV
│       ├── chartPanel.ts   # painel com seletor Barras | Nuvem
│       ├── chartUtils.ts   # helpers comuns aos gráficos
│       ├── barChart.ts     # gráfico de barras (top 15)
│       └── wordCloud.ts    # nuvem de palavras (top 60)
└── public/                 # assets estáticos
```

## Comandos

```bash
npm install          # instalar dependências
npm run dev          # servidor de desenvolvimento (http://localhost:5173), já com /api/fetch-text
npm test             # testes com Vitest em modo watch
npm test -- --run    # testes uma única vez (CI)
npm run typecheck    # tsc --noEmit
npm run build        # build de produção em dist/
npm run preview      # servir o build localmente, também com /api/fetch-text
```

A API roda localmente por um plugin em `vite.config.ts` que chama o mesmo `api/fetch-text.ts` usado na Vercel. Não é preciso Vercel CLI para desenvolver.

Antes de considerar uma tarefa concluída, rode `npm run typecheck` e `npm test -- --run`.

## Fases de desenvolvimento

- [x] **Fase 0: Setup**: projeto Vite + TS, Vitest, scripts do `package.json`, Git
- [x] **Fase 1: Lógica**: `countWords(text)` pura em `src/core/`, com testes (acentos, pontuação, maiúsculas, vazio, empates)
- [x] **Fase 2: MVP**: textarea com `maxlength=2048`, botão, tabela, erro para texto vazio. *Ao final, todas as user stories estão cumpridas*
- [x] **Fase 3: UX**: contador de caracteres, botão Limpar, totais, layout responsivo, acessibilidade, estado vazio da tabela
- [x] **Fase 4: Gráfico**: barras com as 15 palavras mais frequentes (Chart.js), atualizado a cada análise
- [x] **Fase 4.1: Nuvem de palavras**: seletor Barras | Nuvem, nuvem com as 60 palavras mais frequentes (chartjs-chart-wordcloud)
- [x] **Fase 5: Extras (opcional)**: stopwords PT/EN com opção de ligar e desligar, filtro na tabela, exportar CSV
- [x] **Fase 6: URL**: `api/fetch-text.ts` busca o HTML, remove `script`/`style`/`nav` e extrai o texto. Alternância Texto/URL no front, com loading e erros
- [ ] **Fase 7: Deploy**: publicar na Vercel, README com capturas de tela

Marque a fase como concluída neste arquivo ao terminá-la.

## Convenções de código

### Geral
- Identificadores, nomes de arquivos e commits em **inglês**; textos exibidos ao usuário em **português**. A exceção é o rótulo do botão, "Translate", mantido como na especificação
- TypeScript `strict`; nada de `any` (use `unknown` e faça o narrowing)
- `camelCase` para variáveis e funções, `PascalCase` para tipos, `UPPER_SNAKE_CASE` para constantes (ex.: `MAX_CHARS = 2048`)
- Exports nomeados; sem `export default` (única exceção: `vite.config.ts`, exigido pelo Vite)
- Funções pequenas e com um único propósito; prefira `const` e dados imutáveis

### Arquitetura
- `src/core/` é **pura**: sem acesso a DOM, `window` ou rede. Toda regra de contagem fica aqui e tem teste
- `src/ui/` só renderiza e captura eventos, delegando a lógica para `core/`
- `server/` roda só em Node; `api/` é uma casca fina que chama `server/`. Em `api/` e `server/`, imports relativos usam extensão `.js` (exigência do ESM no runtime da Vercel)
- Tipo central: `type WordCount = { word: string; count: number }`
- A nuvem é criada só na primeira exibição com dados: o plugin quebra se for criado sem palavras ou num canvas escondido. Não usar `fit: true` (corta palavras)

### Segurança
- Nunca inserir texto do usuário com `innerHTML`; usar `textContent` ou `createElement`
- Elementos com `display` definido no CSS dependem da regra global `[hidden] { display: none !important }` para o atributo `hidden` funcionar
- Na função de URL: aceitar só `http:`/`https:` nas portas padrão, bloquear `localhost` e IPs privados (SSRF), usar timeout de 5 s e limitar o tamanho da resposta (2 MB)
- O bloqueio de IP é feito no `lookup` da conexão (`createSafeLookup`), não só na validação da URL: isso cobre DNS rebinding e cada redirecionamento. Não trocar por `fetch` sem manter essa checagem
- Não adicionar a regra `::ffff:0:0/96` ao `BlockList`: o Node a aplica a todo IPv4 e bloquearia todos os sites

### Testes
- Arquivos de teste ficam ao lado do código: `nome.test.ts`
- Todo bug corrigido em `core/` ganha um teste que o reproduz

### Commits
- Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
