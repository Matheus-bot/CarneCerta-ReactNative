// Lógica da escolha de carne: funções puras, sem interface, para testar separadamente
import { Carne } from './carnes';

export type Espessura = 'fino' | 'medio' | 'grosso';
export type TipoBife = 'chapa' | 'fino' | 'milanesa';
export type Blend = 'saborosaMagra' | 'duasSaborosas' | 'duasMagras';
export type Prioridade = 'economia' | 'maciez' | 'sabor' | 'magra';
export type Dieta = 'emagrecer' | 'ganharMassa' | 'manterPeso';
export type PreparoFitness = 'moida' | 'cubos' | 'bife';
export type TamanhoCorte = 'pequeno' | 'medio' | 'grande';

// Pessoas (ou marmitas, no Fitness): contador de 1 a 99, usado direto no cálculo
export const QUANTIDADE_MINIMA = 1;
export const QUANTIDADE_MAXIMA = 99;

export const ESPESSURAS: { id: Espessura; nome: string }[] = [
  { id: 'fino', nome: 'Fino' },
  { id: 'medio', nome: 'Médio' },
  { id: 'grosso', nome: 'Grosso' },
];

export const TIPOS_BIFE: { id: TipoBife; nome: string }[] = [
  { id: 'chapa', nome: 'Bife de chapa' },
  { id: 'fino', nome: 'Bife fino' },
  { id: 'milanesa', nome: 'Bife à milanesa' },
];

// Pares de carnes de cada blend (ids de data/carnes.ts)
export const BLENDS: { id: Blend; nome: string; carnes: [number, number] }[] = [
  { id: 'saborosaMagra', nome: 'Saborosa + magra', carnes: [18, 10] }, // Peito + Patinho
  { id: 'duasSaborosas', nome: 'Duas saborosas', carnes: [18, 8] }, // Peito + Músculo
  { id: 'duasMagras', nome: 'Duas magras', carnes: [10, 17] }, // Patinho + Coxão duro
];

// Fitness: a dieta só aparece na ficha, não muda as gramas
export const DIETAS: { id: Dieta; nome: string }[] = [
  { id: 'emagrecer', nome: 'Emagrecer' },
  { id: 'ganharMassa', nome: 'Ganhar massa' },
  { id: 'manterPeso', nome: 'Manter peso' },
];

// Fitness: gramas por marmita de cada preparo e a pergunta seguinte:
// cubos perguntam o tamanho do corte; a moída pergunta se mói 1 ou 2 vezes; o bife não pergunta nada
export const PREPAROS_FITNESS: {
  id: PreparoFitness;
  nome: string;
  gramas: number;
  pergunta?: 'tamanhoCorte' | 'vezesMoer';
}[] = [
  { id: 'moida', nome: 'Carne moída na panela', gramas: 150, pergunta: 'vezesMoer' },
  { id: 'cubos', nome: 'Carne em cubos na panela', gramas: 150, pergunta: 'tamanhoCorte' },
  { id: 'bife', nome: 'Bife na frigideira', gramas: 150 },
];

// Tamanho do corte nas carnes de panela: não muda as gramas, só aparece na ficha
export const TAMANHOS_CORTE: { id: TamanhoCorte; nome: string }[] = [
  { id: 'pequeno', nome: 'Pequeno' },
  { id: 'medio', nome: 'Médio' },
  { id: 'grande', nome: 'Grande' },
];

export const PRIORIDADES: { id: Prioridade; nome: string }[] = [
  { id: 'economia', nome: 'Economia' },
  { id: 'maciez', nome: 'Derrete na boca' },
  { id: 'sabor', nome: 'Explosão de sabor' },
  { id: 'magra', nome: 'Leve' },
];

// Respostas do fluxo de perguntas
export type Escolha = {
  pessoas: number; // de 1 a 99, usado direto no cálculo. No Fitness, o número de marmitas
  preparo: string; // id da categoria
  espessura?: Espessura; // churrasco
  tipoBife?: TipoBife; // bifes
  hamburguer?: boolean; // moída
  blend?: Blend; // moída para hambúrguer
  vezesMoer?: 1 | 2; // moída sem hambúrguer
  prioridade?: Prioridade;
  economizar?: boolean;
  dieta?: Dieta; // fitness
  preparoFitness?: PreparoFitness; // fitness
  tamanhoCorte?: TamanhoCorte; // panela e fitness de panela
};

