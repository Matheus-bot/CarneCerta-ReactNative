export type Categoria = {
  id: string;
  nome: string;
  icone: string; // emoji provisório
};

export const categorias: Categoria[] = [
  { id: 'churrasco', nome: 'Churrasco', icone: '🔥' },
  { id: 'bifes', nome: 'Bifes', icone: '🥩' },
  { id: 'panela', nome: 'Panela', icone: '🍲' },
  { id: 'moida', nome: 'Moída', icone: '🍔' },
  { id: 'desfiar', nome: 'Desfiar', icone: '🍖' },
  { id: 'fitness', nome: 'Fitness', icone: '💪' },
];
