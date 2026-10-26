// Teste da lógica de escolha: roda todas as combinações e lista as que falharem, com o motivo.
// Não faz parte do app (nenhuma tela importa este arquivo). Para rodar:
//   npx tsc data/testeEscolha.ts --ignoreConfig --outDir <pasta> --module commonjs --target es2020 --skipLibCheck
//   node <pasta>/testeEscolha.js
import { Carne, carnes } from './carnes';
import {
  BLENDS,
  carnesParaMoer,
  criarItem,
  detalheDaFicha,
  ESPESSURAS,
  Escolha,
  formatarPeso,
  ItemCarrinho,
  montarFicha,
  pesoPorCarneDoBlend,
  PRIORIDADES,
  Prioridade,
  TIPOS_BIFE,
  top3,
} from './escolha';

// Regras escritas à mão, sem usar as constantes do app, para conferir o app contra elas
// Faixas: o limite de baixo; "mais de 10" usa o número digitado (testado com 11 e 25)
const PESSOAS: Record<string, number> = { ate3: 1, ate6: 4, ate10: 7 };
const ENTRADAS: { faixa: Escolha['faixa']; pessoas?: number }[] = [
  { faixa: 'ate3' },
  { faixa: 'ate6' },
  { faixa: 'ate10' },
  { faixa: 'mais10', pessoas: 11 },
  { faixa: 'mais10', pessoas: 25 },
];
const pessoasDe = (e: { faixa: string; pessoas?: number }) => e.pessoas ?? PESSOAS[e.faixa];
const GRAMAS: Record<string, number> = { churrasco: 350, moida: 250 }; // outros preparos: 150

// Tabela de carnes: economia, maciez, sabor, magra
const NOTAS: Record<string, [number, number, number, number]> = {
  Picanha: [1, 3, 3, 2],
  Alcatra: [2, 2, 3, 3],
  'Contra filé': [2, 2, 3, 2],
  Fraldinha: [2, 2, 3, 2],
  'Filé mignon': [1, 3, 2, 3],
  'Coxão mole': [2, 2, 2, 2],
  Acém: [3, 2, 2, 2],
  Paleta: [3, 2, 2, 2],
  Músculo: [3, 1, 3, 3],
  'Peito bovino': [2, 1, 3, 1],
  Patinho: [2, 1, 1, 3],
  'Coxão duro': [3, 1, 1, 3],
  Lagarto: [2, 1, 1, 2],
};

const CATEGORIAS: Record<string, string[]> = {
  churrasco: ['Picanha', 'Alcatra', 'Contra filé', 'Fraldinha'],
  bifes: ['Alcatra', 'Contra filé', 'Filé mignon', 'Coxão mole'],
  panela: ['Acém', 'Paleta', 'Músculo', 'Peito bovino', 'Coxão duro'],
  desfiar: ['Fraldinha', 'Acém', 'Paleta', 'Coxão duro'],
  fitness: ['Músculo', 'Patinho', 'Lagarto'],
  moida: ['Coxão mole', 'Patinho'],
};

const MOAGEM: Record<string, string[]> = {
  economia: ['Acém', 'Paleta'],
  magra: ['Músculo', 'Patinho'],
  sabor: ['Peito bovino', 'Coxão duro'],
};

const PARES_BLEND: Record<string, string[]> = {
  saborosaMagra: ['Peito bovino', 'Patinho'],
  duasSaborosas: ['Peito bovino', 'Músculo'],
  duasMagras: ['Patinho', 'Coxão duro'],
};

const nome = (id: number) => carnes.find((c) => c.id === id)?.nome ?? `#${id}`;
const nomes = (lista: Carne[]) => lista.map((c) => c.nome).join(', ');

function nota(c: Carne, p: Prioridade) {
  const [e, m, s, mg] = NOTAS[c.nome];
  return { economia: e, maciez: m, sabor: s, magra: mg }[p];
}

function pontos(c: Carne, preparo: string, p: Prioridade, economizar: boolean) {
  const naCategoria = CATEGORIAS[preparo].includes(c.nome) ? 1 : 0;
  return nota(c, p) * 2 + (economizar ? nota(c, 'economia') : 0) + naCategoria;
}

// Chave de ordenação: pontos, depois sabor (o desempate)
const chave = (c: Carne, preparo: string, p: Prioridade, econ: boolean) =>
  pontos(c, preparo, p, econ) * 10 + nota(c, 'sabor');

