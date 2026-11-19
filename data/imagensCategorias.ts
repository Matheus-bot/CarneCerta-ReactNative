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

// Foto de cada carne (chaves = ids de data/carnes.ts), da pasta dela em assets/imagens/imagenscarnes:
// a peça inteira crua, para o catálogo ficar padronizado (o Metro só aceita o caminho escrito por inteiro)
const fotosDasCarnes: Partial<Record<number, ImageSourcePropType>> = {
  1: require('../assets/imagens/imagenscarnes/picanha/picanhainteiracrua.jpeg'),
  2: require('../assets/imagens/imagenscarnes/alcatra/mioloalcatrainteirocru.jpeg'),
  4: require('../assets/imagens/imagenscarnes/contrafileTradicional/contrafiletradicionalinteiro.png'),
  14: require('../assets/imagens/imagenscarnes/fraldinha/fraldinhainteiracrua03.jpg'),
  6: require('../assets/imagens/imagenscarnes/filemignon/filemignoncruinteiro.jpeg'),
  12: require('../assets/imagens/imagenscarnes/coxaomole/coxaomoleinteiro.png'),
  7: require('../assets/imagens/imagenscarnes/acem/aceminteirocru.jpeg'),
  9: require('../assets/imagens/imagenscarnes/paleta/Paletabovinainteiracrua.jpeg'),
  8: require('../assets/imagens/imagenscarnes/musculo/musculointeiro.png'),
  18: require('../assets/imagens/imagenscarnes/pontadepeito/peitobovino.webp'),
  10: require('../assets/imagens/imagenscarnes/patinho/patinhointeirocru.jpg'),
  17: require('../assets/imagens/imagenscarnes/patinho/coxaodurocortes.png'), // Coxão duro (sem pasta própria; a foto está na do patinho)
  16: require('../assets/imagens/imagenscarnes/lagarto/lagartointeirocru.jpg'),
};

// Foto da carne no catálogo (e no pódio e no detalhe): a dela; sem foto, a da primeira categoria
export function fotoDaCarne(c: { id: number; cat: string[] }) {
  return fotosDasCarnes[c.id] ?? imagensCategorias[c.cat[0]];
}
