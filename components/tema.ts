// Cores e gradientes copiados do CSS do protótipo (prototipo/index.html)

export const cores = {
  texto: '#f5f5f7',
  sub: '#c9c9d1',
  vermelho: '#ff5a52',
  vermelhoIcone: '#ff7a70',
  vermelhoEscuro: '#e0302e',
  // Valores que estavam fixos nos componentes, copiados sem alteração
  titulo: '#f5f5f7',
  botaoTexto: '#fff',
  badgeTexto: '#fff',
  fotoTexto: '#d6d6de',
  placeholder: 'rgba(245,245,247,0.5)',
  sombraBotao: '0px 4px 14px rgba(224, 48, 46, 0.35)',
  linha15: 'rgba(255,255,255,0.15)',
  linha18: 'rgba(255,255,255,0.18)',
  linha20: 'rgba(255,255,255,0.2)',
  linha25: 'rgba(255,255,255,0.25)',
  campo: 'rgba(255,255,255,0.08)',
  trilha: 'rgba(255,255,255,0.1)',
  bordaDestaque: 'rgba(255,90,82,0.45)',
  chipBorda: 'rgba(255,255,255,0.25)',
  chipTexto: '#f5f5f7',
  chipTextoAtivo: '#f5f5f7',
  sobreFoto: '#f5f5f7',
  subSobreFoto: '#c9c9d1',
  papel: '#fbf4e2',
  tinta: '#2a1f14',
  tintaLinha: 'rgba(42,31,20,0.25)',
  // Novo: camada sobre a foto do banner
  camadaBanner: 'rgba(0,0,0,0.65)',
  // Novo: botão vinho do pódio (#2 e #3), o vinho do gradiente "destaque"
  vinhoBotao: '#7a1f24',
  vinhoBotaoTexto: '#f5f5f7',
};

type Gradiente = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

// Ângulos CSS aproximados: 135deg = diagonal, 160deg/145deg = quase vertical, 180deg = vertical
const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const g145 = { start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } };
const g160 = { start: { x: 0.3, y: 0 }, end: { x: 0.7, y: 1 } };
const vertical = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };

export const gradientes = {
  fundo: { colors: ['#4a1e22', '#1f1f28'], ...g160 },
  celular: { colors: ['#34343f', '#1d1d25'], ...vertical },
  menu: { colors: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'], ...vertical },
  cartao: { colors: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'], ...g145 },
  destaque: { colors: ['#7a1f24', '#3a2a35', '#2a2a36'], locations: [0, 0.6, 1], ...diagonal },
  botao: { colors: ['#ff5a52', '#c4201f'], ...diagonal },
  chipAtivo: { colors: ['#ff5a52', '#c4201f'], ...diagonal },
  botao2: { colors: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)'], ...diagonal },
  foto: { colors: ['#4a4a56', '#2a2a33'], ...diagonal },
  categoria: { colors: ['#5b2a31', '#2d2d38'], ...g160 },
  quadrado: { colors: ['#4a2a30', '#25252d'], ...g160 },
  opcao: { colors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)'], ...g145 },
  opcaoAtiva: { colors: ['rgba(255,90,82,0.3)', 'rgba(255,90,82,0.08)'], ...diagonal },
  libras: { colors: ['#3a3a46', '#24242c'], ...diagonal },
  ficha: { colors: ['#fbf4e2', '#eadcbc'], ...vertical },
} satisfies Record<string, Gradiente>;

export type NomeGradiente = keyof typeof gradientes;
export type NomeTema = 'escuro' | 'claro';
export type Tema = {
  cores: Record<keyof typeof cores, string>;
  gradientes: Record<NomeGradiente, Gradiente>;
};

export const temaEscuro: Tema = { cores, gradientes };

const paleta = {
  fundo: '#f6efe3',
  cartao: '#ffffff',
  texto: '#1b1b1f',
  sub: '#6b6670',
  linha: '#e4dfd6',
  petroleo: '#1f4e5f',
  vinho: '#7a1f2b',
  laranja: '#ff7a1a',
  sobreEscuro: '#fbf6f5', // texto sobre vinho e petróleo
};

const solido = (cor: string) => ({ colors: [cor, cor] as const, ...vertical });

export const temaClaro: Tema = {
  cores: {
    texto: paleta.texto,
    sub: paleta.sub,
    vermelho: paleta.vinho,
    vermelhoIcone: paleta.vinho,
    vermelhoEscuro: paleta.vinho,
    titulo: paleta.petroleo,
    botaoTexto: paleta.texto, // branco sobre o laranja fica ilegível
    badgeTexto: paleta.sobreEscuro,
    fotoTexto: paleta.sub,
    placeholder: paleta.sub,
    sombraBotao: '0px 4px 14px rgba(255, 122, 26, 0.35)',
    linha15: paleta.linha,
    linha18: paleta.linha,
    linha20: paleta.linha,
    linha25: paleta.linha,
    campo: paleta.cartao,
    trilha: paleta.linha,
    bordaDestaque: paleta.petroleo,
    chipBorda: paleta.vinho,
    chipTexto: paleta.vinho,
    chipTextoAtivo: paleta.sobreEscuro,
    sobreFoto: paleta.sobreEscuro,
    subSobreFoto: paleta.sobreEscuro,
    papel: paleta.cartao,
    tinta: paleta.texto,
    tintaLinha: paleta.linha,
    camadaBanner: 'rgba(31,78,95,0.78)',
    vinhoBotao: paleta.vinho,
    vinhoBotaoTexto: paleta.sobreEscuro,
  },
  gradientes: {
    fundo: solido(paleta.fundo),
    celular: solido(paleta.fundo),
    menu: solido(paleta.cartao),
    cartao: solido(paleta.cartao),
    destaque: solido(paleta.petroleo),
    botao: solido(paleta.laranja),
    chipAtivo: solido(paleta.vinho),
    botao2: solido(paleta.cartao),
    foto: solido(paleta.fundo),
    categoria: solido(paleta.cartao),
    quadrado: solido(paleta.cartao),
    opcao: solido(paleta.cartao),
    opcaoAtiva: { colors: ['rgba(122,31,43,0.16)', 'rgba(122,31,43,0.06)'], ...diagonal },
    libras: solido(paleta.cartao),
    ficha: solido(paleta.cartao),
  },
};

export const temas: Record<NomeTema, Tema> = { escuro: temaEscuro, claro: temaClaro };