function pesoEsperado(preparo: string, pessoas: number) {
  return Math.ceil((pessoas * (GRAMAS[preparo] ?? 150)) / 100) * 100;
}

// Blend: cada carne = metade de (pessoas × 250 g), arredondada para cima em múltiplos de 100 g
function porCarneEsperado(pessoas: number) {
  return Math.ceil((pessoas * 250) / 2 / 100) * 100;
}

let passou = 0;
const falhas: string[] = [];

function registrar(caso: string, erros: string[]) {
  if (erros.length) falhas.push(`${caso}\n    - ${erros.join('\n    - ')}`);
  else passou++;
}

function conferirPeso(item: ItemCarrinho, esperado: number, pessoas: number, erros: string[]) {
  if (item.peso !== esperado) erros.push(`peso ${item.peso} g, esperado ${esperado} g`);
  if (item.pessoas !== pessoas) erros.push(`${item.pessoas} pessoas no item, esperado ${pessoas}`);
  const emKg = pessoas > 10;
  if (item.emKg !== emKg) erros.push(`emKg ${item.emKg}, esperado ${emKg}`);
  const texto = formatarPeso(item.peso, item.emKg);
  if (!(emKg ? /^\d+,\d kg$/ : /^\d+ g$/).test(texto)) erros.push(`peso mostrado "${texto}"`);
}

function conferirTop3(caso: string, escolha: Escolha, detalheEsperado: string) {
  const erros: string[] = [];
  const { preparo } = escolha;
  const pessoas = pessoasDe(escolha);
  const p = escolha.prioridade!;
  const econ = escolha.economizar!;
  const top = top3(carnes, escolha);

  if (top.length !== 3) erros.push(`TOP 3 com ${top.length} carnes: ${nomes(top)}`);
  if (new Set(top.map((c) => c.id)).size !== top.length) erros.push(`carne repetida: ${nomes(top)}`);
  if (top.some((c) => !c.ativo)) erros.push('carne inativa no TOP 3');

  // Grupo principal: a categoria; na moída, as carnes de moagem da prioridade (maciez: todas de moagem)
  const moida = preparo === 'moida';
  const todasMoagem = Object.values(MOAGEM).flat();
  const principal = moida ? (MOAGEM[p] ?? todasMoagem) : CATEGORIAS[preparo];
  const permitidas = moida ? todasMoagem : null; // na moída, completar só com carnes de moagem
  const dentro = top.filter((c) => principal.includes(c.nome)).length;
  const precisa = Math.min(3, principal.length);
  if (dentro !== precisa) {
    erros.push(`${dentro} carne(s) do grupo principal, esperado ${precisa}: ${nomes(top)}`);
  }
  // As do grupo principal vêm primeiro; as de completar só depois
  const primeiroDeFora = top.findIndex((c) => !principal.includes(c.nome));
  if (primeiroDeFora !== -1 && top.slice(primeiroDeFora).some((c) => principal.includes(c.nome))) {
    erros.push(`carne de completar antes de carne do grupo principal: ${nomes(top)}`);
  }
  if (permitidas && top.some((c) => !permitidas.includes(c.nome))) {
    erros.push(`carne fora da moagem: ${nomes(top)}`);
  }

  // Ordem: dentro de cada grupo, maior pontuação primeiro e desempate pelo sabor
  const candidatas = carnes.filter((c) => c.ativo && (!permitidas || permitidas.includes(c.nome)));
  const ordenar = (lista: Carne[]) =>
    [...lista].sort((a, b) => chave(b, preparo, p, econ) - chave(a, preparo, p, econ));
  const esperado = [
    ...ordenar(candidatas.filter((c) => principal.includes(c.nome))),
    ...ordenar(candidatas.filter((c) => !principal.includes(c.nome))),
  ].slice(0, 3);
  const chaves = (l: Carne[]) => l.map((c) => chave(c, preparo, p, econ)).join(',');
  // Empate total (mesmos pontos e mesmo sabor) aceita qualquer ordem entre as empatadas
  if (chaves(top) !== chaves(esperado)) {
    erros.push(`ordem/pontuação: veio ${nomes(top)}, esperado ${nomes(esperado)}`);
  }

  const item = criarItem(escolha, [top[0]?.id ?? 0], 1);
  conferirPeso(item, pesoEsperado(preparo, pessoas), pessoas, erros);
  const detalhe = detalheDaFicha(item);
  if (detalhe !== detalheEsperado) erros.push(`ficha mostra "${detalhe}", esperado "${detalheEsperado}"`);

  registrar(`${caso} → ${nomes(top)}`, erros);
}

