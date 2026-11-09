# Diagnóstico do cálculo das gramas

Data: 09/11/2026. Só diagnóstico: nenhum arquivo de código foi alterado.

## 1. Caminho do cálculo

1. **TelaEscolhas** ([screens/TelaEscolhas.tsx:224](../screens/TelaEscolhas.tsx#L224)) e **TelaRecomendacao** ([screens/TelaRecomendacao.tsx:32](../screens/TelaRecomendacao.tsx#L32)) chamam `criarItem` ([data/escolha.ts:186](../data/escolha.ts#L186)).
2. `criarItem` usa `pessoasDaEscolha` (limite de baixo da faixa, ou o número digitado em "mais de 10") e calcula `peso` com `pesoTotal` ou `2 × pesoPorCarneDoBlend`. O `peso` fica gravado no item (carrinho no SQLite).
3. **TelaFicha** ([screens/TelaFicha.tsx:37-39](../screens/TelaFicha.tsx#L37-L39)) **não recalcula**: chama `montarFicha(itens)`, que soma o `peso` gravado, e mostra cada linha com `pesoDaFicha` (linha 88).
4. O **Total geral** (linha 95) é calculado na própria tela: `formatarPeso(Math.ceil(total / 100) * 100, true)`, sempre em kg.
5. O teste usa as mesmas funções (`criarItem`, `montarFicha`, `formatarPeso`), mas **não importa a TelaFicha**. Ele repete a fórmula do total geral à mão ([data/testeEscolha.ts:283-284](../data/testeEscolha.ts#L283-L284)), com o mesmo `true` fixo, e espera "2,8 kg" para um carrinho de até 6 pessoas. Ou seja, o teste valida o erro.

## 2. Testes atuais

`data/testeEscolha.ts`: **327 passaram, 0 falharam (327 casos)**.

| Item | Coberto? |
|---|---|
| Faixas 1–3, 4–6, 7–10 | Sim, mas pelo id da faixa (`ate3`, `ate6`, `ate10`), não por 1, 3, 4, 6, 7, 10 pessoas. O app não converte número em faixa: a pessoa escolhe um botão. |
| 11 pessoas | Sim (11 e 25; exemplo com 13) |
| 12 pessoas | Não especificamente (a regra é a mesma do 11) |
| Espessuras Fino, Médio, Grosso | Sim (laço em `ESPESSURAS`, linha 206) |
| Moída com hambúrguer (blend) | Sim (3 blends, peso por carne) |
| Moída sem hambúrguer | Sim (todas as carnes de moagem, 1x e 2x) |
| Total em kg acima de 10 | Só no item e na linha (`formatarPeso`); o total geral da ficha não é testado assim |

## 3. Casos de conferência

"Código" = `criarItem` + `montarFicha` + `pesoDaFicha` (linha da ficha e carrinho). "Tela" = Total geral da TelaFicha.

| # | Pessoas (usadas) | Carne | Tipo | Esperado | Código (linha) | Tela (total geral) | Status |
|---|---|---|---|---|---|---|---|
| 1 | 2 (1) | Picanha | Churrasco, Médio | 400 g | 400 g | 0,4 kg | erro |
| 2 | 5 (4) | Picanha | Churrasco, Fino | 1400 g | 1400 g | 1,4 kg | erro |
| 3 | 8 (7) | Picanha | Churrasco, Grosso | 2500 g | 2500 g | 2,5 kg | erro |
| 4 | 12 (12) | Picanha | Churrasco, Médio | 4,2 kg | 4,2 kg | 4,2 kg | ok |
| 5 | 4 (4) | Peito + Patinho | Moída, hambúrguer (blend) | 500 g + 500 g = 1000 g | 1000 g (blend); 1000 g em **uma** carne se responder "É blend? Não" | 1,0 kg | erro |
| 6 | 4 (4) | Acém | Moída, sem hambúrguer | 1000 g | 1000 g | 1,0 kg | erro |
| 7 | 6 (4) | Acém | Panela | 600 g | 600 g | 0,6 kg | erro |
| 8 | 9 (7) | Alcatra | Bifes, Bife de chapa | 1100 g | 1100 g | 1,1 kg | erro |
| 9 | 11 (11) | Músculo | Fitness | 1,7 kg | 1,7 kg | 1,7 kg | ok |
| 10 | 15 (15) | Peito + Patinho | Moída, hambúrguer (blend) | 1900 g + 1900 g = 3,8 kg | 3,8 kg | 3,8 kg | ok* |

\* O peso por carne (1900 g) está certo no código, mas a ficha mostra só a soma "3,8 kg" numa linha "Peito bovino + Patinho", sem dizer quanto é de cada carne (vale também para o caso 5).

Conta à mão: 1) 1×350=350→400 · 2) 4×350=1400 · 3) 7×350=2450→2500 · 4) 12×350=4200 · 5) 4×250=1000, ÷2=500 cada · 6) 4×250=1000 · 7) 4×150=600 · 8) 7×150=1050→1100 · 9) 11×150=1650→1700 · 10) 15×250=3750, ÷2=1875→1900 cada.

