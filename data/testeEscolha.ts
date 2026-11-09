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
  fichaEmKg,
  fichaParaTela,
  ItemCarrinho,
  montarFicha,
  normalizarItem,
  ordenarBlends,
  pesoDoItem,
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

// O peso e o texto vêm das mesmas funções que a tela usa (pesoDoItem e fichaParaTela)
function conferirPeso(item: ItemCarrinho, esperado: number, pessoas: number, erros: string[]) {
  const peso = pesoDoItem(item);
  if (peso !== esperado) erros.push(`peso ${peso} g, esperado ${esperado} g`);
  if (item.pessoas !== pessoas) erros.push(`${item.pessoas} pessoas no item, esperado ${pessoas}`);
  const emKg = pessoas > 10;
  if (fichaEmKg([item]) !== emKg) erros.push(`emKg ${fichaEmKg([item])}, esperado ${emKg}`);
  if ('peso' in item || 'emKg' in item) erros.push('o item grava o peso (deveria guardar só as escolhas)');
  const texto = fichaParaTela([item]).total;
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
        // Hambúrguer não passa pelo TOP 3 (sempre as duas carnes do blend): confere o TOP 3 da moída sem hambúrguer
        conferirTop3(`${caso} · moer 1x`, { ...base, hamburguer: false, vezesMoer: 1 }, 'Moagem 1x');
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
        const detalheBlend = `Hambúrguer · ${b.nome}`;
        if (detalheDaFicha(item) !== detalheBlend) erros.push(`ficha mostra "${detalheDaFicha(item)}"`);
        // Na ficha: uma linha por carne, cada uma com metade do peso
        const linhasBlend = montarFicha([item]);
        if (linhasBlend.length !== 2) erros.push(`${linhasBlend.length} linha(s) na ficha, esperado 2`);
        if (linhasBlend.some((l) => l.carnes.length !== 1 || l.peso !== cada)) {
          erros.push(`linhas ${linhasBlend.map((l) => `${l.carnes.map(nome).join('+')} ${l.peso} g`).join(', ')}`);
        }
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
  // Até 10 pessoas: total em gramas, com a mesma função da tela
  const { total, subtitulo } = fichaParaTela(itens);
  if (total !== '2800 g') erros.push(`total geral "${total}", esperado "2800 g"`);
  if (subtitulo !== '4 a 6 pessoas') erros.push(`subtítulo "${subtitulo}", esperado "4 a 6 pessoas"`);
  registrar('Ficha: soma, linhas separadas e total geral', erros);
}

// 3. Ordem dos blends pela prioridade (fórmula aprovada: soma das notas × 2, + economia na
// prioridade Economia, desempate pela soma do sabor)
{
  const esperado: Record<string, string> = {
    economia: 'Duas saborosas, Duas magras, Saborosa + magra',
    maciez: 'Duas saborosas, Saborosa + magra, Duas magras',
    sabor: 'Duas saborosas, Saborosa + magra, Duas magras',
    magra: 'Duas magras, Duas saborosas, Saborosa + magra',
  };
  for (const p of prioridades) {
    const veio = ordenarBlends(carnes, p).map((b) => b.nome).join(', ');
    registrar(`Ordem dos blends · ${p} → ${veio}`, veio === esperado[p] ? [] : [`esperado ${esperado[p]}`]);
  }
}

// 4. Exemplos do pedido
{
  const erros: string[] = [];
  const exemplo = (texto: string, veio: number, esperado: number) => {
    if (veio !== esperado) erros.push(`${texto}: ${veio} g, esperado ${esperado} g`);
  };
  const churrasco = criarItem({ faixa: 'ate6', preparo: 'churrasco', espessura: 'fino' }, [1], 1);
  exemplo('Churrasco, 4 a 6, Fino', pesoDoItem(churrasco), 1400);
  const bifes = criarItem({ faixa: 'ate6', preparo: 'bifes', tipoBife: 'fino' }, [2], 1);
  exemplo('Bifes, 4 a 6, Bife fino', pesoDoItem(bifes), 600);
  exemplo('Blend, 1 pessoa, por carne', pesoPorCarneDoBlend(1), 200);
  exemplo('Blend, 3 pessoas, por carne', pesoPorCarneDoBlend(3), 400);
  const blend = criarItem({ faixa: 'ate3', preparo: 'moida', hamburguer: true, blend: 'duasSaborosas' }, [18, 8], 1);
  exemplo('Blend, 1 a 3, total', pesoDoItem(blend), 400);
  const mais10 = criarItem({ faixa: 'mais10', pessoas: 13, preparo: 'panela' }, [7], 1);
  exemplo('Panela, 13 pessoas digitadas', pesoDoItem(mais10), 2000);
  if (fichaParaTela([mais10]).total !== '2,0 kg') erros.push('13 pessoas não aparece em kg');
  registrar('Exemplos do pedido', erros);
}