// 0. A tabela de carnes do app confere com a tabela escrita acima
{
  const erros: string[] = [];
  if (carnes.length !== 13) erros.push(`${carnes.length} carnes, esperado 13`);
  for (const c of carnes) {
    const n = NOTAS[c.nome];
    if (!n) {
      erros.push(`${c.nome} não está na tabela`);
      continue;
    }
    const app = [c.economia, c.maciez, c.sabor, c.magra].join(',');
    if (app !== n.join(',')) erros.push(`${c.nome}: notas ${app}, esperado ${n.join(',')}`);
    const cats = Object.keys(CATEGORIAS).filter((k) => CATEGORIAS[k].includes(c.nome));
    if ([...c.cat].sort().join(',') !== cats.sort().join(',')) {
      erros.push(`${c.nome}: categorias ${c.cat.join(',')}, esperado ${cats.join(',')}`);
    }
    const moagem = Object.keys(MOAGEM).find((k) => MOAGEM[k].includes(c.nome));
    if (c.moagem !== moagem) erros.push(`${c.nome}: moagem ${c.moagem}, esperado ${moagem}`);
  }
  registrar('Tabela de carnes', erros);
}

// 1. Todas as combinações do fluxo
const prioridades = PRIORIDADES.map((p) => p.id);
for (const entrada of ENTRADAS) {
  const pessoas = pessoasDe(entrada);
  const faixa = `${entrada.faixa}(${pessoas})`;
  for (const preparo of Object.keys(CATEGORIAS)) {
    for (const prioridade of prioridades) {
      // "Quer economizar?" não existe: só a prioridade Economia soma a economia
      const economizar = prioridade === 'economia';
      const base: Escolha = { ...entrada, preparo, prioridade, economizar };
      const caso = `${faixa} · ${preparo} · ${prioridade}`;

      if (preparo === 'churrasco') {
        for (const e of ESPESSURAS) conferirTop3(`${caso} · ${e.nome}`, { ...base, espessura: e.id }, e.nome);
      } else if (preparo === 'bifes') {
        for (const t of TIPOS_BIFE) conferirTop3(`${caso} · ${t.nome}`, { ...base, tipoBife: t.id }, t.nome);
      } else if (preparo === 'moida') {
        conferirTop3(`${caso} · hambúrguer sem blend`, { ...base, hamburguer: true }, 'Hambúrguer');
      } else {
        conferirTop3(caso, base, '—');
      }
    }

    if (preparo !== 'moida') continue;

    // Blend: passa pela prioridade; o par de carnes vem do blend escolhido
    for (const prioridade of prioridades) {
      for (const b of BLENDS) {
        const erros: string[] = [];
        const escolha: Escolha = {
          ...entrada,
          preparo,
          prioridade,
          economizar: prioridade === 'economia',
          hamburguer: true,
          blend: b.id,
        };
        const item = criarItem(escolha, b.carnes, 1);
        const par = item.carnes.map(nome);
        if (par.join(' + ') !== PARES_BLEND[b.id].join(' + ')) {
          erros.push(`blend ${par.join(' + ')}, esperado ${PARES_BLEND[b.id].join(' + ')}`);
        }
        const cada = porCarneEsperado(pessoas);
        if (pesoPorCarneDoBlend(pessoas) !== cada) {
          erros.push(`${pesoPorCarneDoBlend(pessoas)} g por carne, esperado ${cada} g`);
        }
        if (cada % 100 !== 0) erros.push(`${cada} g por carne não é múltiplo de 100 g`);
        conferirPeso(item, 2 * cada, pessoas, erros);
        if (detalheDaFicha(item) !== 'Blend') erros.push(`ficha mostra "${detalheDaFicha(item)}"`);
        registrar(`${faixa} · moída · ${prioridade} · blend ${b.nome} → ${par.join(' + ')}`, erros);
      }
    }

    // Não hambúrguer: a pessoa escolhe a carne de moagem e moer 1x ou 2x
    for (const c of carnesParaMoer(carnes)) {
      for (const vezes of [1, 2] as const) {
        const erros: string[] = [];
        if (!Object.values(MOAGEM).flat().includes(c.nome)) erros.push(`${c.nome} não é de moagem`);
        const escolha: Escolha = { ...entrada, preparo, hamburguer: false, vezesMoer: vezes };
        const item = criarItem(escolha, [c.id], 1);
        conferirPeso(item, pesoEsperado(preparo, pessoas), pessoas, erros);
        if (detalheDaFicha(item) !== `Moagem ${vezes}x`) erros.push(`ficha mostra "${detalheDaFicha(item)}"`);
        registrar(`${faixa} · moída · moer ${c.nome} ${vezes}x`, erros);
      }
    }
  }
}

