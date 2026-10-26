// Cores e gradientes copiados do CSS do protótipo (prototipo/index.html)

export const cores = {
  texto: '#f5f5f7',
  sub: '#c9c9d1',
  vermelho: '#ff5a52',
  vermelhoIcone: '#ff7a70',
  vermelhoEscuro: '#e0302e',
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
  botao2: { colors: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)'], ...diagonal },
  foto: { colors: ['#4a4a56', '#2a2a33'], ...diagonal },
  categoria: { colors: ['#5b2a31', '#2d2d38'], ...g160 },
  quadrado: { colors: ['#4a2a30', '#25252d'], ...g160 },
  opcao: { colors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)'], ...g145 },
  opcaoAtiva: { colors: ['rgba(255,90,82,0.3)', 'rgba(255,90,82,0.08)'], ...diagonal },
  libras: { colors: ['#3a3a46', '#24242c'], ...diagonal },
  ficha: { colors: ['#fbf4e2', '#eadcbc'], ...vertical },
} satisfies Record<string, Gradiente>;