// Item do carrinho: só as escolhas. O peso não é gravado: é recalculado com as regras atuais (pesoDoItem)
export type ItemCarrinho = {
  id: number;
  carnes: number[]; // uma carne, ou as duas do hambúrguer
  preparo: string;
  pessoas: number; // pessoas usadas no cálculo; no Fitness, as marmitas
  espessura?: Espessura;
  tipoBife?: TipoBife;
  hamburguer?: boolean;
  blend?: Blend;
  vezesMoer?: 1 | 2;
  dieta?: Dieta;
  preparoFitness?: PreparoFitness;
  tamanhoCorte?: TamanhoCorte;
};

// Linha da ficha: corte(s), preparo, coluna "Detalhes" e peso somado em gramas
export type LinhaFicha = {
  carnes: number[];
  preparo: string;
  detalhe: string;
  peso: number;
};

// Gramas por pessoa de cada preparo
export function gramasPorPessoa(preparo: string) {
  if (preparo === 'churrasco') return 350;
  if (preparo === 'moida') return 250;
  return 150;
}

// Fitness: gramas por marmita do preparo escolhido
export function gramasPorMarmita(preparoFitness?: PreparoFitness) {
  return PREPAROS_FITNESS.find((p) => p.id === preparoFitness)?.gramas ?? gramasPorPessoa('fitness');
}

export const ehFitness = (item: { preparo: string }) => item.preparo === 'fitness';

const perguntaFitness = (item: { preparo: string; preparoFitness?: PreparoFitness }) =>
  ehFitness(item) ? PREPAROS_FITNESS.find((p) => p.id === item.preparoFitness)?.pergunta : undefined;

// Tamanho do corte: só em Panela e na carne em cubos do Fitness
export function temTamanhoCorte(item: { preparo: string; preparoFitness?: PreparoFitness }) {
  return item.preparo === 'panela' || perguntaFitness(item) === 'tamanhoCorte';
}

// Moer 1 ou 2 vezes: na moída sem hambúrguer e na carne moída do Fitness
export function temVezesMoer(item: { preparo: string; preparoFitness?: PreparoFitness }) {
  return item.preparo === 'moida' || perguntaFitness(item) === 'vezesMoer';
}

// Carnes magras recomendadas no Fitness: nota 3 em "magra"
export const ehMagra = (c: Carne) => c.magra === 3;

const paraCima100 = (gramas: number) => Math.ceil(gramas / 100) * 100;

// Total = pessoas × gramas, arredondado para cima em múltiplos de 100 g.
// Fitness: marmitas × gramas por marmita do preparo, com o mesmo arredondamento
export function pesoTotal(item: Pick<ItemCarrinho, 'preparo' | 'pessoas' | 'preparoFitness'>) {
  const gramas = ehFitness(item) ? gramasPorMarmita(item.preparoFitness) : gramasPorPessoa(item.preparo);
  return paraCima100(item.pessoas * gramas);
}

// Blend: cada carne = metade de (pessoas × 250 g), arredondada para cima em múltiplos de 100 g
// 1 pessoa → 250 g → 125 g → 200 g cada; 3 pessoas → 750 g → 375 g → 400 g cada
export function pesoPorCarneDoBlend(pessoas: number) {
  return paraCima100((pessoas * gramasPorPessoa('moida')) / 2);
}

// Acima de 10 pessoas (ou marmitas) o total aparece em kg: 5300 → "5,3 kg"
export function formatarPeso(gramas: number, emKg: boolean) {
  if (!emKg) return `${gramas} g`;
  return `${(gramas / 1000).toFixed(1).replace('.', ',')} kg`;
}

// Prioridade × 2, + economia se quer economizar, + 1 se a carne é do preparo
export function pontuar(c: Carne, preparo: string, prioridade: Prioridade, economizar: boolean) {
  return c[prioridade] * 2 + (economizar ? c.economia : 0) + (c.cat.includes(preparo) ? 1 : 0);
}

// Maior pontuação primeiro; desempate pela maior nota de sabor
function ordenar(lista: Carne[], preparo: string, prioridade: Prioridade, economizar: boolean) {
  return [...lista].sort(
    (a, b) =>
      pontuar(b, preparo, prioridade, economizar) - pontuar(a, preparo, prioridade, economizar) ||
      b.sabor - a.sabor,
  );
}

// Blends ordenados pela prioridade: soma das notas da prioridade das duas carnes × 2
// (+ soma das notas de economia na prioridade Economia); desempate pela soma do sabor.
// Sem o +1 da categoria: todo blend é de moída
export function ordenarBlends(carnes: Carne[], prioridade: Prioridade) {
  const soma = (ids: number[], nota: (c: Carne) => number) =>
    ids.reduce((t, id) => t + nota(carnes.find((c) => c.id === id)!), 0);
  const pontos = (ids: number[]) =>
    soma(ids, (c) => c[prioridade]) * 2 + (prioridade === 'economia' ? soma(ids, (c) => c.economia) : 0);
  return [...BLENDS].sort(
    (a, b) => pontos(b.carnes) - pontos(a.carnes) || soma(b.carnes, (c) => c.sabor) - soma(a.carnes, (c) => c.sabor),
  );
}