// 5. Os 10 casos do diagnóstico (docs/diagnostico-gramas.md): o que a ficha mostra nas linhas, no total e no subtítulo
{
  const id = (n: string) => carnes.find((c) => c.nome === n)!.id;
  const peito = id('Peito bovino');
  const patinho = id('Patinho');
  const casos: { caso: string; escolha: Escolha; ids: number[]; linhas: string[]; total: string; sub: string }[] = [
    { caso: '1. 2 pessoas, Churrasco Médio', escolha: { faixa: 'ate3', preparo: 'churrasco', espessura: 'medio' }, ids: [id('Picanha')], linhas: ['400 g'], total: '400 g', sub: '1 a 3 pessoas' },
    { caso: '2. 5 pessoas, Churrasco Fino', escolha: { faixa: 'ate6', preparo: 'churrasco', espessura: 'fino' }, ids: [id('Picanha')], linhas: ['1400 g'], total: '1400 g', sub: '4 a 6 pessoas' },
    { caso: '3. 8 pessoas, Churrasco Grosso', escolha: { faixa: 'ate10', preparo: 'churrasco', espessura: 'grosso' }, ids: [id('Picanha')], linhas: ['2500 g'], total: '2500 g', sub: '7 a 10 pessoas' },
    { caso: '4. 12 pessoas, Churrasco Médio', escolha: { faixa: 'mais10', pessoas: 12, preparo: 'churrasco', espessura: 'medio' }, ids: [id('Picanha')], linhas: ['4,2 kg'], total: '4,2 kg', sub: '12 pessoas' },
    { caso: '5. 4 pessoas, Moída com hambúrguer', escolha: { faixa: 'ate6', preparo: 'moida', hamburguer: true, blend: 'saborosaMagra' }, ids: [peito, patinho], linhas: ['500 g', '500 g'], total: '1000 g', sub: '4 a 6 pessoas' },
    { caso: '6. 4 pessoas, Moída sem hambúrguer', escolha: { faixa: 'ate6', preparo: 'moida', hamburguer: false, vezesMoer: 1 }, ids: [id('Acém')], linhas: ['1000 g'], total: '1000 g', sub: '4 a 6 pessoas' },
    { caso: '7. 6 pessoas, Acém (panela)', escolha: { faixa: 'ate6', preparo: 'panela' }, ids: [id('Acém')], linhas: ['600 g'], total: '600 g', sub: '4 a 6 pessoas' },
    { caso: '8. 9 pessoas, Bife de chapa', escolha: { faixa: 'ate10', preparo: 'bifes', tipoBife: 'chapa' }, ids: [id('Alcatra')], linhas: ['1100 g'], total: '1100 g', sub: '7 a 10 pessoas' },
    { caso: '9. 11 pessoas, Fitness', escolha: { faixa: 'mais10', pessoas: 11, preparo: 'fitness' }, ids: [id('Músculo')], linhas: ['1,7 kg'], total: '1,7 kg', sub: '11 pessoas' },
    { caso: '10. 15 pessoas, Moída com hambúrguer', escolha: { faixa: 'mais10', pessoas: 15, preparo: 'moida', hamburguer: true, blend: 'saborosaMagra' }, ids: [peito, patinho], linhas: ['1,9 kg', '1,9 kg'], total: '3,8 kg', sub: '15 pessoas' },
  ];
  for (const c of casos) {
    const ficha = fichaParaTela([criarItem(c.escolha, c.ids, 1)]);
    const veio = ficha.linhas.map((l) => l.texto).join(' / ');
    const erros: string[] = [];
    if (veio !== c.linhas.join(' / ')) erros.push(`linhas "${veio}", esperado "${c.linhas.join(' / ')}"`);
    if (ficha.total !== c.total) erros.push(`total "${ficha.total}", esperado "${c.total}"`);
    if (ficha.subtitulo !== c.sub) erros.push(`subtítulo "${ficha.subtitulo}", esperado "${c.sub}"`);
    registrar(`Diagnóstico ${c.caso} → ${veio} · total ${ficha.total} · ${ficha.subtitulo}`, erros);
  }
}