As gramas em si estão certas em todos os casos. O erro está em como a tela mostra.

## 4. Verificação na tela

- **Soma antes de arredondar?** Não é o problema: cada item já vem arredondado de `criarItem`, `montarFicha` soma valores redondos e `pesoDaFicha` arredonda de novo (sem efeito).
- **Número digitado × limite de baixo:** o cálculo usa o limite de baixo, como manda a regra. Mas o subtítulo da ficha mostra `pessoasDaFicha` (o maior `item.pessoas`). Quem escolheu "1 a 3" vê "· 1 pessoas", e quem escolheu "7 a 10" vê "· 7 pessoas". Pode parecer erro para quem usa o app.
- **Unidade trocada no lugar errado:** sim. O total geral passa `true` fixo para `formatarPeso`, e por isso fica sempre em kg. Além disso, `montarFicha` marca a linha toda em kg quando qualquer item somado tem `emKg` (mistura de faixas na mesma carne/preparo/espessura, por exemplo 1 a 3 + 12 pessoas aparece como "4,6 kg").
- **Faixa convertida para o número certo?** Sim: `FAIXAS` usa 1, 4, 7 e 11, e `pessoasDaEscolha` devolve o número digitado em "mais de 10". A tela não deixa avançar com menos de 11.
- **Itens salvos:** o `peso` fica gravado no carrinho e nas fichas salvas (SQLite, JSON) e a ficha não recalcula. Itens criados antes de uma mudança de regra continuam com o peso antigo. Isto é uma hipótese a conferir no aparelho (sem histórico do git nesta análise).

## 5. Causas encontradas

