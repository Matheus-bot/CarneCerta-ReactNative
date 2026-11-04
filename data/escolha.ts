// Lógica da escolha de carne: funções puras, sem interface, para testar separadamente
import { Carne } from './carnes';

export type Faixa = 'ate3' | 'ate6' | 'ate10' | 'mais10';
export type Espessura = 'fino' | 'medio' | 'grosso';
export type TipoBife = 'chapa' | 'fino' | 'milanesa';
export type Blend = 'saborosaMagra' | 'duasSaborosas' | 'duasMagras';
export type Prioridade = 'economia' | 'maciez' | 'sabor' | 'magra';

// Pessoas usadas no cálculo: o limite de baixo de cada faixa;
// em "mais de 10" a pessoa digita o número exato (mínimo 11)
export const MINIMO_MAIS10 = 11;

export const FAIXAS: { id: Faixa; nome: string; pessoas: number }[] = [
  { id: 'ate3', nome: '1 a 3', pessoas: 1 },
  { id: 'ate6', nome: '4 a 6', pessoas: 4 },
  { id: 'ate10', nome: '7 a 10', pessoas: 7 },
  { id: 'mais10', nome: 'Mais de 10', pessoas: MINIMO_MAIS10 },
];

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

export const PRIORIDADES: { id: Prioridade; nome: string }[] = [
  { id: 'economia', nome: 'Economia' },
  { id: 'maciez', nome: 'Derrete na boca' },
  { id: 'sabor', nome: 'Explosão de sabor' },
  { id: 'magra', nome: 'Leve' },
];

// Respostas do fluxo de perguntas
export type Escolha = {
  faixa: Faixa;
  pessoas?: number; // número digitado em "mais de 10"
  preparo: string; // id da categoria
  espessura?: Espessura; // churrasco
  tipoBife?: TipoBife; // bifes
  hamburguer?: boolean; // moída
  blend?: Blend; // moída para hambúrguer
  vezesMoer?: 1 | 2; // moída sem hambúrguer
  prioridade?: Prioridade;
  economizar?: boolean;
};

export type ItemCarrinho = {
  id: number;
  carnes: number[]; // uma carne, ou duas no blend
  preparo: string;
  peso: number; // gramas
  emKg: boolean;
  pessoas: number; // pessoas usadas no cálculo
  espessura?: Espessura;
  tipoBife?: TipoBife;
  hamburguer?: boolean;
  blend?: Blend;
  vezesMoer?: 1 | 2;
};

// Linha da ficha: corte(s), preparo, coluna "Espessura ou tipo" e peso somado
// (emKg: algum dos itens somados é de mais de 10 pessoas)
export type LinhaFicha = {
  carnes: number[];
  preparo: string;
  detalhe: string;
  peso: number;
  emKg: boolean;
};

// Gramas por pessoa de cada preparo
export function gramasPorPessoa(preparo: string) {
  if (preparo === 'churrasco') return 350;
  if (preparo === 'moida') return 250;
  return 150;
}

// Pessoas do cálculo: o número digitado em "mais de 10"; nas outras faixas, o limite de baixo
export function pessoasDaEscolha(escolha: Pick<Escolha, 'faixa' | 'pessoas'>) {
  if (escolha.faixa === 'mais10') return escolha.pessoas ?? MINIMO_MAIS10;
  return FAIXAS.find((f) => f.id === escolha.faixa)?.pessoas ?? 0;
}

const paraCima100 = (gramas: number) => Math.ceil(gramas / 100) * 100;

// Total = pessoas × gramas, arredondado para cima em múltiplos de 100 g
export function pesoTotal(preparo: string, pessoas: number) {
  return paraCima100(pessoas * gramasPorPessoa(preparo));
}

// Blend: cada carne = metade de (pessoas × 250 g), arredondada para cima em múltiplos de 100 g
// 1 pessoa → 250 g → 125 g → 200 g cada; 3 pessoas → 750 g → 375 g → 400 g cada
export function pesoPorCarneDoBlend(pessoas: number) {
  return paraCima100((pessoas * gramasPorPessoa('moida')) / 2);
}

