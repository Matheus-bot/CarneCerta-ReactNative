import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

export type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Categoria = {
  id: string;
  nome: string;
  icone: NomeIcone; // equivalente ao ícone Tabler do protótipo
};

export const categorias: Categoria[] = [
  { id: 'churrasco', nome: 'Churrasco', icone: 'fire' }, // ti-flame
  { id: 'bifes', nome: 'Bifes', icone: 'food-steak' }, // ti-meat
  { id: 'panela', nome: 'Panela', icone: 'pot-steam' }, // ti-pot
  { id: 'moida', nome: 'Moída', icone: 'silverware-fork-knife' }, // ti-tools-kitchen-2
  { id: 'desfiar', nome: 'Desfiar', icone: 'leaf' }, // ti-salad
  { id: 'fitness', nome: 'Fitness', icone: 'dumbbell' }, // ti-barbell
];

export function nomeCategoria(id: string) {
  return categorias.find((c) => c.id === id)?.nome ?? '';
}

export function iconeCategoria(id: string): NomeIcone {
  return categorias.find((c) => c.id === id)?.icone ?? 'food-steak';
}
