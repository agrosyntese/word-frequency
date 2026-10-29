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
| Gráfico | Chart.js |
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
│   └── fetch-text.ts       # (Fase 6) função serverless: URL → texto
├── src/
│   ├── main.ts             # inicialização e ligação dos eventos
│   ├── styles.css
│   ├── core/               # lógica pura, sem DOM
│   │   ├── wordFrequency.ts
│   │   ├── wordFrequency.test.ts
│   │   ├── stopwords.ts    # (Fase 5)
│   │   └── types.ts
│   └── ui/                 # tudo que manipula o DOM
│       ├── form.ts         # textarea, contador, validação, erro
│       ├── table.ts        # renderização da tabela
│       └── chart.ts        # (Fase 4) gráfico Chart.js
└── public/                 # assets estáticos
```

## Comandos

```bash
npm install          # instalar dependências
npm run dev          # servidor de desenvolvimento (http://localhost:5173)
npm test             # testes com Vitest em modo watch
npm test -- --run    # testes uma única vez (CI)
npm run typecheck    # tsc --noEmit
npm run build        # build de produção em dist/
npm run preview      # servir o build localmente
npx vercel dev       # (Fase 6) rodar front + função serverless juntos
```

Antes de considerar uma tarefa concluída, rode `npm run typecheck` e `npm test -- --run`.

## Fases de desenvolvimento

- [x] **Fase 0: Setup**: projeto Vite + TS, Vitest, scripts do `package.json`, Git
- [x] **Fase 1: Lógica**: `countWords(text)` pura em `src/core/`, com testes (acentos, pontuação, maiúsculas, vazio, empates)
- [x] **Fase 2: MVP**: textarea com `maxlength=2048`, botão, tabela, erro para texto vazio. *Ao final, todas as user stories estão cumpridas*
- [x] **Fase 3: UX**: contador de caracteres, botão Limpar, totais, layout responsivo, acessibilidade, estado vazio da tabela
- [ ] **Fase 4: Gráfico**: barras com as 15 palavras mais frequentes (Chart.js), atualizado a cada análise
- [ ] **Fase 5: Extras (opcional)**: stopwords PT/EN com opção de ligar e desligar, filtro na tabela, exportar CSV
- [ ] **Fase 6: URL**: `api/fetch-text.ts` busca o HTML, remove `script`/`style`/`nav` e extrai o texto. Alternância Texto/URL no front, com loading e erros
- [ ] **Fase 7: Deploy**: publicar na Vercel, README com capturas de tela

Marque a fase como concluída neste arquivo ao terminá-la.

## Convenções de código

### Geral
- Identificadores, nomes de arquivos e commits em **inglês**; textos exibidos ao usuário em **português**. A exceção é o rótulo do botão, "Translate", mantido como na especificação
- TypeScript `strict`; nada de `any` (use `unknown` e faça o narrowing)
- `camelCase` para variáveis e funções, `PascalCase` para tipos, `UPPER_SNAKE_CASE` para constantes (ex.: `MAX_CHARS = 2048`)
- Exports nomeados; sem `export default`
- Funções pequenas e com um único propósito; prefira `const` e dados imutáveis

### Arquitetura
- `src/core/` é **pura**: sem acesso a DOM, `window` ou rede. Toda regra de contagem fica aqui e tem teste
- `src/ui/` só renderiza e captura eventos, delegando a lógica para `core/`
- Tipo central: `type WordCount = { word: string; count: number }`

### Segurança
- Nunca inserir texto do usuário com `innerHTML`; usar `textContent` ou `createElement`
- Na função de URL (Fase 6): aceitar só `http:`/`https:`, bloquear `localhost` e IPs privados (SSRF), usar timeout de 5 s e limitar o tamanho da resposta

### Testes
- Arquivos de teste ficam ao lado do código: `nome.test.ts`
- Todo bug corrigido em `core/` ganha um teste que o reproduz

### Commits
- Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