// Carnes de moagem disponíveis (para escolher a carne a moer)
export function carnesParaMoer(carnes: Carne[]) {
  return carnes.filter((c) => c.ativo && c.moagem);
}

// Usadas quando nenhuma carne combina: as 3 primeiras do preparo (moída: as 3 primeiras de moagem)
export function carnesFixas(carnes: Carne[], preparo: string) {
  const ativas = carnes.filter((c) => c.ativo);
  const doPreparo =
    preparo === 'moida' ? ativas.filter((c) => c.moagem) : ativas.filter((c) => c.cat.includes(preparo));
  return doPreparo.slice(0, 3);
}

export function top3(carnes: Carne[], escolha: Escolha) {
  const { preparo, economizar = false } = escolha;
  const fitness = ehFitness(escolha);
  // Fitness não pergunta a prioridade: ordena pela nota de carne magra
  const prioridade = escolha.prioridade ?? (fitness ? 'magra' : 'sabor');
  const ativas = carnes.filter((c) => c.ativo);
  let resultado: Carne[];

  if (fitness) {
    // As carnes magras (nota 3) primeiro; com menos de 3, completa com as outras
    const magras = ativas.filter(ehMagra);
    const outras = ativas.filter((c) => !ehMagra(c));
    resultado = [
      ...ordenar(magras, preparo, prioridade, economizar),
      ...ordenar(outras, preparo, prioridade, economizar),
    ].slice(0, 3);
  } else if (preparo === 'moida') {
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

// Item do carrinho a partir das respostas e da(s) carne(s) escolhida(s): guarda só as escolhas
export function criarItem(escolha: Escolha, carnes: number[], id: number): ItemCarrinho {
  const fitness = ehFitness(escolha);
  return {
    id,
    carnes,
    preparo: escolha.preparo,
    pessoas: escolha.pessoas,
    espessura: escolha.espessura,
    tipoBife: escolha.tipoBife,
    hamburguer: escolha.hamburguer,
    blend: escolha.blend,
    vezesMoer: temVezesMoer(escolha) ? escolha.vezesMoer : undefined,
    dieta: fitness ? escolha.dieta : undefined,
    preparoFitness: fitness ? escolha.preparoFitness : undefined,
    tamanhoCorte: temTamanhoCorte(escolha) ? escolha.tamanhoCorte : undefined,
  };
}

// Item lido do carrinho ou de uma ficha salva: fica só com as escolhas.
// Ficha antiga com peso e emKg gravados: esses valores são ignorados e o peso é recalculado.
// Ficha antiga com a faixa de pessoas gravada: a faixa é ignorada (vale o número de pessoas)
export function normalizarItem(
  gravado: ItemCarrinho & { faixa?: string; peso?: number; emKg?: boolean },
): ItemCarrinho {
  const { id, carnes, preparo, pessoas, espessura, tipoBife, hamburguer, blend, vezesMoer } = gravado;
  const { dieta, preparoFitness, tamanhoCorte } = gravado;
  return {
    id,
    carnes,
    preparo,
    pessoas,
    espessura,
    tipoBife,
    hamburguer,
    blend,
    vezesMoer,
    dieta,
    preparoFitness,
    tamanhoCorte,
  };
}

// Peso total do item em gramas, com as regras atuais.
// Hambúrguer (blend): duas carnes, cada uma com metade do total arredondada para cima de 100 g
export function pesoDoItem(item: Pick<ItemCarrinho, 'preparo' | 'pessoas' | 'blend' | 'preparoFitness'>) {
  return item.blend ? 2 * pesoPorCarneDoBlend(item.pessoas) : pesoTotal(item);
}

const textoMarmitas = (n: number) => `${n} ${n === 1 ? 'marmita' : 'marmitas'}`;
const textoPessoas = (n: number) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;

// Fitness: preparo, dieta, marmitas e, na moída, a moagem; panela e cubos do Fitness: o tamanho do corte
function partesFitnessEPanela(item: Omit<ItemCarrinho, 'id'>) {
  const partes: string[] = [];
  if (ehFitness(item)) {
    const preparo = PREPAROS_FITNESS.find((p) => p.id === item.preparoFitness)?.nome;
    const dieta = DIETAS.find((d) => d.id === item.dieta)?.nome;
    if (preparo) partes.push(preparo);
    if (dieta) partes.push(dieta);
    partes.push(textoMarmitas(item.pessoas));
    if (item.vezesMoer) partes.push(`Moagem ${item.vezesMoer}x`);
  }
  const corte = TAMANHOS_CORTE.find((t) => t.id === item.tamanhoCorte)?.nome;
  if (corte) partes.push(`Corte ${corte.toLowerCase()}`);
  return partes;
}

// Espessura; nos bifes, o tipo no lugar da espessura; na moída, o blend ou a moagem;
// no Fitness e na panela, preparo, dieta, marmitas e tamanho do corte
export function detalheDoItem(item: Omit<ItemCarrinho, 'id'>) {
  if (ehFitness(item)) return partesFitnessEPanela(item).join(' · ');
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '';
  if (item.espessura) return 'Espessura: ' + ESPESSURAS.find((e) => e.id === item.espessura)?.nome;
  if (item.blend) return 'Blend: ' + BLENDS.find((b) => b.id === item.blend)?.nome;
  if (item.vezesMoer) return `Moagem: ${item.vezesMoer} ${item.vezesMoer === 1 ? 'vez' : 'vezes'}`;
  return partesFitnessEPanela(item).join(' · ');
}

// Coluna "Detalhes" da ficha: espessura no churrasco, tipo nos bifes;
// na moída, Blend, Hambúrguer ou Moagem 1x/2x; no Fitness, preparo, dieta e marmitas;
// na panela e no fitness de panela, o tamanho do corte; nos outros preparos, "—"
export function detalheDaFicha(item: Omit<ItemCarrinho, 'id'>) {
  const fitnessEPanela = partesFitnessEPanela(item);
  if (fitnessEPanela.length) return fitnessEPanela.join(' · ');
  if (item.espessura) return ESPESSURAS.find((e) => e.id === item.espessura)?.nome ?? '—';
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '—';
  if (item.blend) return 'Hambúrguer · ' + BLENDS.find((b) => b.id === item.blend)?.nome;
  if (item.hamburguer) return 'Hambúrguer';
  if (item.vezesMoer) return `Moagem ${item.vezesMoer}x`;
  return '—';
}

// Peso da ficha: arredondado para cima em múltiplos de 100 g, na unidade da ficha inteira
export function pesoDaFicha(gramas: number, emKg: boolean) {
  return formatarPeso(Math.ceil(gramas / 100) * 100, emKg);
}

// Ficha: soma o peso dos itens com o mesmo corte, o mesmo preparo e os mesmos detalhes;
// preparo diferente fica em outra linha, mesmo com o mesmo corte.
// Hambúrguer: uma linha para cada uma das duas carnes, com o peso de cada uma
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

export function pessoasDaFicha(itens: ItemCarrinho[]) {
  return Math.max(0, ...itens.map((i) => i.pessoas));
}

// Unidade da ficha inteira (e do carrinho): kg acima de 10 pessoas (ou marmitas), g até 10
export function fichaEmKg(itens: ItemCarrinho[]) {
  return pessoasDaFicha(itens) > 10;
}

// Subtítulo da ficha: o maior número de pessoas e, se houver Fitness, o maior número de marmitas
// ("4 pessoas", "12 marmitas" ou "4 pessoas · 12 marmitas")
export function subtituloDaFicha(itens: ItemCarrinho[]) {
  const maior = (lista: ItemCarrinho[]) => Math.max(0, ...lista.map((i) => i.pessoas));
  const pessoas = maior(itens.filter((i) => !ehFitness(i)));
  const marmitas = maior(itens.filter(ehFitness));
  return [pessoas ? textoPessoas(pessoas) : '', marmitas ? textoMarmitas(marmitas) : '']
    .filter(Boolean)
    .join(' · ');
}

// Resultado do Fitness: "12 marmitas · 1,8 kg" (kg acima de 10 marmitas)
export function resumoFitness(escolha: Escolha) {
  return `${textoMarmitas(escolha.pessoas)} · ${formatarPeso(pesoTotal(escolha), escolha.pessoas > 10)}`;
}

// Tudo o que a ficha mostra, já formatado na unidade da ficha inteira.
// A tela da ficha, a lista de fichas salvas e o teste usam esta mesma função
export function fichaParaTela(itens: ItemCarrinho[]) {
  const emKg = fichaEmKg(itens);
  const linhas = montarFicha(itens).map((l) => ({ ...l, texto: pesoDaFicha(l.peso, emKg) }));
  const gramas = linhas.reduce((soma, l) => soma + l.peso, 0);
  return { linhas, emKg, gramas, total: pesoDaFicha(gramas, emKg), subtitulo: subtituloDaFicha(itens) };
}

// Data de hoje no formato 25/10/2026
export function dataDeHoje(hoje = new Date()) {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(hoje.getDate())}/${dois(hoje.getMonth() + 1)}/${hoje.getFullYear()}`;
}