1. **Total geral sempre em kg.** [screens/TelaFicha.tsx:95](../screens/TelaFicha.tsx#L95): `formatarPeso(..., true)`. Deveria ser kg só acima de 10 pessoas. Afeta os casos 1, 2, 3, 5, 6, 7 e 8.
2. **O teste confirma o erro.** [data/testeEscolha.ts:283-284](../data/testeEscolha.ts#L283-L284) repete o `true` e espera "2,8 kg" para itens de até 6 pessoas. Por isso os testes passam.
3. **Hambúrguer com uma carne só.** [screens/TelaEscolhas.tsx:159-166](../screens/TelaEscolhas.tsx#L159-L166) pergunta "É blend?". Com "Não", vai para o TOP 3 e `criarItem` ([data/escolha.ts:193](../data/escolha.ts#L193)) gera uma carne com o total. A regra diz que hambúrguer são sempre duas carnes. O teste trata esse caminho como válido ([data/testeEscolha.ts:210](../data/testeEscolha.ts#L210)).
4. **Blend sem peso por carne na ficha.** [screens/TelaFicha.tsx:84](../screens/TelaFicha.tsx#L84) e [linha 88](../screens/TelaFicha.tsx#L88) mostram "Carne A + Carne B" com o peso somado. O `pesoPorCarneDoBlend` não é usado na tela.
5. **kg "contamina" a linha somada.** [data/escolha.ts:239](../data/escolha.ts#L239): `linha.emKg = linha.emKg || item.emKg`.
6. **Subtítulo mostra o limite de baixo como número de pessoas.** [data/escolha.ts:249-251](../data/escolha.ts#L249-L251) e [screens/TelaFicha.tsx:71](../screens/TelaFicha.tsx#L71) (também "1 pessoas" no singular).
7. **Peso congelado nos itens salvos** (hipótese). [data/escolha.ts:193](../data/escolha.ts#L193) grava o peso, e [screens/TelaFicha.tsx:34](../screens/TelaFicha.tsx#L34) usa os itens salvos sem recalcular.

## 6. Casos que o teste não cobre

- A TelaFicha em si (o total geral é copiado no teste, não importado).
- O total geral da ficha em **g** quando todos os itens são de até 10 pessoas.
- O total geral com itens de até 10 e acima de 10 misturados (que unidade usar).
- A linha somada com itens de faixas diferentes (`emKg` misturado).
- A regra "hambúrguer = sempre duas carnes" (o teste aceita hambúrguer sem blend).
- O peso de cada carne do blend como aparece na ficha.
- 12 pessoas e 15 pessoas especificamente (a regra é coberta por 11, 13 e 25).
- Os números de pessoas 3, 6 e 10 (o app só tem os botões das faixas, então isso equivale a testar `ate3`, `ate6` e `ate10`).
- "Mais de 10" sem número digitado (cai em 11 por padrão) e o subtítulo de pessoas.
- Itens antigos gravados no carrinho e nas fichas salvas.

## 7. O que corrigir, em ordem (sem aplicar)

1. Total geral da ficha: decidir a unidade pela regra (kg só se algum item for de mais de 10 pessoas, ou pelo `pessoasDaFicha > 10`), de preferência numa função em `data/escolha.ts` em vez de na tela.
2. Corrigir o teste da ficha (linhas 283-284) para usar essa função e esperar "2800 g" no exemplo de até 6 pessoas. Acrescentar um caso acima de 10 pessoas em kg.
3. Moída com hambúrguer: tirar o caminho "É blend? Não" ou definir o que ele deve gerar (a regra pede duas carnes). Ajustar o teste da linha 210.
4. Ficha do blend: mostrar o peso de cada carne (`pesoPorCarneDoBlend`) além da soma.
5. Definir a regra do `emKg` em linhas somadas com faixas diferentes (`montarFicha`, linha 239).
6. Subtítulo de pessoas: mostrar a faixa ("1 a 3 pessoas") em vez do limite de baixo, e acertar o singular.
7. Conferir no aparelho se há itens antigos no carrinho e nas fichas salvas com o peso antigo. Se houver, recalcular ao carregar ou limpar.

## 8. Status após a correção (09/11/2026, branch feature/correcao-gramas)

Teste `data/testeEscolha.ts`: **340 passaram, 0 falharam (340 casos)**. `npx tsc --noEmit` e `npx expo lint` sem erros.

| # | Causa | Status | Como / motivo |
|---|---|---|---|
| 1 | Total geral sempre em kg | corrigido | `fichaParaTela` em `data/escolha.ts` decide a unidade pela ficha inteira (`fichaEmKg`: kg só se alguém tiver mais de 10 pessoas). A TelaFicha usa o `total` e o `texto` de cada linha dessa função. O `true` fixo saiu da TelaFicha, e o `gramas >= 1000` de `TelaFichasSalvas` também. |
| 2 | Teste confirmava o erro | corrigido | O teste chama `fichaParaTela` (a mesma função da tela) e espera "2800 g" para o carrinho de até 6 pessoas. Foram acrescentados os 10 casos deste diagnóstico (seção 5 do teste). |
| 3 | Hambúrguer com uma carne só | corrigido | A pergunta "É blend?" foi removida da TelaEscolhas. Com "É para hambúrguer? Sim", a pessoa escolhe sempre um dos 3 blends (ordenados pela prioridade, como antes) e o item leva as duas carnes. |
| 4 | Blend sem peso por carne | corrigido | `montarFicha` cria uma linha por carne do hambúrguer, com `pesoPorCarneDoBlend`. O carrinho mostra também "(… de cada)". |
| 5 | kg "contaminava" a linha | corrigido | A linha não guarda mais `emKg`. A unidade é uma só para a ficha inteira. |
| 6 | Subtítulo com o limite de baixo | corrigido | O subtítulo mostra a faixa ("1 a 3 pessoas", "4 a 6 pessoas", "7 a 10 pessoas" ou "12 pessoas"), pelo item com mais pessoas. |
| 7 | Peso congelado nos itens salvos | corrigido | O item guarda só as escolhas (faixa, pessoas, carnes, preparo, espessura, tipo, blend, moagem). `data/banco.ts` grava sem peso e, ao ler o carrinho ou uma ficha salva, passa cada item por `normalizarItem`. Um peso antigo gravado é ignorado, a faixa é obtida pelas pessoas e o peso é recalculado. Nada é apagado do banco. |

Limite conhecido: um item **antigo** gravado como hambúrguer com uma carne só (pelo caminho "É blend? Não", que não existe mais) continua com uma carne, recalculado como moída simples, porque não há como saber qual seria a segunda carne. Itens novos sempre têm duas carnes.
