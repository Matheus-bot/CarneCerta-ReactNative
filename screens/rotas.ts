import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FichaSalva } from '../data/banco';
import { Escolha } from '../data/escolha';

export type RootStackParamList = {
  Splash: undefined;
  Inicio: undefined;
  Escolhas: { cat?: string };
  Recomendacao: { escolha: Escolha };
  Carrinho: undefined;
  Ficha: undefined;
  FichasSalvas: undefined;
  // Mesma TelaFicha, com os dados guardados no lugar do carrinho atual
  FichaSalva: { ficha: FichaSalva };
  Catalogo: undefined;
  Detalhe: { id: number; origem: 'catalogo' | 'libras' };
  Libras: undefined;
};

export function useNavegacao() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}