// Acima de 10 pessoas o total aparece em kg: 5300 → "5,3 kg"
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

// Item do carrinho a partir das respostas e da(s) carne(s) escolhida(s)
export function criarItem(escolha: Escolha, carnes: number[], id: number): ItemCarrinho {
  const pessoas = pessoasDaEscolha(escolha);
  return {
    id,
    carnes,
    preparo: escolha.preparo,
    // Blend: o peso total é a soma das duas carnes
    peso: escolha.blend ? 2 * pesoPorCarneDoBlend(pessoas) : pesoTotal(escolha.preparo, pessoas),
    emKg: escolha.faixa === 'mais10',
    pessoas,
    espessura: escolha.espessura,
    tipoBife: escolha.tipoBife,
    hamburguer: escolha.hamburguer,
    blend: escolha.blend,
    vezesMoer: escolha.vezesMoer,
  };
}

// Espessura; nos bifes, o tipo no lugar da espessura; na moída, o blend ou a moagem
export function detalheDoItem(item: Omit<ItemCarrinho, 'id'>) {
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '';
  if (item.espessura) return 'Espessura: ' + ESPESSURAS.find((e) => e.id === item.espessura)?.nome;
  if (item.blend) return 'Blend: ' + BLENDS.find((b) => b.id === item.blend)?.nome;
  if (item.vezesMoer) return `Moagem: ${item.vezesMoer} ${item.vezesMoer === 1 ? 'vez' : 'vezes'}`;
  return '';
}

// Coluna "Espessura ou tipo" da ficha: espessura no churrasco, tipo nos bifes;
// na moída, Blend, Hambúrguer ou Moagem 1x/2x; nos outros preparos, "—"
export function detalheDaFicha(item: Omit<ItemCarrinho, 'id'>) {
  if (item.espessura) return ESPESSURAS.find((e) => e.id === item.espessura)?.nome ?? '—';
  if (item.tipoBife) return TIPOS_BIFE.find((t) => t.id === item.tipoBife)?.nome ?? '—';
  if (item.blend) return 'Blend';
  if (item.hamburguer) return 'Hambúrguer';
  if (item.vezesMoer) return `Moagem ${item.vezesMoer}x`;
  return '—';
}

// Peso da ficha: arredondado para cima em múltiplos de 100 g; em kg acima de 10 pessoas, como no carrinho
export function pesoDaFicha(gramas: number, emKg: boolean) {
  return formatarPeso(Math.ceil(gramas / 100) * 100, emKg);
}

// Ficha: soma o peso dos itens com o mesmo corte, o mesmo preparo e a mesma espessura ou tipo;
// preparo diferente fica em outra linha, mesmo com o mesmo corte
export function montarFicha(itens: ItemCarrinho[]): LinhaFicha[] {
  const linhas = new Map<string, LinhaFicha>();
  for (const { id, ...item } of itens) {
    const detalhe = detalheDaFicha(item);
    const chave = [item.carnes.join('+'), item.preparo, detalhe].join('|');
    const linha = linhas.get(chave);
    if (linha) {
      linha.peso += item.peso;
      linha.emKg = linha.emKg || item.emKg;
    } else {
      const { carnes, preparo, peso, emKg } = item;
      linhas.set(chave, { carnes, preparo, detalhe, peso, emKg });
    }
  }
  return [...linhas.values()];
}

// Topo da ficha: o maior número de pessoas entre os itens
export function pessoasDaFicha(itens: ItemCarrinho[]) {
  return Math.max(0, ...itens.map((i) => i.pessoas));
}

// Data de hoje no formato 25/10/2026
export function dataDeHoje(hoje = new Date()) {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(hoje.getDate())}/${dois(hoje.getMonth() + 1)}/${hoje.getFullYear()}`;
}
