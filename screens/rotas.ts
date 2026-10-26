import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Escolha } from '../data/escolha';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Inicio: undefined;
  Categorias: undefined;
  Escolhas: { cat?: string };
  Recomendacao: { escolha: Escolha };
  Carrinho: undefined;
  Ficha: undefined;
  Catalogo: undefined;
  Detalhe: { id: number; origem: 'catalogo' | 'libras' };
  Libras: undefined;
};

export function useNavegacao() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}
