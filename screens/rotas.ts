import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Gostos: undefined;
  Inicio: undefined;
  Categorias: undefined;
  Escolhas: { cat: string };
  Recomendacao: { cat: string; ids: number[] };
  Carrinho: undefined;
  Catalogo: undefined;
  Detalhe: { id: number; origem: 'catalogo' | 'libras' };
  Libras: undefined;
  Admin: undefined;
};

export function useNavegacao() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}