// 2. Ficha: soma dos itens iguais, linhas separadas por preparo e total geral
{
  const erros: string[] = [];
  const picanha = carnes.find((c) => c.nome === 'Picanha')!.id;
  const alcatra = carnes.find((c) => c.nome === 'Alcatra')!.id;
  const itens = [
    criarItem({ faixa: 'ate3', preparo: 'churrasco', espessura: 'fino' }, [picanha], 1), // 1 × 350 = 400
    criarItem({ faixa: 'ate6', preparo: 'churrasco', espessura: 'fino' }, [picanha], 2), // 4 × 350 = 1400
    criarItem({ faixa: 'ate6', preparo: 'bifes', tipoBife: 'fino' }, [alcatra], 3), // 4 × 150 = 600
    criarItem({ faixa: 'ate3', preparo: 'churrasco', espessura: 'medio' }, [alcatra], 4), // 400
  ];
  const linhas = montarFicha(itens);
  if (linhas.length !== 3) erros.push(`${linhas.length} linhas, esperado 3`);
  const picanhaFino = linhas.find((l) => l.carnes[0] === picanha);
  if (picanhaFino?.peso !== 1800) erros.push(`Picanha somada ${picanhaFino?.peso} g, esperado 1800 g`);
  const alcatraBifes = linhas.find((l) => l.carnes[0] === alcatra && l.preparo === 'bifes');
  if (alcatraBifes?.detalhe !== 'Bife fino') erros.push(`Bifes mostra "${alcatraBifes?.detalhe}"`);
  if (alcatraBifes?.peso !== 600) erros.push(`Alcatra bifes (4 a 6) ${alcatraBifes?.peso} g, esperado 600 g`);
  if (!linhas.find((l) => l.carnes[0] === alcatra && l.preparo === 'churrasco')) {
    erros.push('Alcatra churrasco não ficou em linha separada');
  }
  const total = linhas.reduce((s, l) => s + l.peso, 0);
  const totalTexto = formatarPeso(Math.ceil(total / 100) * 100, true);
  if (totalTexto !== '2,8 kg') erros.push(`total geral "${totalTexto}", esperado "2,8 kg"`);
  registrar('Ficha: soma, linhas separadas e total geral', erros);
}

// 3. Exemplos do pedido
{
  const erros: string[] = [];
  const exemplo = (texto: string, veio: number, esperado: number) => {
    if (veio !== esperado) erros.push(`${texto}: ${veio} g, esperado ${esperado} g`);
  };
  const churrasco = criarItem({ faixa: 'ate6', preparo: 'churrasco', espessura: 'fino' }, [1], 1);
  exemplo('Churrasco, 4 a 6, Fino', churrasco.peso, 1400);
  const bifes = criarItem({ faixa: 'ate6', preparo: 'bifes', tipoBife: 'fino' }, [2], 1);
  exemplo('Bifes, 4 a 6, Bife fino', bifes.peso, 600);
  exemplo('Blend, 1 pessoa, por carne', pesoPorCarneDoBlend(1), 200);
  exemplo('Blend, 3 pessoas, por carne', pesoPorCarneDoBlend(3), 400);
  const blend = criarItem({ faixa: 'ate3', preparo: 'moida', hamburguer: true, blend: 'duasSaborosas' }, [18, 8], 1);
  exemplo('Blend, 1 a 3, total', blend.peso, 400);
  const mais10 = criarItem({ faixa: 'mais10', pessoas: 13, preparo: 'panela' }, [7], 1);
  exemplo('Panela, 13 pessoas digitadas', mais10.peso, 2000);
  if (formatarPeso(mais10.peso, mais10.emKg) !== '2,0 kg') erros.push('13 pessoas não aparece em kg');
  registrar('Exemplos do pedido', erros);
}

console.log(`\nResultado: ${passou} passaram, ${falhas.length} falharam (${passou + falhas.length} casos)`);
if (falhas.length) console.log('\nFalhas:\n  ' + falhas.join('\n  '));
