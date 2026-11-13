# CarneCerta: mapeamento do projeto e decisões

Levantamento feito em 10/11/2026, na branch `pre-main` (último commit `f7f51ce`, merge do PR #19). Foi tudo lido direto do código, sem rodar o app, com uma exceção: o teste `data/testeEscolha.ts` foi executado para contar os casos (seção 8).

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Mapa de telas](#2-mapa-de-telas)
3. [Mapa de dados e regras](#3-mapa-de-dados-e-regras)
4. [Armazenamento](#4-armazenamento)
5. [Acessibilidade e Libras](#5-acessibilidade-e-libras)
6. [Animações e interação](#6-animações-e-interação)
7. [Design e tema](#7-design-e-tema)
8. [Testes](#8-testes)
9. [Organização de código](#9-organização-de-código)
10. [Decisões registradas](#10-decisões-registradas)
11. [Conceitos principais](#11-conceitos-principais)
12. [Lacunas e dúvidas](#12-lacunas-e-dúvidas)

---

## 1. Visão geral

Fontes: `README.md`, `package.json`, `app.json`, `AGENTS.md`, `App.tsx`, `index.ts`.

**O que é.** Segundo o `README.md`, o CarneCerta é um app acadêmico que ajuda a escolher o corte de carne pelo método de preparo. A pessoa responde poucas perguntas, recebe um Top 3 de cortes e monta uma ficha de compra para mostrar ao açougueiro. O slogan no README é "Escolha o corte certo e leve a quantidade certa ao açougue."

**Para quem.** Quem vai comprar carne e não sabe qual corte pedir nem quanto levar. O app não tem login nem dados pessoais (`docs/fichas-salvas.md`: "Não há login nem dados pessoais"). O login e o cadastro saíram no commit `361e2a0`.

**Plataformas.** Android, iOS e web, com o mesmo código (`README.md`). Em `app.json`, a orientação é `portrait`.

### Stack (versões de `package.json`)

| Pacote | Versão | Uso no projeto |
| --- | --- | --- |
| `expo` | ^58.0.19 | Base do app (SDK 58) |
| `react` / `react-dom` | 19.3.0 | Interface |
| `react-native` | 0.88.0 | Componentes nativos |
| `react-native-web` | ^0.21.2 | Versão web |
| `typescript` (dev) | ~6.0.3 | Tipagem (`tsconfig.json` com `strict: true`) |
| `@react-navigation/native` | ^7.5.0 | Navegação |
| `@react-navigation/native-stack` | ^7.20.0 | Pilha de telas |
| `expo-sqlite` | ~58.0.14 | Banco local (carrinho e fichas) |
| `react-native-webview` | 14.0.1 | VLibras no celular |
| `expo-linear-gradient` | ~58.0.3 | Gradientes e degradês |
| `react-native-svg` | 15.16.0 | Ícones de desenho das carnes |
| `react-native-svg-transformer` (dev) | ^1.5.3 | Importar `.svg` como componente |
| `@expo-google-fonts/bebas-neue` | ^0.4.1 | Fonte dos títulos |
| `@expo-google-fonts/dm-sans` | ^0.4.2 | Fonte do corpo |
| `@expo/vector-icons` | ^15.0.2 | Ícones (MaterialCommunityIcons) |
| `expo-font`, `expo-asset`, `expo-status-bar`, `@expo/metro-runtime` | ~58.0.x | Infraestrutura do Expo |
| `react-native-safe-area-context` | ~5.10.1 | Margens seguras (entalhe, barra) |
| `react-native-screens` | ~4.30.0 | Telas nativas |
| `eslint` / `eslint-config-expo` (dev) | ^9.0.0 / ~58.0.4 | Lint |

Plugins em `app.json`: `expo-sqlite` e `expo-status-bar`.

### Como rodar

Do `README.md`, seção "Instalação e execução":

```bash
npm install
npx expo start -c
```

Depois, tecle `w` no terminal para abrir no navegador, ou leia o QR code com o Expo Go no celular.

Scripts de `package.json`: `npm start`, `npm run android`, `npm run ios`, `npm run web` e `npm run lint`. O `AGENTS.md` pede ainda `npx tsc --noEmit` (checagem de tipos) e `npx expo lint` antes de dar uma tarefa por concluída.

### Estrutura de entrada

- `index.ts` registra o componente `App`.
- `App.tsx` carrega as fontes (Bebas Neue e DM Sans) e chama `carregarVLibrasWeb`. Depois monta `SafeAreaProvider`, `AppProvider` (o contexto), dois `Gradiente` (fundo e "celular") e o `NavigationContainer`, com uma pilha de 11 rotas que começa em `Splash`. A troca de tela não tem animação (`animation: 'none'`).

---

## 2. Mapa de telas

Rotas declaradas em `screens/rotas.ts` (`RootStackParamList`) e registradas em `App.tsx`. São 11 rotas e 10 arquivos de tela: `Ficha` e `FichaSalva` usam o mesmo `TelaFicha`.

Todas as telas, menos a Splash, usam o invólucro `components/Tela.tsx` (cabeçalho, área com rolagem, rodapé opcional e barra inferior). A `Tela` tem dois visuais:

- **Estilo novo, só na rota `Inicio`:** cabeçalho de 56 px com o logo "CarneCerta" em Bebas Neue e três pílulas (Fichas salvas, Claro/Escuro e Carrinho), mais uma barra inferior de 64 px.
- **Estilo antigo, nas outras telas:** logo com ✓, só o botão do carrinho com o número de itens, e menu inferior em gradiente.

A barra inferior sempre leva a Início, Catálogo e Libras.

### 2.1 Splash

- **Arquivo:** `screens/TelaSplash.tsx`
- **Função principal:** `TelaSplash`
- **O que o usuário vê:** fundo escuro. O ✓ e as letras de "Carne" (claras) e "Certa" (laranja) entram uma a uma. Uma linha laranja corta a palavra na diagonal, as duas metades se afastam e somem, e a tela escurece antes de ir para a Início. Dura 4 s.
- **Dados:** só `cores` de `components/tema.ts` (sempre o tema escuro).
- **Decisões de interface:**
  - Um único relógio `Animated.Value` de 0 a 4000; cada parte da animação é um trecho dele (`trecho(inicio, fim, de, para)`).
  - Ao terminar, usa `navigation.reset`. Motivo no código: "reset: a splash sai da pilha e o 'voltar' não retorna para ela".
  - `useNativeDriver` só fora da web. Motivo no código: "O driver nativo não existe na web".
  - Usa as cores do escuro direto. Motivo em `tema.ts`: "a splash usa direto (o app sempre abre no escuro)".

### 2.2 Início

- **Arquivo:** `screens/TelaInicial.tsx`
- **Função principal:** `TelaInicial` (com `Orbita` e `FaixaCarnes`)
- **O que o usuário vê:**
  - **Banner:** foto `assets/banner.png` com gradiente por cima, o texto "Responda algumas perguntas e descubra o corte ideal para o seu preparo.", o título "Qual carne você vai levar hoje?" e o botão "Escolher carne para o meu preparo".
  - **"Categorias":** um anel 3D com as 6 categorias girando devagar.
  - **Embaixo, no celular:** "Amostra do catálogo", uma grade 2 × 2 com Picanha, Alcatra, Contra filé e Patinho (ids `[1, 2, 4, 10]`), cada uma com ícone de desenho.
  - **Embaixo, na web:** "Catálogo de carnes", uma faixa com 16 carnes deslizando em loop, mais o link "Ver todos".
- **Dados:** `useApp()` (carnes, `carneById`, tema), `categorias`, `imagensCategorias`, `estilosInicio[tema]` e os 16 SVGs de `assets/icones/carnes/`.
- **Decisões de interface:**
  - **Web a partir de 900 px:** duas colunas na proporção 5 : 7 (banner à esquerda, anel à direita) e altura calculada pela janela. A altura da linha é a janela menos cabeçalho (56), barra (64), paddings (24 + 18), título da faixa (46) e faixa (108), com mínimo de 320 px.
  - **Abaixo de 900 px, e no celular:** um bloco embaixo do outro.
  - **Tocar numa categoria** abre Escolhas com o preparo já definido (`popTo('Escolhas', { cat })`).
  - **O botão do banner** abre Escolhas sem preparo.
  - **Na faixa,** Maminha, Costela e Carne moída aparecem mas não abrem nada. Motivo no código: "Carnes sem cadastro em data/carnes.ts (sem id) aparecem, mas não abrem tela".
  - **Referência visual:** comentário "Estilo de docs/referencia/tela-inicial.html (medidas para 390 px de largura)".

### 2.3 Catálogo

- **Arquivo:** `screens/TelaCatalogo.tsx`
- **Função principal:** `TelaCatalogo`
- **O que o usuário vê:**
  - O título "Catálogo" e um campo "Buscar corte...".
  - Chips de filtro: Todos e as 6 categorias.
  - Uma grade de cartões com foto, nome, categorias e, só na web, a descrição.
  - Sem resultado, aparece "Nenhuma carne encontrada.".
- **Dados:** `disponiveis()` (carnes ativas), `categorias`, `nomeCategoria` e `fotoDaCarne`.
- **Decisões de interface:**
  - A busca ignora maiúsculas e acentos (`semAcento`: "Acém" → "acem").
  - Busca e categoria filtram juntas (commit `1b2726a`).
  - Na web, os chips quebram linha; no celular, viram uma faixa com rolagem horizontal.
  - Colunas na web: `floor(largura disponível / 200)`, no mínimo 2. No celular, sempre 2.
  - Tocar num cartão abre o Detalhe com `origem: 'catalogo'`.

### 2.4 Detalhe

- **Arquivo:** `screens/TelaDetalhe.tsx`
- **Função principal:** `TelaDetalhe`
- **O que o usuário vê:**
  - Foto de 120 px, nome, categorias e descrição.
  - O cartão "Economia: x/3 · Maciez: x/3 · Sabor: x/3".
  - O botão "Voltar".
- **Dados:** parâmetros `id` e `origem`, `carneById` e `fotoDaCarne`.
- **Decisões de interface:**
  - Com `origem === 'libras'`, em vez da descrição aparece a área de vídeo ("Vídeo em Libras ainda não cadastrado.") e o botão "Ver ficha para o açougueiro". **Porém nenhuma tela abre o Detalhe com origem `'libras'` hoje** (seção 12).
  - "Voltar" vai para Libras ou Catálogo, conforme a origem.
  - A nota "magra" (Leve) não aparece no cartão de notas. Motivo não encontrado.

### 2.5 Escolhas

- **Arquivo:** `screens/TelaEscolhas.tsx`
- **Função principal:** `TelaEscolhas`
- **O que o usuário vê:**
  - Uma pergunta por tela, com opções em grade de 2 colunas.
  - "Voltar" no topo, barra de progresso com porcentagem e o rodapé fixo "Continuar".
  - Sem opção escolhida, aparece "Escolha uma opção para continuar.".
- **Ordem das perguntas:**
  1. Quantas pessoas? (1 a 3, 4 a 6, 7 a 10, Mais de 10). Em "Mais de 10", um campo numérico exige 11 ou mais.
  2. Qual o preparo? Só aparece quando a pessoa não veio de um cartão de categoria.
  3. O que é mais importante? (Economia, Derrete na boca, Explosão de sabor, Leve)
  4. Detalhe do preparo:
     - Churrasco: espessura.
     - Bifes: tipo de bife.
     - Moída: "É para hambúrguer?". Com Sim, "Qual blend?", com os 3 blends ordenados pela prioridade. Com Não, "Qual carne moer?" e "Moer 1 ou 2 vezes?".
- **Dados:** `FAIXAS`, `categorias`, `PRIORIDADES`, `ESPESSURAS`, `TIPOS_BIFE`, `ordenarBlends`, `carnesParaMoer`, `criarItem` e `adicionarItem`.
- **Decisões de interface:**
  - Moída vai direto para o Carrinho, sem Top 3. Motivo no código: "Moída já define a carne (hambúrguer: as duas do blend; sem hambúrguer: a carne para moer): vai direto para o carrinho, sem TOP 3".
  - Não existe a pergunta "Quer economizar?". Motivo no código: "a economia vem só da prioridade Economia".
  - Toda entrada no fluxo começa do zero (`useFocusEffect`).
  - Trocar o preparo limpa os detalhes do preparo anterior.
  - Na web, o título usa `text-wrap: balance`; no Android, `textBreakStrategy`.
  - O conteúdo fica estreito na web (`estreita`, no máximo 560 px).
  - A pergunta "É blend?" foi removida. Motivo em `docs/diagnostico-gramas.md` (causa 3): "A regra diz que hambúrguer são sempre duas carnes".

### 2.6 Resultado (Recomendação / Top 3)

- **Arquivo:** `screens/TelaRecomendacao.tsx`
- **Função principal:** `TelaRecomendacao`
- **O que o usuário vê:**
  - "Seu TOP 3" num pódio, da esquerda para a direita #2, #1 e #3.
  - Fotos redondas: 116 px no #1, com borda na cor de destaque, e 92 px no #2 e no #3.
  - Embaixo de cada foto, o número, o nome e o botão "Escolher esta carne", que vira "Adicionado ✓" por 2 s.
  - O rodapé tem "Ver ficha de compra" e "Nova escolha".
- **Dados:** parâmetro `escolha`, `top3(carnes, escolha)`, `criarItem`, `adicionarItem` e `fotoDaCarne`.
- **Decisões de interface:**
  - As larguras somam 320 px. Motivo no código: "o que cabe num celular de 360 com 18 de margem de cada lado".
  - A pessoa pode escolher mais de uma carne e continua no pódio.
  - Um toque repetido no mesmo corte durante os 2 s é ignorado. Motivo no código: "para a foto e o botão não adicionarem duas vezes".
  - O botão é irmão da foto, não fica dentro dela. Motivo no código: "cada toque dispara uma só adição".
  - Os preços não aparecem (commit `3c48212`: "sem exibição de preços"; `data/carnes.ts`: "Não exibir até a integração com os açougues").
  - Referência visual: `docs/referencia/clara.html`.

### 2.7 Carrinho

- **Arquivo:** `screens/TelaCarrinho.tsx`
- **Função principal:** `TelaCarrinho`
- **O que o usuário vê:**
  - Um cartão por item, com preparo, carne (ou "Peito bovino + Patinho") e peso.
  - No blend, o peso de cada carne: "(500 g de cada)".
  - O detalhe do item e o botão "Remover".
  - Embaixo, "Finalizar" (vai para a Ficha) e "Nova escolha".
  - Vazio, aparece "Nenhuma escolha no carrinho ainda.".
- **Dados:** `salvos` (contexto), `carneById`, `pesoDoItem`, `pesoPorCarneDoBlend`, `fichaEmKg`, `formatarPeso` e `detalheDoItem`.
- **Decisões de interface:** o peso é recalculado ao mostrar, e a unidade (g ou kg) vale para o carrinho inteiro. Motivo no código: "unidade decidida pelo carrinho inteiro, como na ficha".

### 2.8 Ficha

- **Arquivo:** `screens/TelaFicha.tsx` (rotas `Ficha` e `FichaSalva`)
- **Função principal:** `TelaFicha`
- **O que o usuário vê:**
  - Um "papel" com o título "Ficha para o açougueiro" e a data com a faixa de pessoas (ex.: "10/11/2026 · 4 a 6 pessoas").
  - Uma tabela Corte | Preparo | Espessura ou tipo | Peso, e "Total geral".
  - O rodapé tem "Salvar ficha", que passa por "Salvando...", "Ficha salva" ou "Não foi possível salvar", e "Voltar ao carrinho".
  - Aberta como ficha salva, mostra a data dela e o botão "Voltar às fichas salvas".
- **Dados:** `salvos` ou `ficha.itens`, `fichaParaTela`, `dataDeHoje`, `salvarFicha` e `nomeCategoria`.
- **Decisões de interface:**
  - "Papel claro nos dois temas" (comentário). No escuro, o papel é fixo em `#f6efe3`; no claro, usa a cor do cartão.
  - Toda a formatação vem de `fichaParaTela`. Motivo em `data/escolha.ts`: "A tela da ficha, a lista de fichas salvas e o teste usam esta mesma função".

### 2.9 Fichas salvas

- **Arquivo:** `screens/TelaFichasSalvas.tsx`
- **Função principal:** `TelaFichasSalvas`
- **O que o usuário vê:**
  - Cartões com a data e o resumo ("2 carnes · 1400 g").
  - Tocar abre a ficha. "Excluir" pede confirmação ("Confirmar exclusão" ou "Cancelar").
  - Vazia, aparece "Você ainda não salvou nenhuma ficha." com o botão "Voltar ao início".
- **Dados:** `listarFichas`, `excluirFicha` e `fichaParaTela`.
- **Decisões de interface:**
  - A lista é relida cada vez que a tela ganha foco.
  - A exclusão é em duas etapas. Motivo não encontrado no código, mas o `docs/fichas-salvas.md` descreve o teste dessa sequência.
  - O acesso é só pela pílula "Fichas salvas" do cabeçalho da Início.

### 2.10 Libras

- **Arquivos:** `screens/TelaLibras.tsx` e `components/VLibrasWidget.tsx`
- **Função principal:** `TelaLibras`
- **O que o usuário vê:**
  - O título "Libras" e a instrução "Toque no ícone do VLibras e depois em Picanha para ouvir a tradução em Libras.".
  - Quatro cartões (Picanha, Acém, Paleta e Fraldinha) em duas linhas de dois, com foto e nome.
  - O intérprete VLibras sempre aberto: na web larga, à direita; no celular e na web estreita, embaixo.
- **Dados:** os textos fixos `TEXTO_PICANHA`, `TEXTO_ACEM`, `TEXTO_PALETA` e `TEXTO_FRALDINHA`, e fotos de `assets/imagens/imagenscarnes/`.
- **Decisões de interface:** ver a seção 5. Os textos de Paleta e Fraldinha são "nome + descrição do catálogo (data/carnes.ts)" (comentário).

---

## 3. Mapa de dados e regras

Fontes: `data/escolha.ts`, `data/carnes.ts`, `data/categorias.ts` e `data/imagensCategorias.ts`. O cabeçalho de `data/escolha.ts` diz: "Lógica da escolha de carne: funções puras, sem interface, para testar separadamente".

### 3.1 Tabela de carnes (`data/carnes.ts`)

São 13 carnes, todas com `ativo: true`. As notas vão de 1 a 3 (3 é o melhor). `moagem` indica que a carne serve para moer e a qual prioridade ela corresponde.

| id | Carne | Categorias | Economia | Maciez | Sabor | Magra | Moagem |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Picanha | churrasco | 1 | 3 | 3 | 2 | |
| 2 | Alcatra | churrasco, bifes | 2 | 2 | 3 | 3 | |
| 4 | Contra filé | churrasco, bifes | 2 | 2 | 3 | 2 | |
| 14 | Fraldinha | churrasco, desfiar | 2 | 2 | 3 | 2 | |
| 6 | Filé mignon | bifes | 1 | 3 | 2 | 3 | |
| 12 | Coxão mole | bifes, moida | 2 | 2 | 2 | 2 | |
| 7 | Acém | panela, desfiar | 3 | 2 | 2 | 2 | economia |
| 9 | Paleta | panela, desfiar | 3 | 2 | 2 | 2 | economia |
| 8 | Músculo | panela, fitness | 3 | 1 | 3 | 3 | magra |
| 18 | Peito bovino | panela | 2 | 1 | 3 | 1 | sabor |
| 10 | Patinho | moida, fitness | 2 | 1 | 1 | 3 | magra |
| 17 | Coxão duro | panela, desfiar | 3 | 1 | 1 | 3 | sabor |
| 16 | Lagarto | fitness | 2 | 1 | 1 | 2 | |

Outros campos de cada carne: `desc`, `valor` (preço de referência, "Não exibir até a integração com os açougues"), `foto` (nome usado só como rótulo quando falta a imagem) e `libras` (link do vídeo, hoje `''` em todas).

O tipo da carne, literal:

```ts
export type Moagem = 'economia' | 'magra' | 'sabor';

export type Carne = {
  id: number;
  nome: string;
  cat: string[]; // ids das categorias (data/categorias.ts)
  economia: number; // 1 a 3 (3 é o melhor)
  maciez: number; // 1 a 3
  sabor: number; // 1 a 3
  magra: number; // 1 a 3
  moagem?: Moagem; // carne de moagem e a prioridade a que ela corresponde
  desc: string;
  // Preço de referência. Não exibir até a integração com os açougues.
  valor: string;
  foto: string;
  libras: string; // link do vídeo em Libras ('' = não cadastrado)
  ativo: boolean; // disponível para os usuários
};
```

**Categorias** (`data/categorias.ts`): churrasco, bifes, panela, moida, desfiar e fitness. Cada uma tem um ícone MaterialCommunityIcons, "equivalente ao ícone Tabler do protótipo". Funções:

- `nomeCategoria(id)`: devolve o nome, ou `''`. Exemplo: `nomeCategoria('moida')` → `'Moída'`.
- `iconeCategoria(id)`: devolve o ícone, ou `'food-steak'`. Não é usada em nenhuma tela.

**Fotos** (`data/imagensCategorias.ts`):

- `imagensCategorias`: uma foto por categoria.
- `fotosDasCarnes`: "a peça inteira crua, para o catálogo ficar padronizado".
- `fotoDaCarne(c)`: devolve a foto da carne ou, sem ela, a foto da primeira categoria. Exemplo: Picanha (id 1) → `picanha/picanhainteiracrua.jpeg`.
- Observação no código: o Coxão duro usa uma foto da pasta do patinho ("sem pasta própria").

### 3.2 Constantes de regra (`data/escolha.ts`)

| Constante | Valor |
| --- | --- |
| `FAIXAS` | 1 a 3 → 1 pessoa · 4 a 6 → 4 · 7 a 10 → 7 · Mais de 10 → número digitado (mínimo `MINIMO_MAIS10 = 11`) |
| `ESPESSURAS` | Fino, Médio, Grosso |
| `TIPOS_BIFE` | Bife de chapa, Bife fino, Bife à milanesa |
| `BLENDS` | Saborosa + magra = Peito bovino + Patinho (18, 10) · Duas saborosas = Peito bovino + Músculo (18, 8) · Duas magras = Patinho + Coxão duro (10, 17) |
| `PRIORIDADES` | economia "Economia" · maciez "Derrete na boca" · sabor "Explosão de sabor" · magra "Leve" |

Resumo das regras:

| Regra | Valor |
| --- | --- |
| Gramas por pessoa | Churrasco 350 g · Moída 250 g · Bifes, Panela, Desfiar e Fitness 150 g |
| Pessoas usadas no cálculo | O limite de baixo da faixa (1, 4, 7) ou o número digitado (11 ou mais) |
| Arredondamento | Sempre para cima, em múltiplos de 100 g |
| Unidade | g até 10 pessoas; kg (uma casa decimal, vírgula) acima de 10. Vale para a ficha inteira |
| Pontuação | Nota da prioridade × 2, mais a nota de economia se a prioridade for Economia, mais 1 se a carne é do preparo |
| Desempate | Maior nota de sabor |
| Blend | Cada carne recebe metade de (pessoas × 250), arredondada para cima de 100 g |
| Ficha | Soma os itens com mesmo corte, preparo e detalhe; hambúrguer gera uma linha por carne |

### 3.3 Funções exportadas

Os exemplos numéricos foram calculados com os dados reais de `data/carnes.ts`. Os que estão marcados "(teste)" aparecem em `data/testeEscolha.ts`.

#### `gramasPorPessoa(preparo)`

Devolve as gramas por pessoa do preparo. Exemplo: `gramasPorPessoa('churrasco')` → 350; `gramasPorPessoa('fitness')` → 150.

```ts
export function gramasPorPessoa(preparo: string) {
  if (preparo === 'churrasco') return 350;
  if (preparo === 'moida') return 250;
  return 150;
}
```

#### `pessoasDaEscolha(escolha)`

Devolve as pessoas usadas no cálculo. Exemplo: `{ faixa: 'ate6' }` → 4; `{ faixa: 'mais10', pessoas: 15 }` → 15.

```ts
export function pessoasDaEscolha(escolha: Pick<Escolha, 'faixa' | 'pessoas'>) {
  if (escolha.faixa === 'mais10') return escolha.pessoas ?? MINIMO_MAIS10;
  return FAIXAS.find((f) => f.id === escolha.faixa)?.pessoas ?? 0;
}
```

#### `pesoTotal(preparo, pessoas)`

Pessoas × gramas, arredondado para cima de 100 g. Exemplo: churrasco, 7 pessoas → 7 × 350 = 2450 → **2500 g**.

```ts
const paraCima100 = (gramas: number) => Math.ceil(gramas / 100) * 100;

// Total = pessoas × gramas, arredondado para cima em múltiplos de 100 g
export function pesoTotal(preparo: string, pessoas: number) {
  return paraCima100(pessoas * gramasPorPessoa(preparo));
}
```

#### `pesoPorCarneDoBlend(pessoas)`

Metade de (pessoas × 250), arredondada para cima de 100 g. Exemplos: 1 pessoa → 125 → 200 g (teste); 3 → 375 → 400 g (teste); 15 → 1875 → **1900 g** cada.

```ts
export function pesoPorCarneDoBlend(pessoas: number) {
  return paraCima100((pessoas * gramasPorPessoa('moida')) / 2);
}
```

#### `formatarPeso(gramas, emKg)`

Formata o peso em g ou kg. Exemplo: `formatarPeso(4200, true)` → `"4,2 kg"`; `formatarPeso(400, false)` → `"400 g"`.

```ts
export function formatarPeso(gramas: number, emKg: boolean) {
  if (!emKg) return `${gramas} g`;
  return `${(gramas / 1000).toFixed(1).replace('.', ',')} kg`;
}
```

#### `pontuar(c, preparo, prioridade, economizar)`

Calcula a pontuação do ranking. Exemplos:

- Picanha, churrasco, Explosão de sabor: 3 × 2 + 0 + 1 = **7**.
- Acém, panela, Economia (`economizar = true`): 3 × 2 + 3 + 1 = **10**.

```ts
export function pontuar(c: Carne, preparo: string, prioridade: Prioridade, economizar: boolean) {
  return c[prioridade] * 2 + (economizar ? c.economia : 0) + (c.cat.includes(preparo) ? 1 : 0);
}
```

A ordenação interna (não exportada) desempata pelo sabor:

```ts
function ordenar(lista: Carne[], preparo: string, prioridade: Prioridade, economizar: boolean) {
  return [...lista].sort(
    (a, b) =>
      pontuar(b, preparo, prioridade, economizar) - pontuar(a, preparo, prioridade, economizar) ||
      b.sabor - a.sabor,
  );
}
```

#### `ordenarBlends(carnes, prioridade)`

Ordena os 3 blends. Os pontos são a soma das notas da prioridade das duas carnes × 2, mais a soma da economia quando a prioridade é Economia. O desempate é a soma do sabor.

Exemplo, prioridade Economia:

| Blend | Conta | Pontos | Sabor somado |
| --- | --- | --- | --- |
| Saborosa + magra (Peito + Patinho) | (2 + 2) × 2 + 4 | 12 | |
| Duas saborosas (Peito + Músculo) | (2 + 3) × 2 + 5 | 15 | 6 |
| Duas magras (Patinho + Coxão duro) | (2 + 3) × 2 + 5 | 15 | 2 |

Resultado: **Duas saborosas, Duas magras, Saborosa + magra** (teste).

```ts
export function ordenarBlends(carnes: Carne[], prioridade: Prioridade) {
  const soma = (ids: number[], nota: (c: Carne) => number) =>
    ids.reduce((t, id) => t + nota(carnes.find((c) => c.id === id)!), 0);
  const pontos = (ids: number[]) =>
    soma(ids, (c) => c[prioridade]) * 2 + (prioridade === 'economia' ? soma(ids, (c) => c.economia) : 0);
  return [...BLENDS].sort(
    (a, b) => pontos(b.carnes) - pontos(a.carnes) || soma(b.carnes, (c) => c.sabor) - soma(a.carnes, (c) => c.sabor),
  );
}
```

#### `carnesParaMoer(carnes)`

Devolve as carnes ativas com `moagem`. Hoje são 6: Acém, Paleta, Músculo, Peito bovino, Patinho e Coxão duro.

```ts
export function carnesParaMoer(carnes: Carne[]) {
  return carnes.filter((c) => c.ativo && c.moagem);
}
```

#### `carnesFixas(carnes, preparo)`

Reserva usada quando o Top 3 viria vazio: as 3 primeiras do preparo. Exemplo: churrasco → Picanha, Alcatra e Contra filé. Com 13 carnes ativas, o Top 3 nunca vem vazio, então na prática esta função não é usada.

```ts
export function carnesFixas(carnes: Carne[], preparo: string) {
  const ativas = carnes.filter((c) => c.ativo);
  const doPreparo =
    preparo === 'moida' ? ativas.filter((c) => c.moagem) : ativas.filter((c) => c.cat.includes(preparo));
  return doPreparo.slice(0, 3);
}
```

#### `top3(carnes, escolha)`

Primeiro entram as carnes da categoria, ordenadas; com menos de 3, completa com as outras, pela mesma ordem. Na moída, só entram carnes de moagem: primeiro as da prioridade (com Maciez, todas) e depois as outras de moagem. Sem prioridade, usa sabor.

Exemplos com os dados reais:

- **Churrasco + Explosão de sabor:** Picanha, Alcatra, Contra filé e Fraldinha têm 7 pontos e sabor 3. Ficam na ordem da tabela: **Picanha, Alcatra, Contra filé**.
- **Panela + Economia:** Acém, Paleta, Músculo e Coxão duro somam 10; o Peito bovino soma 7. O desempate pelo sabor põe Músculo (3) antes de Acém e Paleta (2): **Músculo, Acém, Paleta**.

```ts
export function top3(carnes: Carne[], escolha: Escolha) {
  const { preparo, prioridade = 'sabor', economizar = false } = escolha;
  const ativas = carnes.filter((c) => c.ativo);
  let resultado: Carne[];

  if (preparo === 'moida') {
    // Moagem: só as carnes que correspondem à prioridade (maciez não tem lista: usa todas de moagem)
    const moagem = ativas.filter((c) => c.moagem);
    const daPrioridade = moagem.filter((c) => prioridade === 'maciez' || c.moagem === prioridade);
    const outras = moagem.filter((c) => !daPrioridade.includes(c));
    // Menos de 3: completa com as outras de moagem, pela mesma prioridade
    resultado = [
      ...ordenar(daPrioridade, preparo, prioridade, economizar),
      ...ordenar(outras, preparo, prioridade, economizar),
    ].slice(0, 3);
  } else {
    // Só as carnes da categoria; com menos de 3, completa com as outras, pela mesma prioridade
    const daCategoria = ativas.filter((c) => c.cat.includes(preparo));
    const outras = ativas.filter((c) => !c.cat.includes(preparo));
    resultado = [
      ...ordenar(daCategoria, preparo, prioridade, economizar),
      ...ordenar(outras, preparo, prioridade, economizar),
    ].slice(0, 3);
  }

  return resultado.length ? resultado : carnesFixas(carnes, preparo);
}
```

#### `criarItem(escolha, carnes, id)`

Cria o item do carrinho guardando só as escolhas, nunca o peso. Exemplo: `{ faixa: 'mais10', pessoas: 13, preparo: 'panela' }`, carne `[7]` → item com `pessoas: 13`, e o peso calculado depois dá 2000 g, exibido como "2,0 kg" (teste).

```ts
export function criarItem(escolha: Escolha, carnes: number[], id: number): ItemCarrinho {
  return {
    id,
    carnes,
    preparo: escolha.preparo,
    faixa: escolha.faixa,
    pessoas: pessoasDaEscolha(escolha),
    espessura: escolha.espessura,
    tipoBife: escolha.tipoBife,
    hamburguer: escolha.hamburguer,
    blend: escolha.blend,
    vezesMoer: escolha.vezesMoer,
  };
}
```

#### `faixaDasPessoas(pessoas)`

Recupera a faixa de itens antigos, gravados antes de a faixa ser guardada. Exemplos: 8 → `'ate10'`; 12 → `'mais10'`.

```ts
export function faixaDasPessoas(pessoas: number): Faixa {
  if (pessoas > 10) return 'mais10';
  if (pessoas >= 7) return 'ate10';
  if (pessoas >= 4) return 'ate6';
  return 'ate3';
}
```

#### `normalizarItem(gravado)`

Limpa o item lido do banco: descarta `peso` e `emKg` antigos e completa a faixa. Exemplo (teste): item antigo de Picanha, 1 pessoa, com `peso: 9999` → ficha "400 g", "1 a 3 pessoas".

```ts
export function normalizarItem(
  gravado: Omit<ItemCarrinho, 'faixa'> & { faixa?: Faixa; peso?: number; emKg?: boolean },
): ItemCarrinho {
  const { id, carnes, preparo, pessoas, faixa, espessura, tipoBife, hamburguer, blend, vezesMoer } = gravado;
  return {
    id,
    carnes,
    preparo,
    faixa: faixa ?? faixaDasPessoas(pessoas),
    pessoas,
    espessura,
    tipoBife,
    hamburguer,
    blend,
    vezesMoer,
  };
}
```

#### `pesoDoItem(item)`

Peso total do item em gramas. Exemplos: blend com 4 pessoas → 2 × 500 = **1000 g**; bifes com 4 pessoas → 600 g (teste).

```ts
export function pesoDoItem(item: Pick<ItemCarrinho, 'preparo' | 'pessoas' | 'blend'>) {
  return item.blend ? 2 * pesoPorCarneDoBlend(item.pessoas) : pesoTotal(item.preparo, item.pessoas);
}
```

#### `detalheDoItem(item)`

Texto de detalhe mostrado no carrinho. Exemplos: churrasco médio → "Espessura: Médio"; bife de chapa → "Bife de chapa"; moer 2 vezes → "Moagem: 2 vezes".

```ts
export function detalheDoItem(item: Omit<ItemCarrinho, 'id'>) {
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '';
  if (item.espessura) return 'Espessura: ' + ESPESSURAS.find((e) => e.id === item.espessura)?.nome;
  if (item.blend) return 'Blend: ' + BLENDS.find((b) => b.id === item.blend)?.nome;
  if (item.vezesMoer) return `Moagem: ${item.vezesMoer} ${item.vezesMoer === 1 ? 'vez' : 'vezes'}`;
  return '';
}
```

#### `detalheDaFicha(item)`

Coluna "Espessura ou tipo" da ficha. Exemplos: blend Saborosa + magra → "Hambúrguer · Saborosa + magra"; moer 1 vez → "Moagem 1x"; panela → "—".

```ts
export function detalheDaFicha(item: Omit<ItemCarrinho, 'id'>) {
  if (item.espessura) return ESPESSURAS.find((e) => e.id === item.espessura)?.nome ?? '—';
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '—';
  if (item.blend) return 'Hambúrguer · ' + BLENDS.find((b) => b.id === item.blend)?.nome;
  if (item.hamburguer) return 'Hambúrguer';
  if (item.vezesMoer) return `Moagem ${item.vezesMoer}x`;
  return '—';
}
```

#### `pesoDaFicha(gramas, emKg)`

Arredonda para cima de 100 g e formata. Exemplo: `pesoDaFicha(1050, false)` → "1100 g".

```ts
export function pesoDaFicha(gramas: number, emKg: boolean) {
  return formatarPeso(Math.ceil(gramas / 100) * 100, emKg);
}
```

#### `montarFicha(itens)`

Agrupa os itens pela chave `carnes|preparo|detalhe` e soma os pesos. O hambúrguer vira duas linhas, uma por carne.

Exemplo (teste), 4 itens:

| Item | Peso |
| --- | --- |
| Picanha, churrasco fino, 1 a 3 | 400 g |
| Picanha, churrasco fino, 4 a 6 | 1400 g |
| Alcatra, bife fino, 4 a 6 | 600 g |
| Alcatra, churrasco médio, 1 a 3 | 400 g |

Resultado: 3 linhas, com Picanha somada em **1800 g**.

```ts
export function montarFicha(itens: ItemCarrinho[]): LinhaFicha[] {
  const linhas = new Map<string, LinhaFicha>();
  for (const { id, ...item } of itens) {
    const detalhe = detalheDaFicha(item);
    const partes = item.blend
      ? item.carnes.map((carne) => ({ carnes: [carne], peso: pesoPorCarneDoBlend(item.pessoas) }))
      : [{ carnes: item.carnes, peso: pesoDoItem(item) }];
    for (const { carnes, peso } of partes) {
      const chave = [carnes.join('+'), item.preparo, detalhe].join('|');
      const linha = linhas.get(chave);
      if (linha) linha.peso += peso;
      else linhas.set(chave, { carnes, preparo: item.preparo, detalhe, peso });
    }
  }
  return [...linhas.values()];
}
```

#### `pessoasDaFicha(itens)` e `fichaEmKg(itens)`

O maior número de pessoas entre os itens, e se a ficha inteira fica em kg (mais de 10). Exemplo: itens de 1 e de 12 pessoas → 12 → kg.

```ts
export function pessoasDaFicha(itens: ItemCarrinho[]) {
  return Math.max(0, ...itens.map((i) => i.pessoas));
}

export function fichaEmKg(itens: ItemCarrinho[]) {
  return pessoasDaFicha(itens) > 10;
}
```

#### `textoDaFaixa(faixa, pessoas)` e `faixaDaFicha(itens)`

Subtítulo de pessoas da ficha, pelo item com mais pessoas. Exemplos: `('ate6', 4)` → "4 a 6 pessoas"; `('mais10', 12)` → "12 pessoas".

```ts
export function textoDaFaixa(faixa: Faixa, pessoas: number) {
  if (faixa === 'mais10') return `${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'}`;
  return `${FAIXAS.find((f) => f.id === faixa)?.nome} pessoas`;
}

export function faixaDaFicha(itens: ItemCarrinho[]) {
  if (!itens.length) return '';
  const maior = itens.reduce((a, b) => (b.pessoas > a.pessoas ? b : a));
  return textoDaFaixa(maior.faixa, maior.pessoas);
}
```

#### `fichaParaTela(itens)`

Reúne tudo o que a ficha mostra, já formatado. Exemplo (teste): Acém, panela, 1 a 3 (200 g) mais Picanha, churrasco médio, 12 pessoas (4200 g) → linhas "0,2 kg / 4,2 kg", total **"4,4 kg"**, subtítulo "12 pessoas".

```ts
export function fichaParaTela(itens: ItemCarrinho[]) {
  const emKg = fichaEmKg(itens);
  const linhas = montarFicha(itens).map((l) => ({ ...l, texto: pesoDaFicha(l.peso, emKg) }));
  const gramas = linhas.reduce((soma, l) => soma + l.peso, 0);
  return { linhas, emKg, gramas, total: pesoDaFicha(gramas, emKg), subtitulo: faixaDaFicha(itens) };
}
```

#### `dataDeHoje(hoje?)`

Data no formato dd/mm/aaaa. Exemplo: 10 de novembro de 2026 → "10/11/2026".

```ts
export function dataDeHoje(hoje = new Date()) {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(hoje.getDate())}/${dois(hoje.getMonth() + 1)}/${hoje.getFullYear()}`;
}
```

### 3.4 Exemplos de ponta a ponta

Do `README.md` e de `docs/diagnostico-gramas.md`, conferidos pelo teste:

| Pedido | Conta | Ficha |
| --- | --- | --- |
| 2 pessoas, churrasco médio | 1 × 350 = 350 | 400 g |
| 5 pessoas, churrasco fino | 4 × 350 = 1400 | 1400 g |
| 8 pessoas, churrasco grosso | 7 × 350 = 2450 | 2500 g |
| 12 pessoas, churrasco médio | 12 × 350 = 4200 | 4,2 kg |
| 4 pessoas, hambúrguer Saborosa + magra | 4 × 250 = 1000, metade 500 | 500 g + 500 g = 1000 g |
| 9 pessoas, bife de chapa | 7 × 150 = 1050 | 1100 g |
| 11 pessoas, fitness | 11 × 150 = 1650 | 1,7 kg |
| 15 pessoas, hambúrguer | 15 × 250 = 3750, metade 1875 | 1,9 kg + 1,9 kg = 3,8 kg |

---

## 4. Armazenamento

Fontes: `data/banco.ts`, `contexto/AppContexto.tsx`, `docs/fichas-salvas.md` e `metro.config.js`.

### 4.1 Banco (`data/banco.ts`)

Banco SQLite `carnecerta.db`, aberto com `openDatabaseAsync` do `expo-sqlite`.

| Tabela | Colunas | O que guarda |
| --- | --- | --- |
| `kv` | `chave TEXT PRIMARY KEY`, `valor TEXT` | O carrinho atual, na chave `carrinho`, em JSON |
| `fichas` | `id INTEGER PRIMARY KEY AUTOINCREMENT`, `criada_em TEXT` (data ISO), `dados TEXT` (JSON dos itens) | Cada ficha salva |

```ts
async function abrirECriarTabelas() {
  const db = await openDatabaseAsync(NOME_BANCO);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS kv (chave TEXT PRIMARY KEY, valor TEXT);
    CREATE TABLE IF NOT EXISTS fichas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      criada_em TEXT,
      dados TEXT
    );
  `);
  return db;
}
```

**Funções exportadas:**

| Função | O que faz |
| --- | --- |
| `lerCarrinho()` | Lê o carrinho guardado |
| `salvarCarrinho(itens)` | `INSERT OR REPLACE` na chave `carrinho` |
| `listarFichas()` | Lista as fichas, da mais recente para a mais antiga (`ORDER BY id DESC`) |
| `salvarFicha(itens)` | Grava uma ficha e devolve o id dela, ou `null` se falhou |
| `excluirFicha(id)` | Apaga a ficha |

**Decisões no código:**

- **Só as escolhas são gravadas, nunca o peso.** "Grava e lê só as escolhas, nunca o peso: ao abrir, o peso é recalculado com as regras atuais." Toda leitura passa por `normalizarItem`.
- **Limite de 5 s para abrir o banco.** "Na web, um worker que não carrega nunca responde: desiste para o app seguir sem salvar." Se a abertura falhar, a próxima operação tenta de novo.
- **Uma operação por vez (fila).** "Uma operação por vez, na ordem pedida: o último carrinho salvo é sempre o que fica."
- **Erro não derruba o app.** O código mostra um `console.warn` e devolve um valor vazio: `[]`, `false` ou `null`.

```ts
function executar<T>(tarefa: (db: SQLiteDatabase) => Promise<T>, vazio: T): Promise<T> {
  const resultado = fila.then(async () => {
    try {
      return await tarefa(await abrir());
    } catch (erro) {
      console.warn('Banco indisponível, o app segue sem salvar:', erro);
      return vazio;
    }
  });
  fila = resultado;
  return resultado;
}
```

### 4.2 Contexto (`contexto/AppContexto.tsx`)

O `AppProvider` guarda:

- **`salvos`:** os itens do carrinho.
- **`tema`:** `'escuro'` ou `'claro'`. Começa sempre em `'escuro'` e **não é salvo**. O comentário diz: "Não é salvo nem segue o aparelho: o app sempre abre no escuro".
- **`carnes`, `carneById`, `disponiveis`, `adicionarItem`, `removerSalvo` e `alternarTema`.**

Para não perder o carrinho ao abrir o app, ele lê primeiro e só depois começa a salvar a cada mudança:

```ts
useEffect(() => {
  lerCarrinho().then((guardados) => {
    // Mantém o que foi adicionado enquanto a leitura não terminava
    setSalvos((atuais) => [...guardados, ...atuais]);
    setCarregado(true);
  });
}, []);

// Só salva depois de ler, para não apagar o carrinho guardado com a lista ainda vazia
useEffect(() => {
  if (carregado) salvarCarrinho(salvos);
}, [salvos, carregado]);
```

### 4.3 Web e celular

Do `docs/fichas-salvas.md`:

| | Celular | Web |
| --- | --- | --- |
| Onde fica | Arquivo privado do app | Armazenamento do site (OPFS), separado por endereço e porta |
| Quando some | Ao desinstalar o app | Ao limpar os dados do site |
| Observações | | O `metro.config.js` inclui o `.wasm` do SQLite no bundle. "Como o app usa só a API assíncrona, os cabeçalhos COOP/COEP não são necessários." Com duas abas abertas, só a primeira usa o banco |
| Se o banco falhar | O carrinho fica só na memória, a lista de fichas aparece vazia e o botão mostra "Não foi possível salvar" | Igual |

| O que é salvo | Onde |
| --- | --- |
| Carrinho | Tabela `kv`, chave `carrinho` |
| Fichas | Tabela `fichas` |
| Tema | Não é salvo |

O carrinho antigo, guardado em `localStorage` antes do SQLite, não é copiado para o banco novo (`docs/fichas-salvas.md`).

---

## 5. Acessibilidade e Libras

Fontes: `components/VLibrasWidget.tsx`, `screens/TelaLibras.tsx`, `App.tsx`, `screens/TelaInicial.tsx` e `screens/TelaRecomendacao.tsx`.

### 5.1 Carregamento do VLibras na web

O app usa o script oficial `https://vlibras.gov.br/app/vlibras-plugin.js`. Na web, `App.tsx` chama `carregarVLibrasWeb()` uma vez. O comentário em `App.tsx` resume: "Web: botão de sinal do VLibras em todas as telas; o intérprete só abre sozinho na tela Libras". A função:

- força o estado salvo do widget para fechado;
- injeta um CSS que, quando o `body` tem a classe `carnecerta-libras`, esconde o botão de sinal e encaixa o intérprete (`#vlibras-app-root`) numa área definida por variáveis CSS;
- adiciona o script à página.

```ts
export function carregarVLibrasWeb() {
  if (!web || document.querySelector(`script[src="${SCRIPT}"]`)) return;
  try {
    const salvo = localStorage.getItem(CHAVE_ESTADO);
    if (salvo) localStorage.setItem(CHAVE_ESTADO, salvo.replace('"isOpen":true', '"isOpen":false'));
  } catch {}
  const estilo = document.createElement('style');
  estilo.textContent = `
    body.${CLASSE_LIBRAS} #vlibras-access-wrapper { display: none !important; }
    body.${CLASSE_LIBRAS} #vlibras-app-root {
      position: fixed;
      left: var(--cc-vlibras-x);
      top: var(--cc-vlibras-y);
      width: var(--cc-vlibras-w);
      height: var(--cc-vlibras-h);
      transform: translateZ(0);
      overflow: hidden;
      --widget-width: calc(var(--cc-vlibras-w) - 16px);
      --player-height: calc(var(--cc-vlibras-h) - ${ALTURA_CONTROLES}px);
    }`;
  document.head.appendChild(estilo);
  const script = document.createElement('script');
  script.src = SCRIPT;
  document.body.appendChild(script);
}
```

### 5.2 Intérprete fixo na tela Libras

O componente `InterpreteVLibras` funciona assim: "Área do intérprete, sempre aberto enquanto a tela está visível".

**Na web:**

- O componente desenha uma área vazia e grava a posição e o tamanho dela nas variáveis CSS (`encaixar`). O intérprete do widget, que tem `position: fixed`, fica por cima dessa área.
- A cada 700 ms, `manterAberto()` reabre o intérprete se a pessoa o fechar.
- Cliques fora da área das carnes recebem a marca `__vlibrasSyntheticClick`, que o VLibras ignora. Motivo no código: "Fora da área das carnes, o clique segue normal (o VLibras aberto captura cliques em textos)". Assim, cabeçalho e barra inferior continuam funcionando.
- Ao sair da tela, o código tira a classe do `body`, fecha o intérprete e o botão de sinal volta.

**No celular:**

- Um `WebView` carrega um HTML próprio, com o estado do widget já aberto, o botão de sinal escondido e o mesmo "manter aberto" escrito como texto. Motivo no código: "texto fixo: no Hermes a função compilada não vira código-fonte".
- Tocar num cartão chama `traduzir(i)`, que injeta um clique no parágrafo invisível `t{i}`.

**Por que fica fixo.** O commit `0c861a3` se chama "feat: intérprete VLibras fixo na tela Libras". O código descreve o comportamento, mas não diz por que ele foi escolhido. Motivo não encontrado.

```ts
useEffect(() => {
  if (!web || !focada) return;
  carregarVLibrasWeb();
  encaixar();
  document.body.classList.add(CLASSE_LIBRAS);
  manterAberto();
  const intervalo = setInterval(manterAberto, MANTER_ABERTO);
  // Fora da área das carnes, o clique segue normal (o VLibras aberto captura cliques em textos)
  const aoClicar = (ev: MouseEvent) => {
    const area = areaTexto?.current as unknown as HTMLElement | null;
    if (area?.contains?.(ev.target as Node)) return;
    Object.defineProperty(ev, CLIQUE_IGNORADO, { value: true });
  };
  window.addEventListener('click', aoClicar, true);
  window.addEventListener('resize', encaixar);
  return () => {
    clearInterval(intervalo);
    window.removeEventListener('click', aoClicar, true);
    window.removeEventListener('resize', encaixar);
    document.body.classList.remove(CLASSE_LIBRAS);
    // Saindo da tela Libras: fecha o intérprete e volta o botão de sinal
    document.getElementById('vlibras-app-root')?.setAttribute('data-active', 'false');
  };
}, [focada, areaTexto]);
```

### 5.3 Texto invisível para tradução

**Na web,** cada cartão tem por cima um texto com `opacity: 0` que cobre o cartão inteiro. Clicar em qualquer parte do cartão faz o VLibras ler esse texto, e não só o nome. Origem: commit `e0455bb`, "roteiro invisível para o VLibras".

```tsx
// Texto para o VLibras traduzir ao tocar (web). invisivel: cobre o card pai com opacity 0,
// então o toque em qualquer parte do card traduz o texto
export function TextoVLibras({ conteudo, invisivel = false }: { conteudo: string; invisivel?: boolean }) {
  if (invisivel) {
    return <Texto style={[StyleSheet.absoluteFill, styles.invisivel]}>{conteudo}</Texto>;
  }
  return <Texto style={styles.texto}>{conteudo}</Texto>;
}
```

**No celular,** os textos ficam dentro do HTML do `WebView` como parágrafos invisíveis (`.t{position:fixed;opacity:0;pointer-events:none;font-size:1px}`).

**Textos lidos (`screens/TelaLibras.tsx`):**

| Carne | Texto |
| --- | --- |
| Picanha | "Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa." |
| Acém | "Acém. É um corte bovino da parte do pescoço. É ideal para cozidos e ensopados. Fica macio quando cozinhado devagar, na panela." |
| Paleta | "Paleta. Bom para cozidos e assados lentos." |
| Fraldinha | "Fraldinha. Muito saborosa e suculenta, ótima para grelha." |

### 5.4 Layout: web lado a lado, celular embaixo

```ts
// Web: carnes na metade esquerda e intérprete na direita a partir desta largura de janela;
// abaixo dela (e no celular), intérprete na parte de baixo
const LARGURA_LADO_A_LADO = 900;
...
// Intérprete embaixo: 42% da altura da janela, entre 260 e 420
const INTERPRETE_PROPORCAO = 0.42;
const INTERPRETE_MINIMO = 260;
const INTERPRETE_MAXIMO = 420;
```

- O intérprete entra pela propriedade `painel` da `Tela`. Com `painelAoLado`, o corpo da `Tela` vira uma linha (`corpoLado: { flexDirection: 'row' }`).
- Na web lado a lado, a foto dos cartões é limitada para as duas linhas de cartões caberem na altura da janela (`DESCONTO_ALTURA_WEB = 68 + 62 + 16 + 100`).
- A foto ocupa 60% da largura da coluna, entre 90 e 220 px.

### 5.5 Movimento reduzido do sistema

As animações que respeitam a configuração "reduzir movimento" do sistema usam `AccessibilityInfo.isReduceMotionEnabled()`:

| Animação | Com movimento reduzido |
| --- | --- |
| Anel de categorias (`TelaInicial.tsx`, `Orbita`) | Fica parado e só gira com o arraste, sem inércia |
| Faixa de carnes (`TelaInicial.tsx`, `FaixaCarnes`) | Fica parada e rola com a roda ou a barra |
| Pódio (`TelaRecomendacao.tsx`) | Aparece direto, sem a entrada animada |
| Splash (`TelaSplash.tsx`) | Não confere a configuração e sempre anima |

```ts
// Movimento reduzido do sistema (no celular e, na web, pelo prefers-reduced-motion)
useEffect(() => {
  const aplicar = (ativo: boolean) => {
    mov.current.reduzir = ativo;
    if (ativo) mov.current.velocidade = 0;
  };
  AccessibilityInfo.isReduceMotionEnabled().then(aplicar);
  const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', aplicar);
  return () => assinatura.remove();
}, []);
```

### 5.6 Outros pontos de acessibilidade

- Botões com `accessibilityRole="button"` e rótulos, como "Escolher Picanha", "Excluir ficha de 10/11/2026" e "Picanha, primeiro lugar".
- Opções das Escolhas com `accessibilityRole="radio"` e `aria-checked`.
- A pergunta das Escolhas tem `accessibilityRole="header"`.
- Botão do pódio com `minHeight: 32`. Motivo no código: "cresce com a fonte do sistema aumentada, em vez de cortar o texto".
- Na faixa de carnes, a segunda cópia (usada só para o loop) fica com `aria-hidden` e fora do foco do teclado.

---

## 6. Animações e interação

### 6.1 Anel de categorias (`screens/TelaInicial.tsx`, `Orbita`)

**Técnica:**

- O ângulo e a velocidade ficam num `useRef`, fora do React. Um laço de `requestAnimationFrame` atualiza o ângulo a cada quadro e chama `setGiro`.
- **Na web:** 3D com CSS. Cada cartão recebe `perspective`, `translateZ(-raio)`, `rotateY(ângulo)`, `translateZ(raio)` e de novo `rotateY(-ângulo)`, para ficar de frente.
- **No celular:** cálculo com seno e cosseno. A posição X é `sin(ângulo) × raio` e a escala, `0,6 + 0,4 × frente`, onde `frente = (1 + cos) / 2`.
- Os cartões de trás ficam mais transparentes (`0,45 + 0,55 × frente`) e sobem um pouco.
- O arraste usa `PanResponder`; na web, a roda horizontal do mouse também gira.

```ts
// Web: 3D com CSS. O card vai para o anel (rotateY + translateZ) e volta a ficar de frente
// (rotateY ao contrário), para o texto não aparecer espelhado; a perspectiva dá a escala.
// Celular: posição X = seno × raio e escala pela profundidade (cosseno)
const transform = web
  ? [
      { perspective: raio * 3 },
      { translateY: subida },
      { translateZ: -raio },
      { rotateY: `${angulo}deg` },
      { translateZ: raio },
      { rotateY: `${-angulo}deg` },
    ]
  : [{ translateX: Math.sin(rad) * raio }, { translateY: subida }, { scale: 0.6 + 0.4 * frente }];
```

**Por que cada técnica.** O comentário explica o segundo `rotateY`: "para o texto não aparecer espelhado". Ele não explica por que a web usa 3D com CSS e o celular usa seno e cosseno. Motivo não encontrado.

**Comportamento:**

- Gira sozinho e devagar.
- Para com o dedo ou o mouse em cima.
- Ao soltar um arraste, segue com inércia e volta ao giro automático depois de 3 s.
- Um toque logo depois de arrastar não abre a categoria.

| Constante | Valor | Comentário no código |
| --- | --- | --- |
| `PASSO_ANEL` | 360 / 6 = 60° | 6 categorias |
| `GIRO_AUTOMATICO` | −6 °/s | "uma volta em 60 s (cada card ~10 s à frente)" |
| `CARD_PROPORCAO` / `CARD_MAXIMO` | 0,34 / 170 (web) ou 150 (celular) | |
| `RAIO_PROPORCAO` | 0,44 (web) / 0,38 (celular) | Conta conferida para o cartão não passar da borda |
| `RAIO_MAXIMO_EM_CARDS` | 1,3 | |
| `SUBIDA` | 0,18 | "para o anel aparecer" |
| `INERCIA` | 0,6 s | |
| `VOLTA_AO_AUTOMATICO` | 3000 ms | |
| `SUAVIZACAO` | 0,5 s | |
| `VELOCIDADE_MAXIMA` | 720 °/s | "2 voltas por segundo" |
| `LIMIAR_ARRASTE` | 6 px | "abaixo disso é toque no card" |
| `IGNORAR_TOQUE_APOS_ARRASTE` | 400 ms | |
| `GRAUS_POR_RODA` | 0,25 | |

### 6.2 Faixa de carnes (`screens/TelaInicial.tsx`, `FaixaCarnes`, só na web)

**Técnica:**

- `requestAnimationFrame` grava o `translateX` direto no elemento da página (`trilha.style.transform`), sem renderizar o React a cada quadro. O comentário diz: "A posição é aplicada direto no elemento (sem render do React a cada quadro)".
- A lista aparece duas vezes seguidas. A posição volta ao início quando chega a uma volta completa (`% CICLO_FAIXA`), e por isso o loop não mostra salto.
- O mouse em cima para a faixa com desaceleração suave (`pointerenter` e `pointerleave`).
- As duas pontas têm um `LinearGradient` da cor do fundo para transparente.

| Constante | Valor |
| --- | --- |
| `VELOCIDADE_FAIXA` | 30 px/s ("cada carne passa em ~5 s") |
| `LARGURA_ITEM_FAIXA` / `ESPACO_FAIXA` / `ALTURA_ITEM_FAIXA` | 150 / 12 / 108 px |
| `ICONE_FAIXA` | 56 px |
| `CICLO_FAIXA` | 16 × (150 + 12) = 2592 px |
| `SUAVIZACAO_FAIXA` | 0,25 s |
| `LARGURA_ESMAECER` | 72 px |

```ts
const passo = () => {
  const agora = Date.now();
  const dt = Math.min((agora - anterior) / 1000, 0.1); // s; limita saltos depois de pausas
  anterior = agora;
  const m = mov.current;
  const alvo = m.sobre ? 0 : VELOCIDADE_FAIXA;
  m.velocidade += (alvo - m.velocidade) * (1 - Math.exp(-dt / SUAVIZACAO_FAIXA));
  m.x = (m.x + m.velocidade * dt) % CICLO_FAIXA;
  trilha.style.transform = `translateX(${-m.x}px)`;
  quadro = requestAnimationFrame(passo);
};
```

### 6.3 Splash (`screens/TelaSplash.tsx`)

**Técnica:** a API `Animated` do React Native, com um único `Animated.Value` de 0 a 4000 ms em ritmo linear. Cada efeito é um trecho dele, feito com `interpolate`. Na web, o recorte da palavra em duas metades é feito com um quadrado girado 20° e `overflow: hidden`.

| Tempo | O que acontece |
| --- | --- |
| 0 a ~1,7 s | ✓ e letras entram uma a uma (`INTERVALO` 120 ms, `ENTRADA` 400 ms) |
| 1,6 a 2,6 s | A linha do corte é traçada |
| 2,6 a 3,4 s | As metades se afastam (`AFASTAMENTO` 14, `DESLIZE` 6) e somem |
| 3,4 a 3,8 s | O fundo escurece |
| 3,7 a 4 s | A tela some e vai para a Início |

**Por que um relógio só:** o comentário diz "Um único relógio de 0 a DURACAO; cada parte da animação é um trecho dele".

### 6.4 Pódio (`screens/TelaRecomendacao.tsx`)

**Técnica:** `Animated.stagger` com `Animated.timing`, um valor por lugar. Os lugares entram na ordem #3, #2 e #1, com 300 ms entre eles. Cada um sobe 20 px, vai de transparente a opaco e cresce de 0,8 a 1 em 500 ms (`Easing.out(Easing.cubic)`). O driver nativo só é usado fora da web.

```ts
animacao = Animated.stagger(
  ENTRADA_INTERVALO,
  [...entrada].reverse().map((v) =>
    Animated.timing(v, {
      toValue: 1,
      duration: ENTRADA_DURACAO,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }),
  ),
);
```

**Interação:** o botão vira "Adicionado ✓" por 2 s (`TEMPO_ADICIONADO`), e um toque repetido no mesmo corte nesse intervalo é ignorado.

---

## 7. Design e tema

Fonte: `components/tema.ts` (e `components/ui.tsx` para as fontes). O cabeçalho do arquivo diz: "Paletas aprovadas (docs/referencia/tela-inicial.html; claro: opção 2 'Brasa' de claro-exemplos.html). Todas as cores do app saem daqui".

### 7.1 Paletas base

| Token | Escuro ("Palco escuro") | Claro ("Brasa") |
| --- | --- | --- |
| fundo | `#2a0f14` | `#e9d6b8` |
| cartao | `#3d1820` | `#f6dcc4` |
| borda | `#5a2a34` | `rgba(110,28,39,0.22)` |
| texto | `#f6efe3` | `#2a1a1e` |
| secundario | `#c9a9ae` | `#6b5a55` |
| principal | `#f6efe3` | `#6e1c27` |
| destaque | `#ff7a1a` | `#d9531e` |
| rotulo | `#ff9a4d` | `#6e1c27` |
| textoBotao | `#1b1b1f` | `#ffffff` |
| apoio | | `#f6dcc4` ("chips: mesmo fundo dos cartões") |

**Papel da ficha no tema escuro** (`papelEscuro`): fundo `#f6efe3`, texto `#1b1b1f`, borda `#e4dfd6`, "o papel claro de antes (fixo, não segue o tema claro)". No tema claro, o papel usa o `cartao` (`#f6dcc4`).

**Valores próprios de cada tema:**

| Token | Escuro | Claro |
| --- | --- | --- |
| sombraBotao | `0px 4px 14px rgba(255,122,26,0.35)` | `0px 6px 16px -6px #e8561a` |
| brilhoDestaque | `0px 0px 8px rgba(255,122,26,0.6)` | `0px 0px 8px rgba(217,83,30,0.6)` |
| camadaBanner | `rgba(20,8,10,0.65)` | `rgba(110,28,39,0.85)` |
| placeholder | `rgba(246,239,227,0.5)` | `#6b5a55` |
| opcaoAtiva (gradiente) | `rgba(255,122,26,0.16)` | `rgba(217,83,30,0.12)` |

**Degradê "Brasa"** (só no tema claro: botões e chip ativo), horizontal:

```ts
const degradeBrasa = {
  colors: ['#ff9a4d', '#e8561a', '#c4401a'] as const,
  locations: [0, 0.6, 1] as const,
  ...horizontal,
};
```

Os demais "gradientes" usam cor lisa (`solido(cor)`). Motivo no código: "as paletas aprovadas não usam gradiente nos blocos".

### 7.2 Fontes

Carregadas em `App.tsx`:

- **Bebas Neue** (`BebasNeue_400Regular`): títulos e logo.
- **DM Sans** (`DMSans_400Regular`, `DMSans_600SemiBold` e `DMSans_700Bold`): corpo, botões e rótulos.

Onde cada fonte aparece:

- **Início, cabeçalho e barra da Início, e pódio:** sempre Bebas e DM Sans, nos dois temas (`FONTE_TITULO`, `FONTE_CORPO`).
- **Outras telas:** só no tema claro (`temaClaro.fontes`, aplicado por `fonteTitulo` e `fonteCorpo` em `components/ui.tsx`). No escuro, "continua com as fontes de antes", que são as do sistema.
- **Detalhe técnico:** `fonteCorpo` troca o `fontWeight` pela família do peso certo e volta o peso para `normal`. Motivo no código: "para não engrossar de novo".

### 7.3 Estilo da Início (`estilosInicio`)

| Token | Escuro | Claro |
| --- | --- | --- |
| Gradiente sobre a foto do banner | `rgba(20,8,10,0.15)` → `rgba(20,8,10,0.9)` | `rgba(255,122,26,0.35)` → `rgba(110,28,39,0.85)` |
| Botão do banner | Cor lisa do destaque | Degradê Brasa com sombra |
| Pílula do cabeçalho | Fundo `#3d1820` | Fundo transparente, texto vinho |
| Nome das categorias | Bebas 17 | Bebas 17 ("antes, no claro: DM Sans 12 negrito") |

### 7.4 A decisão do tema "Brasa"

- **Evidência:** commit `376e6f7`, "feat: aplica tema claro Brasa (cores, degradês e fontes)". Em `tema.ts`, "claro: opção 2 'Brasa' de claro-exemplos.html" e "Tema claro 'Brasa': bege, cartões laranja bem claro (nenhum branco), vinho e laranja".
- **Alternativas descartadas:** `docs/referencia/claro-exemplos.html` ("Exemplos do tema claro (laranja e bege)") mostra mais de uma opção, e a "Brasa" foi a opção 2. As outras não foram descritas aqui porque o HTML não foi copiado.
- **Motivo da escolha:** não está escrito. Motivo não encontrado.
- **Onde aparece:**
  - Fundo, cartões e textos de todas as telas no tema claro.
  - Degradê nos botões e no chip ativo.
  - Botão do banner com sombra.
  - Bebas e DM Sans em todas as telas.
  - O papel da ficha passa a usar a cor do cartão.
  - Referência visual do catálogo: `docs/referencia/catalogo-claro (1).html`.
- **Como trocar:** o botão "Claro" / "Escuro" só existe no cabeçalho da Início. O app sempre abre no escuro.

---

## 8. Testes

Fonte: `data/testeEscolha.ts`. Relatórios anteriores: `docs/relatorio-testes.md` e `docs/diagnostico-gramas.md`.

### 8.1 O que cobre

O teste compara o app com "regras escritas à mão, sem usar as constantes do app" (`NOTAS`, `CATEGORIAS`, `MOAGEM`, `PARES_BLEND` e `GRAMAS`).

| Grupo | O que confere | Casos |
| --- | --- | --- |
| 0. Tabela de carnes | 13 carnes, notas, categorias e moagem | 1 |
| 1. Combinações do fluxo | 5 entradas de pessoas (1, 4, 7, 11, 25) × preparos × prioridades, conferindo Top 3, ordem, peso, unidade e detalhe | 320 |
| 2. Ficha | Soma de itens iguais, linhas separadas por preparo, total "2800 g" e subtítulo | 1 |
| 3. Ordem dos blends | Uma ordem por prioridade | 4 |
| 4. Exemplos do pedido | Churrasco 1400, bifes 600, blend 200/400, 13 pessoas em "2,0 kg" | 1 |
| 5. Diagnóstico | Os 10 casos de `docs/diagnostico-gramas.md` | 10 |
| 6. Hambúrguer | Duas carnes, "1,4 kg" cada, total "2,8 kg" | 1 |
| 7. Unidade | Unidade decidida pela ficha inteira | 1 |
| 8. Ficha antiga | Peso gravado ignorado e recalculado | 1 |

Conta do grupo 1, por entrada de pessoas:

| Preparo | Conta | Casos |
| --- | --- | --- |
| Churrasco | 4 prioridades × 3 espessuras | 12 |
| Bifes | 4 prioridades × 3 tipos | 12 |
| Panela | 4 prioridades | 4 |
| Desfiar | 4 prioridades | 4 |
| Fitness | 4 prioridades | 4 |
| Moída (Top 3) | 4 prioridades | 4 |
| Moída com blend | 4 prioridades × 3 blends | 12 |
| Moída sem hambúrguer | 6 carnes × 2 moagens | 12 |
| **Total** | | **64** |

São 64 casos por entrada × 5 entradas = 320.

### 8.2 Quantos casos existem de fato

**Contei 340.** Somando os grupos: 1 + 320 + 1 + 4 + 1 + 10 + 1 + 1 + 1 = 340.

**Rodei o teste nesta análise.** A saída da compilação foi para uma pasta temporária, fora do projeto. O resultado foi: `Resultado: 340 passaram, 0 falharam (340 casos)`.

Histórico: 327 casos em 06/11/2026 (`docs/relatorio-testes.md`) e 340 depois da correção das gramas (`docs/diagnostico-gramas.md`, seção 8).

### 8.3 Como rodar

Do cabeçalho do arquivo:

```bash
npx tsc data/testeEscolha.ts --ignoreConfig --outDir <pasta> --module commonjs --target es2020 --skipLibCheck
node <pasta>/testeEscolha.js
```

Checagens gerais: `npx tsc --noEmit` e `npx expo lint`. Não há framework de testes (Jest ou similar) no `package.json`, nem testes de tela.

---

## 9. Organização de código

### 9.1 Convenções

- **Nomes em português:** arquivos (`TelaCarrinho`, `escolha.ts`, `banco.ts`), funções (`pesoDoItem`, `montarFicha`, `alternarTema`), tipos (`ItemCarrinho`, `FichaSalva`), rotas (`Inicio`, `Catalogo`) e constantes em maiúsculas (`VELOCIDADE_FAIXA`, `MINIMO_MAIS10`). As exceções vêm de bibliotecas (`useEffect`, `style`).
- **Comentários:** em português, quase sempre dizendo o porquê ou a regra ("Só salva depois de ler, para não apagar…"). As constantes numéricas vêm com a conta comentada, como em `ALTURA_ITEM_FAIXA` ("padding 12 + ícone 56 + espaço 6 + nome 24 + padding 10").
- **Regra separada da tela:**
  - `data/escolha.ts` tem "funções puras, sem interface, para testar separadamente".
  - As telas só chamam essas funções.
  - `fichaParaTela` é usada pela ficha, pela lista de fichas e pelo teste.
- **Uma fonte de cores:** "Todas as cores do app saem daqui" (`components/tema.ts`).
- **Componentes de interface reutilizáveis** em `components/ui.tsx`: `Texto`, `Titulo`, `Sub`, `Botao`, `Botao2`, `Cartao`, `Foto`, `Entrada`, `Chip`, `Opcao`, `Grade`, `Grade2`, `Icone` e `Gradiente`. Os comentários fazem referência às classes do protótipo HTML (`.btn`, `.card`, `.chip`, `.grid2`).

### 9.2 Padrões que se repetem

- `const web = Platform.OS === 'web'` no topo dos arquivos, com ramos separados para web e celular.
- Larguras de corte (900 px) para trocar o layout na web (`TelaInicial` e `TelaLibras`).
- Animação contínua com `requestAnimationFrame` e estado num `useRef` (anel e faixa), ou com `Animated` (splash e pódio).
- `useIsFocused` e `useFocusEffect` para pausar animações ou recarregar dados quando a tela não está visível.
- `AccessibilityInfo.isReduceMotionEnabled()` para respeitar o movimento reduzido.
- `navigation.popTo(...)` em toda a navegação, em vez de empilhar telas.
- Medidas da tela tiradas de `useWindowDimensions()`.

### 9.3 Dependências entre arquivos

```text
index.ts → App.tsx
App.tsx → contexto/AppContexto, components/ui (Gradiente), components/VLibrasWidget, screens/*
contexto/AppContexto → components/tema, data/banco, data/carnes, data/escolha
data/banco → data/escolha (normalizarItem)
data/escolha → data/carnes (tipo Carne)
data/testeEscolha → data/carnes, data/escolha   (nenhuma tela importa)
components/Tela → contexto, data/categorias, screens/rotas, components/tema, components/ui
components/ui → contexto, data/categorias, components/tema
components/VLibrasWidget → contexto, components/ui
screens/rotas → data/banco (tipo FichaSalva), data/escolha (tipo Escolha)
screens/Tela* → components/Tela, components/ui, contexto, data/*, screens/rotas
screens/TelaInicial → também assets/icones/carnes/*.svg (via react-native-svg-transformer)
```

### 9.4 Configuração

| Arquivo | O que configura |
| --- | --- |
| `metro.config.js` | Aceita `.wasm` (SQLite na web) e transforma `.svg` em componente |
| `declarations.d.ts` | Tipo do `import x from '*.svg'` |
| `eslint.config.js` | Configuração do Expo, ignorando `dist/*` |
| `tsconfig.json` | `strict: true` |
| `.gitignore` | Ignora `prototipo/` ("protótipo de referência (fica fora do repositório)"), `ios/`, `android/`, `dist/` e outros |
| `.claude/settings.json` | Ativa o plugin `expo@claude-plugins-official` |
| `CLAUDE.md` | Só aponta para `AGENTS.md` (`@AGENTS.md`) |
| `AGENTS.md` | Instruções: Expo muda a cada SDK (consultar a documentação da versão), usar `npx expo install`, rodar lint e tipos antes de concluir, não editar `ios/` e `android/` à mão |

### 9.5 `assets/`

Contagem de arquivos diretos em cada pasta. Imagens não foram abertas.

| Pasta | Arquivos |
| --- | --- |
| `assets/` (ícones do app, banner, favicon, splash) | 7 |
| `assets/categorias/` | 6 |
| `assets/icones/carnes/` (SVG) | 16 |
| `assets/imagens/imagemboi/` | 1 |
| `assets/imagens/imagenscarnes/` (soltos) | 2 |
| `.../acem` | 5 |
| `.../alcatra` | 7 |
| `.../bistecadocontra` | 2 |
| `.../bistecaodoacem` | 2 |
| `.../boi` | 5 |
| `.../contraFileNoix` | 3 |
| `.../contrafileTradicional` | 5 |
| `.../costelaBovina` | 8 |
| `.../coxaomole` | 5 |
| `.../filemignon` | 4 |
| `.../fraldinha` | 4 |
| `.../lagarto` | 6 |
| `.../lingua` | 8 |
| `.../maminha` | 5 |
| `.../mocoto` | 2 |
| `.../musculo` | 5 |
| `.../ossobuco` | 3 |
| `.../paleta` | 3 |
| `.../patinho` | 4 |
| `.../picanha` | 6 |
| `.../pontadealcatra` | 5 |
| `.../pontadepeito` | 2 |
| `.../rabobovino` | 3 |
| `.../telas` | 4 |
| `assets/imagens/imagenspersonas/` | 0 |
| `assets/imagens/imagenstelas/` | 1 |

Há pastas de fotos de carnes que não estão na tabela de carnes (bisteca, contra filé noix, costela, língua, maminha, mocotó, ossobuco, ponta de alcatra, rabo). Duas pastas têm vídeos `.mp4`, segundo a listagem de arquivos.

### 9.6 `docs/` e `prototipo/`

| Arquivo | Para que serve |
| --- | --- |
| `docs/diagnostico-gramas.md` | Diagnóstico do cálculo de gramas (09/11/2026): 7 causas encontradas e o status de cada uma depois da correção |
| `docs/fichas-salvas.md` | Como o carrinho e as fichas são salvos, o que acontece quando o banco falha, e o roteiro de teste manual |
| `docs/relatorio-testes.md` | Relatório de 06/11/2026: 327 casos e os valores do tema escuro **de então** (desatualizado) |
| `docs/referencia/tela-inicial.html` | "Referência da tela Início: tema escuro (esquerda) e tema claro (direita)" |
| `docs/referencia/clara.html` | "Prévia do tema claro CarneCerta", com o modelo do pódio ("Para você, nesta ordem") |
| `docs/referencia/claro-exemplos.html` | "Exemplos do tema claro (laranja e bege)", com as opções; a "Brasa" foi a 2 |
| `docs/referencia/catalogo-claro (1).html` | "Catálogo no tema claro (opção Brasa)" |
| `prototipo/index (4).html` | "CarneCerta - Protótipo" (340 linhas). Fica fora do repositório pelo `.gitignore` |

---

## 10. Decisões registradas

Formato: decisão, alternativa descartada, motivo e evidência.

1. **App sem login e cadastro.**
   - Alternativa descartada: telas de usuário e administração (commits `be54db4`, `1e479ef` e `0daf37d`, "adiciona dados de carnes e usuários").
   - Motivo: não encontrado. O commit `361e2a0` só registra "remove login e cadastro, app abre na tela inicial e carrinho fica salvo no aparelho".
2. **Pessoas do cálculo = limite de baixo da faixa; acima de 10, o número digitado.**
   - Alternativa descartada: um número representativo da faixa (por exemplo, o de cima). Não está documentada.
   - Motivo: não encontrado. Evidência: commit `2cfabed` ("faixas pelo limite de baixo, número exato acima de 10").
3. **Arredondar sempre para cima, de 100 em 100 g.**
   - Alternativa descartada: não encontrada.
   - Motivo: não encontrado. Evidência: `paraCima100` e o README.
4. **Hambúrguer sempre com duas carnes (blend).**
   - Alternativa descartada: a pergunta "É blend?" com a resposta "Não" (uma carne só).
   - Motivo: "A regra diz que hambúrguer são sempre duas carnes" (`docs/diagnostico-gramas.md`, causa 3).
5. **Cada carne do blend leva metade do total, arredondada para cima.**
   - Alternativa descartada: mostrar só a soma numa linha "Carne A + Carne B".
   - Motivo: a ficha não dizia quanto era de cada carne (diagnóstico, causa 4). Commit `2cfabed`: "peso do blend por carne".
6. **Ordem dos blends pela prioridade, com a "fórmula aprovada".**
   - Alternativa descartada: não encontrada.
   - Motivo: não encontrado além de "fórmula aprovada" (commit `6869233` e comentário no teste).
7. **Sem a pergunta "Quer economizar?": a economia vem só da prioridade Economia.**
   - Alternativa descartada: uma pergunta separada sobre economizar.
   - Motivo: não encontrado. Evidência: comentários em `TelaEscolhas.tsx` e no teste ("'Quer economizar?' não existe").
8. **Prioridade antes dos detalhes do preparo.**
   - Alternativa descartada: detalhes antes da prioridade.
   - Motivo: não encontrado. Evidência: commit `2cfabed` ("prioridade antes dos detalhes").
9. **Moída vai direto ao carrinho, sem Top 3.**
   - Alternativa descartada: passar pelo pódio.
   - Motivo: "Moída já define a carne" (comentário em `TelaEscolhas.tsx`).
10. **Guardar só as escolhas e recalcular o peso ao abrir.**
    - Alternativa descartada: gravar o peso no item.
    - Motivo: o peso ficava "congelado" e não acompanhava as regras novas (diagnóstico, causa 7; comentários em `banco.ts`).
11. **Unidade (g ou kg) decidida pela ficha inteira.**
    - Alternativa descartada: total geral sempre em kg, e kg "contaminando" a linha somada.
    - Motivo: o total aparecia em kg mesmo com até 10 pessoas (diagnóstico, causas 1 e 5).
12. **Subtítulo da ficha mostra a faixa ("1 a 3 pessoas").**
    - Alternativa descartada: mostrar o limite de baixo como número ("1 pessoas").
    - Motivo: "Pode parecer erro para quem usa o app" (diagnóstico, seção 4).
13. **SQLite (`expo-sqlite`) para carrinho e fichas.**
    - Alternativa descartada: `localStorage` / `expo-sqlite/localStorage/install` (`docs/relatorio-testes.md`).
    - Motivo: não está escrito por que o SQLite foi escolhido. Motivo não encontrado. Evidência: commit `e75233d`.
14. **App segue funcionando sem banco (limite de 5 s).**
    - Alternativa descartada: travar ou mostrar erro.
    - Motivo: "Na web, um worker que não carrega nunca responde: desiste para o app seguir sem salvar" (`banco.ts`).
15. **Tema não é salvo; o app sempre abre no escuro.**
    - Alternativa descartada: seguir o tema do aparelho, ou salvar a escolha.
    - Motivo: não encontrado. O comentário só descreve: "Não é salvo nem segue o aparelho".
16. **Tema claro "Brasa" (opção 2).**
    - Alternativa descartada: as outras opções de `claro-exemplos.html`.
    - Motivo: não encontrado (seção 7.4).
17. **Cores lisas em vez de gradientes nos blocos.**
    - Alternativa descartada: os gradientes do tema antigo (listados em `docs/relatorio-testes.md`).
    - Motivo: "as paletas aprovadas não usam gradiente nos blocos" (`tema.ts`).
18. **Ficha em "papel claro" nos dois temas.**
    - Alternativa descartada: a ficha na cor do tema escuro.
    - Motivo: não encontrado. Evidência: comentários em `TelaFicha.tsx` e `tema.ts`.
19. **Preços não aparecem.**
    - Alternativa descartada: mostrar o `valor` de cada carne.
    - Motivo: "Não exibir até a integração com os açougues" (`carnes.ts`). Commit `3c48212`.
20. **VLibras pelo script oficial, com intérprete fixo na tela Libras e botão de sinal nas outras telas (web).**
    - Alternativa descartada: só o botão de sinal, com o intérprete aberto pela pessoa. Era o que a instrução da tela ainda descreve.
    - Motivo: não encontrado (seção 5.2). Commits `4e3e8ce` e `0c861a3`.
21. **Texto invisível por cima do cartão para o VLibras ler.**
    - Alternativa descartada: ler só o nome visível.
    - Motivo: "então o toque em qualquer parte do card traduz o texto" (`VLibrasWidget.tsx`). Commit `e0455bb`.
22. **No celular, o VLibras roda num WebView, com o script de "manter aberto" escrito como texto.**
    - Alternativa descartada: a função compilada.
    - Motivo: "no Hermes a função compilada não vira código-fonte".
23. **Anel 3D com CSS na web, e seno e cosseno no celular.**
    - Alternativa descartada: não encontrada (antes havia "grade de categorias no início web", commit `9153a4a`).
    - Motivo: só o do segundo `rotateY` ("para o texto não aparecer espelhado"). Motivo da escolha geral não encontrado.
24. **Faixa de carnes movida direto no elemento da página.**
    - Alternativa descartada: renderizar o React a cada quadro.
    - Motivo: "sem render do React a cada quadro" (comentário). O ganho de desempenho é implícito.
25. **Animações respeitam o movimento reduzido do sistema** (anel, faixa e pódio).
    - Alternativa descartada: animar sempre.
    - Motivo: não está escrito além da descrição do comportamento. Motivo não encontrado.
26. **Splash com um único relógio `Animated` e `reset` ao terminar.**
    - Alternativa descartada: `navigate`, que deixaria a splash na pilha.
    - Motivo: "o 'voltar' não retorna para ela".
27. **Busca do catálogo sem acentos, combinada com o filtro de categoria.**
    - Alternativa descartada: não encontrada.
    - Motivo: o exemplo "Acém" → "acem" no código. Commit `1b2726a`.
28. **Fotos do catálogo padronizadas na peça inteira crua.**
    - Alternativa descartada: fotos variadas por carne.
    - Motivo: "para o catálogo ficar padronizado" (`imagensCategorias.ts`). Commit `3d3d2ac`.
29. **Pódio com larguras 92 + 116 + 92.**
    - Alternativa descartada: não encontrada.
    - Motivo: "o que cabe num celular de 360 com 18 de margem de cada lado".
30. **Ícones `.svg` importados como componentes.**
    - Alternativa descartada: não encontrada.
    - Motivo: não encontrado. Evidência: `metro.config.js` e commit `92f5424`.
31. **Protótipo fora do repositório.**
    - Alternativa descartada: versionar o protótipo.
    - Motivo: "protótipo de referência (fica fora do repositório)" (`.gitignore`). O motivo de fundo não foi encontrado.
32. **Lógica em funções puras separadas da interface.**
    - Alternativa descartada: regras dentro das telas. O diagnóstico mostra o total geral que era calculado na própria TelaFicha.
    - Motivo: "para testar separadamente" (`escolha.ts`).

---

## 11. Conceitos principais

Explicações curtas, para quem não programa.

- **App multiplataforma (Expo / React Native):** um único código que vira app de Android, de iPhone e site. O Expo é o kit de ferramentas que facilita montar, testar e publicar esse app.
- **Componente:** uma peça de tela reutilizável, como um botão ou um cartão. A tela é montada encaixando componentes, como blocos de montar.
- **Tela e rota:** cada tela do app tem um nome (a rota), como "Carrinho" ou "Catálogo". Navegar é pedir para ir até o nome de outra tela.
- **Pilha de navegação:** as telas abertas ficam empilhadas como cartas; voltar tira a de cima. A splash usa "reset" para sair da pilha e não voltar mais.
- **Estado:** a memória de curto prazo de uma tela, como a resposta escolhida numa pergunta. Quando o estado muda, a tela se redesenha.
- **Contexto:** uma memória compartilhada por todas as telas. No app, guarda o carrinho e o tema, para qualquer tela poder ler e mudar.
- **Função pura:** uma conta que, com as mesmas entradas, sempre dá o mesmo resultado e não mexe em mais nada. Por isso dá para testá-la sozinha, sem abrir o app.
- **Ranking (pontuação):** cada carne ganha pontos conforme o que a pessoa disse ser mais importante; as 3 com mais pontos formam o Top 3. Em caso de empate, vence a de mais sabor.
- **Faixa de pessoas:** em vez de digitar o número exato, a pessoa escolhe um grupo (1 a 3, 4 a 6…). O app faz a conta com o menor número do grupo.
- **Arredondamento para cima:** o peso sempre sobe para a próxima centena de gramas (1050 g vira 1100 g), para não faltar carne e facilitar o pedido ao açougueiro.
- **Blend:** a mistura de duas carnes moídas para hambúrguer. Cada carne leva metade do peso total.
- **Moagem:** carnes que servem para moer. Cada uma está ligada a uma prioridade: economia, magra ou sabor.
- **Ficha para o açougueiro:** a lista final, em formato de papel, com corte, preparo, detalhe e peso. É o que a pessoa mostra no balcão.
- **Banco de dados local (SQLite):** um pequeno arquivo dentro do celular, ou do navegador, onde o app guarda o carrinho e as fichas, mesmo depois de fechado.
- **Tema (escuro e claro):** o conjunto de cores e fontes do app. O botão Claro/Escuro troca tudo de uma vez.
- **Token de cor:** um nome para uma cor, como "destaque" ou "fundo". As telas usam o nome; trocar o tema troca a cor por trás do nome.
- **Gradiente / degradê:** uma cor que passa suavemente para outra. O tema claro "Brasa" usa um degradê laranja nos botões.
- **Libras e VLibras:** Libras é a Língua Brasileira de Sinais. O VLibras é uma ferramenta oficial do governo que mostra um avatar traduzindo textos para Libras.
- **WebView:** uma "janela de navegador" dentro do app de celular. O VLibras roda dentro dela no celular.
- **Texto invisível:** um texto que existe na tela, mas está transparente. Serve para o VLibras ter a frase completa para traduzir quando a pessoa toca no cartão.
- **Movimento reduzido:** uma opção do celular ou do computador para quem passa mal com animações. O app respeita essa opção e para o anel, a faixa e a entrada do pódio.
- **Animação quadro a quadro (requestAnimationFrame):** o navegador ou o celular avisa o app umas 60 vezes por segundo, e a cada aviso o app move um pouco o anel ou a faixa.
- **3D com CSS:** recursos do navegador para girar e afastar elementos em profundidade. É assim que o anel de categorias parece um carrossel 3D na web.
- **Seno e cosseno:** contas de geometria que dizem onde fica um ponto num círculo. No celular, elas posicionam cada cartão do anel e dizem se ele está na frente ou atrás.
- **Inércia:** depois de arrastar o anel e soltar, ele continua girando e vai parando aos poucos, como uma roda.
- **Loop contínuo da faixa:** a lista de carnes aparece duas vezes seguidas; quando a primeira sai de vista, a faixa volta ao começo sem que se perceba o salto.
- **SVG:** um formato de desenho feito de linhas (não de pixels), que fica nítido em qualquer tamanho. Os ícones das carnes são SVG.
- **Teste automatizado:** um programa que confere centenas de casos de cálculo de uma vez e avisa se algum resultado mudou.
- **Lint e checagem de tipos:** revisores automáticos do código. Um aponta erros de estilo e descuidos; o outro confere se cada informação tem o formato esperado.
- **Commit e branch:** um commit é um "salvamento" com descrição no histórico do projeto. Uma branch é uma linha paralela de trabalho, juntada depois à principal (merge).

---

## 12. Lacunas e dúvidas

### 12.1 Arquivos não lidos ou lidos em parte

- `package-lock.json` e `LICENSE`: não lidos (dependências exatas e licença).
- `docs/referencia/*.html` (4 arquivos) e `prototipo/index (4).html`: lidos só o título, os comentários e os cabeçalhos, como pedido. O conteúdo visual não foi descrito.
- Imagens e vídeos de `assets/`: só contados, não abertos.

### 12.2 Trechos incompletos ou sem uso

- **Detalhe pela tela Libras não é alcançável.** `TelaDetalhe.tsx` tem o ramo `origem === 'libras'` (vídeo e "Ver ficha para o açougueiro"), mas nenhuma tela navega com `origem: 'libras'`. A tela Libras não abre o Detalhe.
- **Vídeos em Libras:** o campo `libras` está vazio em todas as 13 carnes.
- **Código sem uso:** `iconeCategoria` (`data/categorias.ts`), o componente `Secao` (`components/ui.tsx`) e a opção `grande` do `Botao` não são usados em nenhuma tela.
- **`carnesFixas`** só entra se o Top 3 vier vazio, o que não acontece com 13 carnes ativas.
- **Campos sem uso na interface:** `valor` (preço) e `foto` (nome usado só como rótulo de reserva).
- **Faixa de 16 carnes na web:** Maminha, Costela e Carne moída têm ícone, mas não existem em `data/carnes.ts`; aparecem e não abrem tela.
- **Fotos sem uso:** há pastas de fotos de carnes que não estão no app (costela, maminha, língua, mocotó, ossobuco, rabo, bisteca, ponta de alcatra, contra filé noix), mais `imagemboi` ("Mapa do boi", segundo o README) e `imagenspersonas` vazia.

### 12.3 Inconsistências entre README e código

- **Carnes na tela Libras:** o README fala em "Libras (Picanha e Acém)", mas o código tem 4 carnes: Picanha, Acém, Paleta e Fraldinha.
- **Descrição dos cartões de Libras:** o README diz "Card da Picanha, com o widget do VLibras visível" e "Card do Acém, com o widget sobre o card inteiro". Hoje todos os cartões seguem o modelo do Acém, e o intérprete fica fixo ao lado ou embaixo.
- **Foto da Picanha:** o README lista em "Fotos a gerar" a "Foto da Picanha na tela de Libras ('Foto em breve')", mas o código já usa `picanhainteiracrua.jpeg`.
- **Instrução da tela Libras:** "Toque no ícone do VLibras e depois em Picanha…" ficou desatualizada. Na tela Libras, o botão de sinal é escondido e o intérprete já fica aberto.
- **Cabeçalho:** o README diz que "O cabeçalho de todas as telas leva ao Carrinho e às Fichas salvas". No código, "Fichas salvas" (e o botão de tema) só aparece no cabeçalho da Início; as outras telas têm só o carrinho.
- **Árvore do projeto no README:** não inclui `docs/referencia/`, `assets/icones/carnes/`, `metro.config.js`, `declarations.d.ts` nem `eslint.config.js`.
- **Galeria do README:** "Moída" lista Coxão mole e Patinho (a categoria `moida`), mas as carnes oferecidas na moída são as 6 de moagem (Acém, Paleta, Músculo, Peito bovino, Patinho e Coxão duro). Coxão mole não é de moagem.
- **Status "Temas escuro e claro: Pronto":** não cita a mudança para o tema "Brasa" (commit `376e6f7`), embora a informação não esteja errada.
- **`docs/relatorio-testes.md` está desatualizado:**
  - cores antigas do tema escuro (ex.: `vermelho #ff5a52`);
  - carrinho em `localStorage`;
  - "Total geral" sempre em kg, o que já foi corrigido;
  - 327 casos.

### 12.4 Inconsistências dentro do código

- **Peito bovino:** a descrição é "Boa opção magra para preparos saudáveis.", mas a nota `magra` é 1, a menor. Ele é a carne "saborosa" dos blends.
- **Cartão de notas do Detalhe:** mostra Economia, Maciez e Sabor, mas não mostra Magra (Leve), que é uma das 4 prioridades.
- **Ids das carnes não são seguidos:** 1, 2, 4, 6, 7, 8, 9, 10, 12, 14, 16, 17, 18. Faltam 3, 5, 11, 13 e 15. Motivo não encontrado; talvez sejam carnes removidas.
- **`app.json` com `"userInterfaceStyle": "automatic"`,** mas o app sempre abre no escuro e não segue o aparelho.
- **Medidas da tela Libras:** `TelaLibras.tsx` desconta "cabeçalho (68)" e "barra inferior (62)", e o comentário de `MARGEM_CELULAR` cita `components/Tela.tsx`. Os valores não foram conferidos contra o layout real.
- **Texto da ficha no Detalhe:** em `TelaDetalhe.tsx` há espaços sobrando dentro do texto (`Corte: {c.nome}                {'\n'}`), que podem aparecer na tela.

### 12.5 Funções sem teste automatizado

O teste cobre `top3`, os pesos, a ficha, os blends, `normalizarItem` e `carnesParaMoer`. Ficam sem teste direto:

- **Regras:** `dataDeHoje`, `detalheDoItem` (texto do carrinho), `carnesFixas` (reserva), `faixaDasPessoas` (só indireta, via `normalizarItem` sem faixa), `pontuar` (só indireta, via `top3`), `formatarPeso` e `textoDaFaixa` (só indiretas, via `fichaParaTela`).
- **Dados de apoio:** `nomeCategoria`, `iconeCategoria` e `fotoDaCarne`.
- **Banco** (`data/banco.ts`): `lerCarrinho`, `salvarCarrinho`, `listarFichas`, `salvarFicha` e `excluirFicha`. Só há o roteiro manual de `docs/fichas-salvas.md`.
- **Contexto e telas:** `AppContexto`, todas as telas, `semAcento` e `colunasDaGrade` (Catálogo), `resumoDaFicha` (Fichas salvas), as animações e o VLibras. Não há testes de interface.
