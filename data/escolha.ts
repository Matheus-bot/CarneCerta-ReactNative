// Lógica da escolha de carne: funções puras, sem interface, para testar separadamente
import { Carne } from './carnes';

export type Faixa = 'ate3' | 'ate6' | 'ate10' | 'mais10';
export type Espessura = 'fino' | 'medio' | 'grosso';
export type TipoBife = 'chapa' | 'fino' | 'milanesa';
export type Blend = 'saborosaMagra' | 'duasSaborosas' | 'duasMagras';
export type Prioridade = 'economia' | 'maciez' | 'sabor' | 'magra';

// Pessoas usadas no cálculo: o maior número de cada faixa; "mais de 10" usa um valor fixo
export const FAIXAS: { id: Faixa; nome: string; pessoas: number }[] = [
  { id: 'ate3', nome: '1 a 3', pessoas: 3 },
  { id: 'ate6', nome: '4 a 6', pessoas: 6 },
  { id: 'ate10', nome: '7 a 10', pessoas: 10 },
  { id: 'mais10', nome: 'Mais de 10', pessoas: 15 },
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
  espessura?: Espessura;
  tipoBife?: TipoBife;
  blend?: Blend;
  vezesMoer?: 1 | 2;
};

export type LinhaFicha = Omit<ItemCarrinho, 'id'> & { detalhe: string };

// Gramas por pessoa de cada preparo
export function gramasPorPessoa(preparo: string) {
  if (preparo === 'churrasco') return 350;
  if (preparo === 'moida') return 250;
  return 150;
}

// Total = pessoas × gramas, arredondado para cima em múltiplos de 100 g
export function pesoTotal(preparo: string, faixa: Faixa) {
  const pessoas = FAIXAS.find((f) => f.id === faixa)?.pessoas ?? 0;
  return Math.ceil((pessoas * gramasPorPessoa(preparo)) / 100) * 100;
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

// Carnes de moagem disponíveis (para escolher a carne a moer)
export function carnesParaMoer(carnes: Carne[]) {
  return carnes.filter((c) => c.ativo && c.moagem);
}

// Usadas quando nenhuma carne combina: as 3 primeiras do preparo (moída: as 3 primeiras de moagem)
export function carnesFixas(carnes: Carne[], preparo: string) {
  const doPreparo =
    preparo === 'moida' ? carnes.filter((c) => c.moagem) : carnes.filter((c) => c.cat.includes(preparo));
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
    resultado = ordenar(ativas, preparo, prioridade, economizar).slice(0, 3);
  }

  return resultado.length ? resultado : carnesFixas(carnes, preparo);
}

// Item do carrinho a partir das respostas e da(s) carne(s) escolhida(s)
export function criarItem(escolha: Escolha, carnes: number[], id: number): ItemCarrinho {
  return {
    id,
    carnes,
    preparo: escolha.preparo,
    peso: pesoTotal(escolha.preparo, escolha.faixa),
    emKg: escolha.faixa === 'mais10',
    espessura: escolha.espessura,
    tipoBife: escolha.tipoBife,
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

// Ficha: soma o peso dos itens com o mesmo corte, o mesmo preparo e o mesmo detalhe
export function montarFicha(itens: ItemCarrinho[]): LinhaFicha[] {
  const linhas = new Map<string, LinhaFicha>();
  for (const { id, ...item } of itens) {
    const detalhe = detalheDoItem(item);
    const chave = [item.carnes.join('+'), item.preparo, detalhe].join('|');
    const linha = linhas.get(chave);
    if (linha) {
      linha.peso += item.peso;
      linha.emKg = linha.emKg || item.emKg;
    } else {
      linhas.set(chave, { ...item, detalhe });
    }
  }
  return [...linhas.values()];
}
