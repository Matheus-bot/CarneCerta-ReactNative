# CarneCerta

![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)

Escolha o corte certo e leve a quantidade certa ao açougue.

O CarneCerta é um app acadêmico que ajuda a escolher o corte de carne pelo método de preparo. A pessoa responde poucas perguntas, recebe um Top 3 de cortes e monta uma ficha de compra para mostrar ao açougueiro.

## Sumário

1. [Visão geral](#visão-geral)
2. [Fluxo do usuário](#fluxo-do-usuário)
3. [Lógica de escolha](#lógica-de-escolha)
4. [Árvore do projeto](#árvore-do-projeto)
5. [Galeria de carnes](#galeria-de-carnes)
6. [Instalação e execução](#instalação-e-execução)
7. [Estrutura de dados](#estrutura-de-dados)
8. [Testes](#testes)
9. [Acessibilidade](#acessibilidade)

## Visão geral

| Item | Descrição | Tecnologia |
| --- | --- | --- |
| Plataforma | Android, iOS e web, com o mesmo código | Expo SDK 58, React Native 0.88, React Native Web |
| Linguagem | Código tipado em todas as telas e regras | TypeScript 6.0 |
| Navegação | Pilha de telas, sem cabeçalho nativo | React Navigation (native-stack) |
| Banco local | Guarda o carrinho e as fichas salvas no aparelho | expo-sqlite |
| Acessibilidade | Tradução de textos para Libras | VLibras (widget oficial), react-native-webview |
| Testes | Script que confere as regras de escolha e de quantidade | `data/testeEscolha.ts`, rodado com `tsc` e `node` |

## Fluxo do usuário

```mermaid
flowchart TD
    A[Splash] --> B[Início]
    B -->|Escolher carne| C[Escolhas]
    B -->|Card de categoria| C
    C --> C1[Quantas pessoas?]
    C1 --> C2[Qual o preparo?<br/>só quando não veio do card]
    C2 --> C3[O que é mais importante?<br/>prioridade]
    C3 --> C4[Detalhe do preparo<br/>espessura, tipo de bife ou moída]
    C4 -->|Moída| E[Carrinho]
    C4 -->|Outros preparos| D[Top 3 - pódio]
    D -->|Escolher esta carne| D
    D -->|Ver ficha de compra| F[Ficha]
    E -->|Finalizar| F
    F -->|Salvar ficha| G[Fichas salvas]
    G -->|Abrir ficha| F
    B --> H[Catálogo]
    H --> I[Detalhe da carne]
    B --> J[Libras]
```

O cabeçalho de todas as telas leva ao Carrinho e às Fichas salvas. O menu de baixo leva ao Início, ao Catálogo e à tela de Libras.

## Lógica de escolha

Regras de `data/escolha.ts`.

| Regra | Como funciona |
| --- | --- |
| Prioridade | Uma só: Economia, Derrete na boca (maciez), Explosão de sabor (sabor) ou Leve (magra). |
| Pontuação | Nota da prioridade × 2, mais a nota de economia quando a prioridade é Economia, mais 1 se a carne é do preparo. Empate: vence a maior nota de sabor. |
| Top 3 | As 3 carnes de maior pontuação do preparo. Com menos de 3, completa com as outras, pela mesma pontuação. |
| Quantidade por pessoa | Churrasco 350 g. Moída 250 g. Bifes, Panela, Desfiar e Fitness 150 g. |
| Faixas de pessoas | 1 a 3 usa 1. 4 a 6 usa 4. 7 a 10 usa 7. Mais de 10 usa o número digitado, mínimo 11. |
| Total | Pessoas usadas × gramas por pessoa. |
| Arredondamento | Sempre para cima, em múltiplos de 100 g. |
| Unidade | Gramas até 10 pessoas, kg acima disso. Decidida pela ficha inteira, não por linha. |
| Churrasco | Pergunta a espessura: Fino, Médio ou Grosso. |
| Bifes | Pergunta o tipo: Bife de chapa, Bife fino ou Bife à milanesa. |
| Hambúrguer | Sempre duas carnes, pelo blend: Saborosa + magra (Peito bovino + Patinho), Duas saborosas (Peito bovino + Músculo) ou Duas magras (Patinho + Coxão duro). Cada carne leva metade do total, arredondada para cima de 100 g. |
| Moída sem hambúrguer | Uma carne só, escolhida entre as de moagem, moída 1 ou 2 vezes. Total arredondado para cima de 100 g. |
| Pódio (Top 3) | Mostra a foto de cada carne definida em `data/imagensCategorias.ts`. |
| Peso salvo | O carrinho e as fichas guardam só as escolhas. O peso é recalculado ao abrir. |

Exemplos:

| Pedido | Conta | Ficha |
| --- | --- | --- |
| 2 pessoas, churrasco | 1 × 350 = 350 | 400 g |
| 8 pessoas, churrasco | 7 × 350 = 2450 | 2500 g |
| 12 pessoas, churrasco | 12 × 350 = 4200 | 4,2 kg |
| 15 pessoas, hambúrguer | 15 × 250 = 3750, metade 1875 | 1,9 kg + 1,9 kg = 3,8 kg |

## Árvore do projeto

```text
carnecerta/
├── App.tsx                  # navegação e provedores
├── package.json
├── README.md
├── screens/
│   ├── TelaSplash.tsx
│   ├── TelaInicial.tsx
│   ├── TelaEscolhas.tsx     # perguntas
│   ├── TelaRecomendacao.tsx # Top 3 (pódio)
│   ├── TelaCarrinho.tsx
│   ├── TelaFicha.tsx        # ficha atual e ficha salva
│   ├── TelaFichasSalvas.tsx
│   ├── TelaCatalogo.tsx
│   ├── TelaDetalhe.tsx
│   ├── TelaLibras.tsx
│   └── rotas.ts
├── components/
│   ├── Tela.tsx             # cabeçalho, menu e rodapé
│   ├── VLibrasWidget.tsx
│   ├── tema.ts              # temas escuro e claro
│   └── ui.tsx
├── contexto/
│   └── AppContexto.tsx      # carrinho e tema
├── data/
│   ├── banco.ts             # expo-sqlite
│   ├── carnes.ts
│   ├── categorias.ts
│   ├── escolha.ts           # regras de escolha e quantidade
│   ├── imagensCategorias.ts # fotos das categorias e das carnes
│   └── testeEscolha.ts
├── assets/
│   ├── categorias/
│   └── imagens/
└── docs/
    ├── diagnostico-gramas.md
    ├── fichas-salvas.md
    └── relatorio-testes.md
```

## Galeria de carnes

Fotos usadas no catálogo, no pódio e no detalhe. As carnes seguem `data/carnes.ts`.

| ![Carne](https://img.shields.io/badge/Carne-FF7A1A?style=for-the-badge&labelColor=FF7A1A) | ![Cru inteiro](https://img.shields.io/badge/Cru%20inteiro-FF7A1A?style=for-the-badge&labelColor=FF7A1A) | ![Cru cortado](https://img.shields.io/badge/Cru%20cortado-FF7A1A?style=for-the-badge&labelColor=FF7A1A) | ![Cozido](https://img.shields.io/badge/Cozido-FF7A1A?style=for-the-badge&labelColor=FF7A1A) |
| :-- | :-: | :-: | :-: |
| ![Picanha](https://img.shields.io/badge/Picanha-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/picanha/picanhainteiracrua.jpeg" width="72" alt="Picanha cru inteiro"> | <img src="assets/imagens/imagenscarnes/picanha/picanhacortadacrua.jpeg" width="72" alt="Picanha cru cortado"> | <img src="assets/imagens/imagenscarnes/picanha/picanhaassada.jpeg" width="72" alt="Picanha cozido"> |
| ![Alcatra](https://img.shields.io/badge/Alcatra-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/alcatra/mioloalcatrainteirocru.jpeg" width="72" alt="Alcatra cru inteiro"> | <img src="assets/imagens/imagenscarnes/alcatra/mioloalcatracortadocru.jpg" width="72" alt="Alcatra cru cortado"> | <img src="assets/imagens/imagenscarnes/alcatra/Roasted_beef_steaks_on_concrete_202606271858.jpeg" width="72" alt="Alcatra cozido"> |
| ![Contra filé](https://img.shields.io/badge/Contra%20fil%C3%A9-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/contrafileTradicional/contrafiletradicionalinteiro.png" width="72" alt="Contra filé cru inteiro"> | <img src="assets/imagens/imagenscarnes/contrafileTradicional/contrafilecrucortado.jpg" width="72" alt="Contra filé cru cortado"> | *em breve* |
| ![Fraldinha](https://img.shields.io/badge/Fraldinha-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/fraldinha/fraldinhainteiracrua03.jpg" width="72" alt="Fraldinha cru inteiro"> | <img src="assets/imagens/imagenscarnes/fraldinha/fraldinhacortadacrua.jpg" width="72" alt="Fraldinha cru cortado"> | <img src="assets/imagens/imagenscarnes/fraldinha/fraldinhaassada.jpg" width="72" alt="Fraldinha cozido"> |
| ![Filé mignon](https://img.shields.io/badge/Fil%C3%A9%20mignon-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/filemignon/filemignoncruinteiro.jpeg" width="72" alt="Filé mignon cru inteiro"> | <img src="assets/imagens/imagenscarnes/filemignon/filemignonmedalhaocru.jpeg" width="72" alt="Filé mignon cru cortado"> | <img src="assets/imagens/imagenscarnes/filemignon/filemignonpronto.jpeg" width="72" alt="Filé mignon cozido"> |
| ![Coxão mole](https://img.shields.io/badge/Cox%C3%A3o%20mole-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/coxaomole/coxaomoleinteiro.png" width="72" alt="Coxão mole cru inteiro"> | <img src="assets/imagens/imagenscarnes/coxaomole/coxao-molecortado.png" width="72" alt="Coxão mole cru cortado"> | <img src="assets/imagens/imagenscarnes/coxaomole/coxaomolefrito.jpg" width="72" alt="Coxão mole cozido"> |
| ![Acém](https://img.shields.io/badge/Ac%C3%A9m-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/acem/aceminteirocru.jpeg" width="72" alt="Acém cru inteiro"> | <img src="assets/imagens/imagenscarnes/acem/acememcuboscru.jpeg" width="72" alt="Acém cru cortado"> | <img src="assets/imagens/imagenscarnes/acem/acemcozido.jpeg" width="72" alt="Acém cozido"> |
| ![Paleta](https://img.shields.io/badge/Paleta-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/paleta/Paletabovinainteiracrua.jpeg" width="72" alt="Paleta cru inteiro"> | <img src="assets/imagens/imagenscarnes/paleta/Paletabovinaemcubos.jpeg" width="72" alt="Paleta cru cortado"> | <img src="assets/imagens/imagenscarnes/paleta/baletabovinacozida.jpeg" width="72" alt="Paleta cozido"> |
| ![Músculo](https://img.shields.io/badge/M%C3%BAsculo-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/musculo/musculointeiro.png" width="72" alt="Músculo cru inteiro"> | <img src="assets/imagens/imagenscarnes/musculo/musculoemcubos.png" width="72" alt="Músculo cru cortado"> | <img src="assets/imagens/imagenscarnes/musculo/musculocozido.png" width="72" alt="Músculo cozido"> |
| ![Peito bovino](https://img.shields.io/badge/Peito%20bovino-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/pontadepeito/peitobovino.webp" width="72" alt="Peito bovino cru inteiro"> | *em breve* | <img src="assets/imagens/imagenscarnes/pontadepeito/pontadepeitoassada.jpg" width="72" alt="Peito bovino cozido"> |
| ![Patinho](https://img.shields.io/badge/Patinho-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/patinho/patinhointeirocru.jpg" width="72" alt="Patinho cru inteiro"> | *em breve* | <img src="assets/imagens/imagenscarnes/patinho/patinhocozido.jpg" width="72" alt="Patinho cozido"> |
| ![Coxão duro](https://img.shields.io/badge/Cox%C3%A3o%20duro-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | *em breve* | <img src="assets/imagens/imagenscarnes/patinho/coxaodurocortes.png" width="72" alt="Coxão duro cru cortado"> | *em breve* |
| ![Lagarto](https://img.shields.io/badge/Lagarto-7A1F2B?style=for-the-badge&labelColor=7A1F2B) | <img src="assets/imagens/imagenscarnes/lagarto/lagartointeirocru.jpg" width="72" alt="Lagarto cru inteiro"> | *em breve* | <img src="assets/imagens/imagenscarnes/lagarto/lagartocozinhado.webp" width="72" alt="Lagarto cozido"> |

## Instalação e execução

Requisitos: Node.js e npm. Para o celular, o app Expo Go.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor do Expo, limpando o cache:

   ```bash
   npx expo start -c
   ```

3. Abra o app:
   - No navegador: tecle `w` no terminal do Expo.
   - No celular: abra o Expo Go e leia o QR code do terminal.

Scripts do `package.json`:

| Comando | O que faz |
| --- | --- |
| `npm start` | `expo start` |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` |
| `npm run lint` | `expo lint` |

## Estrutura de dados

Banco `carnecerta.db`, em `data/banco.ts`.

| Tabela | Colunas | Para que serve |
| --- | --- | --- |
| `kv` | `chave` (texto, chave primária), `valor` (texto) | Guarda o carrinho atual na chave `carrinho`, em JSON. |
| `fichas` | `id` (inteiro, automático), `criada_em` (data ISO), `dados` (JSON) | Guarda cada ficha salva, da mais recente para a mais antiga. |

Os itens guardam só as escolhas: carnes, preparo, faixa, pessoas, espessura, tipo de bife, hambúrguer, blend e moagem. O peso é recalculado com as regras atuais ao abrir. Se o banco não abrir em 5 segundos (por exemplo, na web), o app segue sem salvar.

## Testes

`data/testeEscolha.ts` confere as regras do app contra regras escritas à mão no próprio teste. Nenhuma tela importa esse arquivo.

Para rodar (troque `<pasta>` por uma pasta de saída fora do projeto):

```bash
npx tsc data/testeEscolha.ts --ignoreConfig --outDir <pasta> --module commonjs --target es2020 --skipLibCheck
node <pasta>/testeEscolha.js
```

| Grupo | O que confere |
| --- | --- |
| Tabela de carnes | As 13 carnes, notas, categorias e carnes de moagem. |
| Combinações do fluxo | Todas as faixas (1, 4, 7, 11 e 25 pessoas), preparos e prioridades, com Fino, Médio e Grosso no churrasco e os 3 tipos de bife. Confere o Top 3, a ordem, o peso e a unidade. |
| Moída | Os 3 blends de hambúrguer, com duas linhas na ficha e o peso de cada carne, e todas as carnes de moagem, moídas 1 e 2 vezes. |
| Ficha | Soma de itens iguais, linhas separadas por preparo e total geral. |
| Ordem dos blends | Ordem por prioridade. |
| Casos de conferência | Os 10 casos de `docs/diagnostico-gramas.md`: linhas, total e subtítulo. |
| Unidade e fichas antigas | Unidade decidida pela ficha inteira. Ficha salva antiga recalculada ao abrir. |

Resultados:

| Fonte | Data | Resultado |
| --- | --- | --- |
| `docs/relatorio-testes.md` | 06/11/2026 | 327 casos: 327 passaram, 0 falharam. Checagem de tipos sem erros. Build web sem erros. |
| `docs/diagnostico-gramas.md` (após a correção das gramas) | 09/11/2026 | 340 casos: 340 passaram, 0 falharam. |

Checagem de tipos e lint:

```bash
npx tsc --noEmit
npx expo lint
```

## Acessibilidade

| Tela | Onde | O que o avatar fala |
| --- | --- | --- |
| `TelaLibras.tsx` | Card da Picanha, com o widget do VLibras visível | "Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa." |
| `TelaLibras.tsx` | Card do Acém, com o widget sobre o card inteiro | "Acém. É um corte bovino da parte do pescoço. É ideal para cozidos e ensopados. Fica macio quando cozinhado devagar, na panela." |
| `TelaDetalhe.tsx` | Detalhe aberto a partir da tela de Libras | Mostra o vídeo em Libras da carne, se cadastrado. Hoje todas as carnes mostram "Vídeo em Libras ainda não cadastrado". |

O widget usa o script oficial do VLibras (`vlibras.gov.br`). Os botões do pódio têm rótulo de acessibilidade, por exemplo "Escolher Picanha".
