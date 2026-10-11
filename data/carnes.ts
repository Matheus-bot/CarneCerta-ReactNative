export type Carne = {
  id: number;
  nome: string;
  cat: string; // id da categoria (data/categorias.ts)
  economia: number; // 1 a 3
  maciez: number; // 1 a 3
  sabor: number; // 1 a 3
  desc: string;
  valor: string;
  foto: string;
  libras: string; // link do vídeo em Libras ('' = não cadastrado)
  ativo: boolean; // disponível para os usuários
  gosto: boolean; // aparece nas opções de gosto
};

export const carnes: Carne[] = [
  { id: 1, nome: 'Picanha', cat: 'churrasco', economia: 1, maciez: 3, sabor: 3, desc: 'Suculenta e macia, com gordura que derrete na brasa.', valor: 'R$ 89,90/kg', foto: 'picanha', libras: '', ativo: true, gosto: true },
  { id: 2, nome: 'Alcatra', cat: 'churrasco', economia: 2, maciez: 2, sabor: 3, desc: 'Carne magra e versátil, ótima para churrasco.', valor: 'R$ 54,90/kg', foto: 'alcatra', libras: '', ativo: true, gosto: true },
  { id: 3, nome: 'Maminha', cat: 'churrasco', economia: 2, maciez: 3, sabor: 2, desc: 'Macia e saborosa, perfeita para churrasco e grelhados.', valor: 'R$ 62,90/kg', foto: 'maminha', libras: '', ativo: true, gosto: true },
  { id: 4, nome: 'Contra filé', cat: 'bifes', economia: 2, maciez: 2, sabor: 3, desc: 'Sabor intenso, bom para bifes grelhados.', valor: 'R$ 49,90/kg', foto: 'contra filé', libras: '', ativo: true, gosto: true },
  { id: 5, nome: 'Miolo da alcatra', cat: 'bifes', economia: 3, maciez: 2, sabor: 2, desc: 'Boa relação entre custo e sabor para bifes.', valor: 'R$ 42,90/kg', foto: 'miolo', libras: '', ativo: true, gosto: true },
  { id: 6, nome: 'Filé mignon', cat: 'bifes', economia: 1, maciez: 3, sabor: 2, desc: 'A carne mais macia do corte bovino, de preço alto.', valor: 'R$ 99,90/kg', foto: 'filé mignon', libras: '', ativo: true, gosto: true },
  { id: 7, nome: 'Acém', cat: 'panela', economia: 3, maciez: 2, sabor: 2, desc: 'Ideal para cozidos, ensopados e panela.', valor: 'R$ 32,90/kg', foto: 'acém', libras: '', ativo: true, gosto: true },
  { id: 8, nome: 'Músculo', cat: 'panela', economia: 3, maciez: 1, sabor: 3, desc: 'Ótimo para caldos e cozidos longos.', valor: 'R$ 29,90/kg', foto: 'músculo', libras: '', ativo: true, gosto: true },
  { id: 9, nome: 'Paleta', cat: 'panela', economia: 3, maciez: 2, sabor: 2, desc: 'Bom para cozidos e assados lentos.', valor: 'R$ 36,90/kg', foto: 'paleta', libras: '', ativo: true, gosto: true },
  { id: 10, nome: 'Patinho', cat: 'moida', economia: 2, maciez: 1, sabor: 1, desc: 'Magro e prático para moída e refeições leves.', valor: 'R$ 44,90/kg', foto: 'patinho', libras: '', ativo: true, gosto: true },
  { id: 11, nome: 'Carne moída', cat: 'moida', economia: 3, maciez: 1, sabor: 1, desc: 'Versátil e prática para inúmeras receitas.', valor: 'R$ 34,90/kg', foto: 'moída', libras: '', ativo: true, gosto: true },
  { id: 12, nome: 'Coxão mole', cat: 'moida', economia: 2, maciez: 2, sabor: 2, desc: 'Maciez e sabor equilibrados.', valor: 'R$ 46,90/kg', foto: 'coxão mole', libras: '', ativo: true, gosto: true },
  { id: 13, nome: 'Costela', cat: 'desfiar', economia: 3, maciez: 3, sabor: 3, desc: 'Saborosa e suculenta, excelente para o forno.', valor: 'R$ 38,90/kg', foto: 'costela', libras: '', ativo: true, gosto: true },
  { id: 14, nome: 'Fraldinha', cat: 'desfiar', economia: 2, maciez: 2, sabor: 3, desc: 'Muito saborosa e suculenta, ótima para grelha.', valor: 'R$ 58,90/kg', foto: 'fraldinha', libras: '', ativo: true, gosto: true },
  { id: 15, nome: 'Cupim', cat: 'desfiar', economia: 2, maciez: 2, sabor: 2, desc: 'Macio após cozimento lento, usado em desfiados.', valor: 'R$ 47,90/kg', foto: 'cupim', libras: '', ativo: true, gosto: true },
  { id: 16, nome: 'Lagarto', cat: 'fitness', economia: 2, maciez: 1, sabor: 1, desc: 'Carne magra, indicada para dietas com pouca gordura.', valor: 'R$ 41,90/kg', foto: 'lagarto', libras: '', ativo: true, gosto: true },
  { id: 17, nome: 'Coxão duro', cat: 'fitness', economia: 3, maciez: 1, sabor: 1, desc: 'Carne magra de preço baixo, pede cozimento longo.', valor: 'R$ 33,90/kg', foto: 'coxão duro', libras: '', ativo: true, gosto: true },
  { id: 18, nome: 'Peito bovino', cat: 'fitness', economia: 2, maciez: 1, sabor: 2, desc: 'Boa opção magra para preparos saudáveis.', valor: 'R$ 43,90/kg', foto: 'peito', libras: '', ativo: true, gosto: true },
];
