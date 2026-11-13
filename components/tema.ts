// Paletas aprovadas (docs/referencia/tela-inicial.html; claro: opção 2 "Brasa" de claro-exemplos.html).

const escura = {
  fundo: '#2a0f14',
  cartao: '#3d1820',
  borda: '#5a2a34',
  texto: '#f6efe3',
  secundario: '#c9a9ae',
  principal: '#f6efe3',
  destaque: '#ff7a1a',
  rotulo: '#ff9a4d',
  textoBotao: '#1b1b1f', // texto sobre o destaque
};

const clara = {
  fundo: '#e9d6b8',
  cartao: '#f6dcc4',
  borda: 'rgba(110,28,39,0.22)',
  texto: '#2a1a1e',
  secundario: '#6b5a55',
  principal: '#6e1c27',
  destaque: '#d9531e',
  apoio: '#f6dcc4', // chips: mesmo fundo dos cartões
  rotulo: '#6e1c27',
  textoBotao: '#ffffff', // texto sobre o destaque
};

// Ficha para o açougueiro no tema escuro: o papel claro de antes (fixo, não segue o tema claro)
const papelEscuro = { fundo: '#f6efe3', texto: '#1b1b1f', borda: '#e4dfd6' };

// Tema escuro ("Palco escuro"). Exportado à parte porque a splash usa direto (o app sempre abre no escuro)
export const cores = {
  fundo: escura.fundo,
  texto: escura.texto,
  sub: escura.secundario,
  vermelho: escura.destaque, // destaque: "Certa", item ativo, número do pódio, barra de progresso
  vermelhoIcone: escura.rotulo,
  vermelhoEscuro: escura.destaque,
  titulo: escura.principal,
  botaoTexto: escura.textoBotao,
  badgeTexto: escura.textoBotao,
  fotoTexto: escura.secundario,
  placeholder: 'rgba(246,239,227,0.5)', // texto (#f6efe3) a 50%
  sombraBotao: '0px 4px 14px rgba(255,122,26,0.35)', // destaque (#ff7a1a) a 35%
  brilhoDestaque: '0px 0px 8px rgba(255,122,26,0.6)', // linha do corte na splash
  linha15: escura.borda,
  linha18: escura.borda,
  linha20: escura.borda,
  linha25: escura.borda,
  campo: escura.cartao,
  trilha: escura.borda,
  bordaDestaque: escura.destaque,
  chipFundo: escura.cartao,
  chipBorda: escura.borda,
  chipTexto: escura.texto,
  chipTextoAtivo: escura.textoBotao,
  sobreFoto: '#ffffff',
  subSobreFoto: escura.texto,
  // Ficha para o açougueiro: papel claro nos dois temas
  papel: papelEscuro.fundo,
  tinta: papelEscuro.texto,
  tintaLinha: papelEscuro.borda,
  camadaBanner: 'rgba(20,8,10,0.65)',
  // Botão do pódio no #2 e no #3
  vinhoBotao: escura.borda,
  vinhoBotaoTexto: escura.texto,
};

type Gradiente = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const vertical = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
const horizontal = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

// Tema claro: degradê laranja do botão e do item ativo, na horizontal (#ff9a4d → #e8561a a 60% → #c4401a)
const degradeBrasa = {
  colors: ['#ff9a4d', '#e8561a', '#c4401a'] as const,
  locations: [0, 0.6, 1] as const,
  ...horizontal,
};

// Cor lisa no lugar dos gradientes antigos (as paletas aprovadas não usam gradiente nos blocos)
const solido = (cor: string) => ({ colors: [cor, cor] as const, ...vertical });

export const gradientes = {
  fundo: solido(escura.fundo),
  celular: solido(escura.fundo),
  menu: solido(escura.fundo),
  cartao: solido(escura.cartao),
  destaque: solido(escura.cartao),
  botao: solido(escura.destaque),
  chipAtivo: solido(escura.destaque),
  botao2: solido(escura.cartao),
  foto: solido(escura.cartao),
  categoria: solido(escura.cartao),
  quadrado: solido(escura.cartao),
  opcao: solido(escura.cartao),
  opcaoAtiva: solido('rgba(255,122,26,0.16)'), // destaque a 16%
  libras: solido(escura.cartao),
  ficha: solido(papelEscuro.fundo),
} satisfies Record<string, Gradiente>;

export type NomeGradiente = keyof typeof gradientes;
export type NomeTema = 'escuro' | 'claro';
export type Tema = {
  cores: Record<keyof typeof cores, string>;
  gradientes: Record<NomeGradiente, Gradiente>;
  // Só no tema claro: Bebas Neue nos títulos e nomes, DM Sans no corpo (components/ui.tsx).
  // O tema escuro não tem, e continua com as fontes de antes
  fontes?: { titulo: string; corpo: { normal: string; semi: string; negrito: string } };
};

export const temaEscuro: Tema = { cores, gradientes };

