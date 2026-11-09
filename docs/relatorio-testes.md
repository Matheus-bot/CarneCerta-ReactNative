# Relatório de testes do CarneCerta

Data: 06/11/2026. Branch: feature/redesign-escolhas.

Os testes visuais (toque nos botões, avatar, alternância de tema no celular) não fazem parte deste relatório.

| Teste | Resultado | Detalhe |
| --- | --- | --- |
| Checagem de tipos (`npx tsc --noEmit`) | passou | 0 erros. |
| Testes de escolha (`data/testeEscolha.ts`) | passou | 327 casos: 327 passaram, 0 falharam. Rodado como indica o cabeçalho do arquivo. |
| Gramas por pessoa | passou | `gramasPorPessoa`: churrasco 350 g, moída 250 g, bifes, panela, desfiar e fitness 150 g. |
| Arredondamento | passou | Para cima, de 100 em 100 g (`paraCima100`). |
| Faixas de pessoas | passou | 1 a 3, 4 a 6, 7 a 10 e mais de 10 com número digitado. A tela só avança com 11 ou mais. Nas faixas, o cálculo usa o limite de baixo: 1, 4 e 7 pessoas. |
| Total em kg acima de 10 pessoas | passou | Carrinho e linhas da ficha mostram kg só acima de 10 pessoas. O "Total geral" da ficha aparece sempre em kg, mesmo com até 10 pessoas. |
| Caso: 4 pessoas, churrasco, espessura média | passou | Regra: 4 × 350 = 1400 g. Código: 1400 g, sem diferença. O "Total geral" da ficha mostra 1,4 kg. |
| Caso: 12 pessoas, moída | passou | Regra: 12 × 250 = 3000 g = 3,0 kg. Código: 3,0 kg, sem diferença. Vale para moer, hambúrguer e blend. |
| Carrinho salvo no aparelho | passou | Conferido só pela leitura do código, sem teste em aparelho. Chave `carrinho` em `contexto/AppContexto.tsx`. Celular: SQLite, por `expo-sqlite/localStorage/install`. Web: `localStorage` do navegador. Salva a cada mudança. |
| Leitura do carrinho ao abrir o app | passou | Conferido só pela leitura do código. `useState(carregarCarrinho)` lê a chave ao iniciar. Se a leitura falhar, começa vazio. |
| Texto da Picanha em Libras | passou | Sim, igual ao texto pedido (comparação exata, 140 caracteres). `TEXTO_PICANHA` em `screens/TelaLibras.tsx` é passado ao `VLibrasWidget`. |
| Valores do tema escuro | passou | Listados na seção abaixo. |
| Tema claro existe | passou | `temaClaro` em `components/tema.ts`. |
| Botão de alternância na tela inicial | passou | Conferido só pela leitura do código. Está no cabeçalho, em `components/Tela.tsx`, e aparece só na rota `Inicio`. O tema não é salvo: o app sempre abre no escuro. |
| Build web (`npx expo export --platform web`) | passou | Terminou sem erro nem aviso. Rodado com `--output-dir` para uma pasta temporária, para não criar `dist/` no projeto. |

## Testes que falharam

Nenhum.

## Valores do tema escuro

Lidos de `components/tema.ts`.

### Cores

| Nome | Valor |
| --- | --- |
| texto | #f5f5f7 |
| sub | #c9c9d1 |
| vermelho | #ff5a52 |
| vermelhoIcone | #ff7a70 |
| vermelhoEscuro | #e0302e |
| titulo | #f5f5f7 |
| botaoTexto | #fff |
| badgeTexto | #fff |
| fotoTexto | #d6d6de |
| placeholder | rgba(245,245,247,0.5) |
| sombraBotao | 0px 4px 14px rgba(224, 48, 46, 0.35) |
| linha15 | rgba(255,255,255,0.15) |
| linha18 | rgba(255,255,255,0.18) |
| linha20 | rgba(255,255,255,0.2) |
| linha25 | rgba(255,255,255,0.25) |
| campo | rgba(255,255,255,0.08) |
| trilha | rgba(255,255,255,0.1) |
| bordaDestaque | rgba(255,90,82,0.45) |
| chipBorda | rgba(255,255,255,0.25) |
| chipTexto | #f5f5f7 |
| chipTextoAtivo | #f5f5f7 |
| sobreFoto | #f5f5f7 |
| subSobreFoto | #c9c9d1 |
| papel | #fbf4e2 |
| tinta | #2a1f14 |
| tintaLinha | rgba(42,31,20,0.25) |
| camadaBanner | rgba(0,0,0,0.65) |

### Gradientes

| Nome | Cores |
| --- | --- |
| fundo | #4a1e22, #1f1f28 |
| celular | #34343f, #1d1d25 |
| menu | rgba(255,255,255,0.04), rgba(255,255,255,0.02) |
| cartao | rgba(255,255,255,0.12), rgba(255,255,255,0.04) |
| destaque | #7a1f24, #3a2a35, #2a2a36 |
| botao | #ff5a52, #c4201f |
| chipAtivo | #ff5a52, #c4201f |
| botao2 | rgba(255,255,255,0.14), rgba(255,255,255,0.04) |
| foto | #4a4a56, #2a2a33 |
| categoria | #5b2a31, #2d2d38 |
| quadrado | #4a2a30, #25252d |
| opcao | rgba(255,255,255,0.1), rgba(255,255,255,0.03) |
| opcaoAtiva | rgba(255,90,82,0.3), rgba(255,90,82,0.08) |
| libras | #3a3a46, #24242c |
| ficha | #fbf4e2, #eadcbc |