// 6. Hambúrguer: duas carnes, cada uma na sua linha com o próprio peso
// 11 pessoas × 250 g = 2750 g → 1375 g → 1400 g cada → total 2,8 kg
{
  const erros: string[] = [];
  const [peito, patinho] = BLENDS.find((b) => b.id === 'saborosaMagra')!.carnes;
  const escolha: Escolha = { faixa: 'mais10', pessoas: 11, preparo: 'moida', hamburguer: true, blend: 'saborosaMagra' };
  const ficha = fichaParaTela([criarItem(escolha, [peito, patinho], 1)]);
  const veio = ficha.linhas.map((l) => `${l.carnes.map(nome).join('+')} ${l.texto}`).join(', ');
  if (veio !== 'Peito bovino 1,4 kg, Patinho 1,4 kg') erros.push(`veio ${veio}`);
  if (ficha.total !== '2,8 kg') erros.push(`total "${ficha.total}", esperado "2,8 kg"`);
  for (const b of BLENDS) {
    if (b.carnes.length !== 2 || b.carnes[0] === b.carnes[1]) erros.push(`blend ${b.nome} sem duas carnes diferentes`);
  }
  registrar(`Hambúrguer com duas carnes → ${veio}`, erros);
}

// 7. Unidade pela ficha inteira: 2 pessoas + 12 pessoas → todas as linhas e o total em kg
{
  const erros: string[] = [];
  const itens = [
    criarItem({ faixa: 'ate3', preparo: 'panela' }, [7], 1), // 150 → 200 g
    criarItem({ faixa: 'mais10', pessoas: 12, preparo: 'churrasco', espessura: 'medio' }, [1], 2), // 4200 g
  ];
  const ficha = fichaParaTela(itens);
  const veio = ficha.linhas.map((l) => l.texto).join(' / ');
  if (veio !== '0,2 kg / 4,2 kg') erros.push(`linhas "${veio}", esperado "0,2 kg / 4,2 kg"`);
  if (ficha.total !== '4,4 kg') erros.push(`total "${ficha.total}", esperado "4,4 kg"`);
  if (ficha.subtitulo !== '12 pessoas') erros.push(`subtítulo "${ficha.subtitulo}", esperado "12 pessoas"`);
  // Só até 10 pessoas: tudo em gramas (200 g + 7 × 150 = 1050 → 1100 g)
  const pequena = fichaParaTela([itens[0], criarItem({ faixa: 'ate10', preparo: 'bifes', tipoBife: 'chapa' }, [2], 3)]);
  if (pequena.total !== '1300 g') erros.push(`ficha até 10 pessoas "${pequena.total}", esperado "1300 g"`);
  registrar('Unidade decidida pela ficha inteira', erros);
}

// 8. Ficha salva antiga com peso gravado: recalculada ao abrir; a faixa vem das pessoas usadas
{
  const erros: string[] = [];
  const antiga = normalizarItem({ id: 1, carnes: [1], preparo: 'churrasco', pessoas: 1, espessura: 'medio', peso: 9999, emKg: true });
  if ('peso' in antiga || 'emKg' in antiga) erros.push('o peso gravado continua no item');
  const ficha = fichaParaTela([antiga]);
  if (ficha.total !== '400 g') erros.push(`total "${ficha.total}", esperado "400 g"`);
  if (ficha.subtitulo !== '1 a 3 pessoas') erros.push(`subtítulo "${ficha.subtitulo}", esperado "1 a 3 pessoas"`);
  const antiga12 = normalizarItem({ id: 2, carnes: [1], preparo: 'churrasco', pessoas: 12, espessura: 'medio', peso: 1, emKg: false });
  const total12 = fichaParaTela([antiga12]).total;
  if (total12 !== '4,2 kg') erros.push(`ficha antiga de 12 pessoas "${total12}", esperado "4,2 kg"`);
  registrar('Ficha salva antiga recalculada', erros);
}

console.log(`\nResultado: ${passou} passaram, ${falhas.length} falharam (${passou + falhas.length} casos)`);
if (falhas.length) console.log('\nFalhas:\n  ' + falhas.join('\n  '));