// Tema claro ("Brasa")
export const temaClaro: Tema = {
  cores: {
    fundo: clara.fundo,
    texto: clara.texto,
    sub: clara.secundario,
    vermelho: clara.destaque,
    vermelhoIcone: clara.rotulo,
    vermelhoEscuro: clara.destaque,
    titulo: clara.principal,
    botaoTexto: clara.textoBotao,
    badgeTexto: clara.textoBotao,
    fotoTexto: clara.secundario,
    placeholder: clara.secundario,
    sombraBotao: '0px 6px 16px -6px #e8561a',
    brilhoDestaque: '0px 0px 8px rgba(217,83,30,0.6)', // destaque (#d9531e) a 60%
    linha15: clara.borda,
    linha18: clara.borda,
    linha20: clara.borda,
    linha25: clara.borda,
    campo: clara.cartao,
    trilha: clara.borda,
    bordaDestaque: clara.destaque,
    chipFundo: clara.cartao,
    chipBorda: clara.borda,
    chipTexto: clara.principal,
    chipTextoAtivo: clara.textoBotao,
    sobreFoto: '#ffffff',
    subSobreFoto: '#ffffff',
    papel: clara.cartao,
    tinta: clara.texto,
    tintaLinha: clara.borda,
    camadaBanner: 'rgba(110,28,39,0.85)',
    vinhoBotao: clara.principal,
    vinhoBotaoTexto: clara.textoBotao,
  },
  gradientes: {
    fundo: solido(clara.fundo),
    celular: solido(clara.fundo),
    menu: solido(clara.fundo),
    cartao: solido(clara.cartao),
    destaque: solido(clara.cartao),
    botao: degradeBrasa,
    chipAtivo: degradeBrasa,
    botao2: solido(clara.cartao),
    foto: solido(clara.cartao),
    categoria: solido(clara.cartao),
    quadrado: solido(clara.cartao),
    opcao: solido(clara.cartao),
    opcaoAtiva: solido('rgba(217,83,30,0.12)'), // destaque a 12%
    libras: solido(clara.cartao),
    ficha: solido(clara.cartao),
  },
  fontes: {
    titulo: 'BebasNeue_400Regular',
    corpo: { normal: 'DMSans_400Regular', semi: 'DMSans_600SemiBold', negrito: 'DMSans_700Bold' },
  },
};

export const temas: Record<NomeTema, Tema> = { escuro: temaEscuro, claro: temaClaro };

// Novo estilo visual (aprovado): tela Início, cabeçalho e barra inferior da Início, e pódio.
// Os tokens acima continuam valendo para as outras telas.
// Fontes carregadas em App.tsx (nome = chave passada ao useFonts)
export const FONTE_TITULO = 'BebasNeue_400Regular'; // títulos e logo
export const FONTE_CORPO = {
  normal: 'DMSans_400Regular',
  semi: 'DMSans_600SemiBold',
  negrito: 'DMSans_700Bold',
}; // corpo, botões e rótulos

export type EstiloInicio = {
  fundo: string;
  cartao: string;
  borda: string;
  texto: string;
  textoSecundario: string;
  principal: string; // logo "Carne", títulos, nomes das categorias e das carnes
  destaque: string; // botão, "Certa", item ativo, #1
  textoSobreDestaque: string;
  rotulo: string; // rótulo de seção ("Categorias")
  apoio?: string; // chips (só no tema claro)
  // Pílula do carrinho (docs/referencia/tela-inicial.html: no claro usa a cor de apoio)
  pilulaFundo: string;
  pilulaBorda: string;
  pilulaTexto: string;
  sobreFoto: string; // textos sobre a foto do banner
  faixaFoto: readonly [string, string]; // gradiente sobre a foto do banner: de cima para baixo
  nomeCategoriaBebas: boolean; // Bebas 17 nos dois temas (antes, no claro: DM Sans 12 negrito)
  // Só no tema claro: botão do banner em degradê, com sombra (no escuro, cor lisa do destaque)
  degradeBotao?: Gradiente;
  sombraBotao?: string;
};

// Tema escuro: "Palco escuro"
const inicioEscuro: EstiloInicio = {
  fundo: escura.fundo,
  cartao: escura.cartao,
  borda: escura.borda,
  texto: escura.texto,
  textoSecundario: escura.secundario,
  principal: escura.principal,
  destaque: escura.destaque,
  textoSobreDestaque: escura.textoBotao,
  rotulo: escura.rotulo,
  pilulaFundo: escura.cartao,
  pilulaBorda: escura.borda,
  pilulaTexto: escura.texto,
  sobreFoto: '#ffffff',
  faixaFoto: ['rgba(20,8,10,0.15)', 'rgba(20,8,10,0.9)'],
  nomeCategoriaBebas: true,
};

// Tema claro: "Brasa"
const inicioClaro: EstiloInicio = {
  fundo: clara.fundo,
  cartao: clara.cartao,
  borda: clara.borda,
  texto: clara.texto,
  textoSecundario: clara.secundario,
  principal: clara.principal,
  destaque: clara.destaque,
  textoSobreDestaque: clara.textoBotao,
  rotulo: clara.rotulo,
  apoio: clara.apoio,
  pilulaFundo: 'transparent',
  pilulaBorda: clara.borda,
  pilulaTexto: clara.principal,
  sobreFoto: '#ffffff',
  faixaFoto: ['rgba(255,122,26,0.35)', 'rgba(110,28,39,0.85)'],
  nomeCategoriaBebas: true,
  degradeBotao: degradeBrasa,
  sombraBotao: '0px 6px 16px -6px #e8561a',
};

export const estilosInicio: Record<NomeTema, EstiloInicio> = { escuro: inicioEscuro, claro: inicioClaro };
