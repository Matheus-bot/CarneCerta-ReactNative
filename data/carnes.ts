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
  valor: string;
  foto: string;
  libras: string; // link do vídeo em Libras ('' = não cadastrado)
  ativo: boolean; // disponível para os usuários
};

export const carnes: Carne[] = [
  { id: 1, nome: 'Picanha', cat: ['churrasco'], economia: 1, maciez: 3, sabor: 3, magra: 2, desc: 'Suculenta e macia, com gordura que derrete na brasa.', valor: 'R$ 89,90/kg', foto: 'picanha', libras: '', ativo: true },
  { id: 2, nome: 'Alcatra', cat: ['churrasco', 'bifes'], economia: 2, maciez: 2, sabor: 3, magra: 3, desc: 'Carne magra e versátil, ótima para churrasco.', valor: 'R$ 54,90/kg', foto: 'alcatra', libras: '', ativo: true },
  { id: 4, nome: 'Contra filé', cat: ['churrasco', 'bifes'], economia: 2, maciez: 2, sabor: 3, magra: 2, desc: 'Sabor intenso, bom para bifes grelhados.', valor: 'R$ 49,90/kg', foto: 'contra filé', libras: '', ativo: true },
  { id: 14, nome: 'Fraldinha', cat: ['churrasco', 'desfiar'], economia: 2, maciez: 2, sabor: 3, magra: 2, desc: 'Muito saborosa e suculenta, ótima para grelha.', valor: 'R$ 58,90/kg', foto: 'fraldinha', libras: '', ativo: true },
  { id: 6, nome: 'Filé mignon', cat: ['bifes'], economia: 1, maciez: 3, sabor: 2, magra: 3, desc: 'A carne mais macia do corte bovino, de preço alto.', valor: 'R$ 99,90/kg', foto: 'filé mignon', libras: '', ativo: true },
  { id: 12, nome: 'Coxão mole', cat: ['bifes', 'moida'], economia: 2, maciez: 2, sabor: 2, magra: 2, desc: 'Maciez e sabor equilibrados.', valor: 'R$ 46,90/kg', foto: 'coxão mole', libras: '', ativo: true },
  { id: 7, nome: 'Acém', cat: ['panela', 'desfiar'], economia: 3, maciez: 2, sabor: 2, magra: 2, moagem: 'economia', desc: 'Ideal para cozidos, ensopados e panela.', valor: 'R$ 32,90/kg', foto: 'acém', libras: '', ativo: true },
  { id: 9, nome: 'Paleta', cat: ['panela', 'desfiar'], economia: 3, maciez: 2, sabor: 2, magra: 2, moagem: 'economia', desc: 'Bom para cozidos e assados lentos.', valor: 'R$ 36,90/kg', foto: 'paleta', libras: '', ativo: true },
  { id: 8, nome: 'Músculo', cat: ['panela', 'fitness'], economia: 3, maciez: 1, sabor: 3, magra: 3, moagem: 'magra', desc: 'Ótimo para caldos e cozidos longos.', valor: 'R$ 29,90/kg', foto: 'músculo', libras: '', ativo: true },
  // Moagem para hambúrguer (sabor)
  { id: 18, nome: 'Peito bovino', cat: ['panela'], economia: 2, maciez: 1, sabor: 3, magra: 1, moagem: 'sabor', desc: 'Boa opção magra para preparos saudáveis.', valor: 'R$ 43,90/kg', foto: 'peito', libras: '', ativo: true },
  { id: 10, nome: 'Patinho', cat: ['moida', 'fitness'], economia: 2, maciez: 1, sabor: 1, magra: 3, moagem: 'magra', desc: 'Magro e prático para moída e refeições leves.', valor: 'R$ 44,90/kg', foto: 'patinho', libras: '', ativo: true },
  { id: 17, nome: 'Coxão duro', cat: ['panela', 'desfiar'], economia: 3, maciez: 1, sabor: 1, magra: 3, moagem: 'sabor', desc: 'Carne magra de preço baixo, pede cozimento longo.', valor: 'R$ 33,90/kg', foto: 'coxão duro', libras: '', ativo: true },
  { id: 16, nome: 'Lagarto', cat: ['fitness'], economia: 2, maciez: 1, sabor: 1, magra: 2, desc: 'Carne magra, indicada para dietas com pouca gordura.', valor: 'R$ 41,90/kg', foto: 'lagarto', libras: '', ativo: true },
];
