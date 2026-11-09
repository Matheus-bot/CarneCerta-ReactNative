import { ImageSourcePropType } from 'react-native';

// Fotos das categorias (chaves = ids de data/categorias.ts); sem foto, o card usa o bloco colorido
export const imagensCategorias: Partial<Record<string, ImageSourcePropType>> = {
  churrasco: require('../assets/categorias/churrasco.webp'),
  bifes: require('../assets/categorias/bifes.png'),
  panela: require('../assets/categorias/panela.webp'),
  moida: require('../assets/categorias/moida.webp'),
  desfiar: require('../assets/categorias/desfiar.png'),
  fitness: require('../assets/categorias/fitness.png'),
};

// Picanha (1) e Alcatra (2): foto de churrasco até existirem fotos próprias
const FOTO_PROVISORIA: Record<number, string> = { 1: 'churrasco', 2: 'churrasco' };

// Foto da carne no catálogo: a provisória ou a da primeira categoria dela
export function fotoDaCarne(c: { id: number; cat: string[] }) {
  return imagensCategorias[FOTO_PROVISORIA[c.id] ?? c.cat[0]];
}
