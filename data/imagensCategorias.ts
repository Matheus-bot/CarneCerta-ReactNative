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
