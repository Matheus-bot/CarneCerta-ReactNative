import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao2, Cartao, Foto, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { criarItem, top3 } from '../data/escolha';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Recomendacao'>;

export default function TelaRecomendacao({ route, navigation }: Props) {
  const { escolha } = route.params;
  const { carnes, adicionarItem } = useApp();
  const top = top3(carnes, escolha);

  // Ao escolher uma das 3, a escolha vai para o carrinho com preparo, peso e espessura (ou tipo)
  function escolher(id: number) {
    adicionarItem(criarItem(escolha, [id], Date.now()));
    navigation.popTo('Carrinho');
  }

  return (
    <Tela
      estreita
      rodape={<Botao2 titulo="Nova escolha" onPress={() => navigation.popTo('Escolhas', {})} />}
    >
      <Titulo>Seu TOP 3</Titulo>
      {top.map((c, i) => (
        <Cartao key={c.id} onPress={() => escolher(c.id)}>
          <Foto nome={c.foto} />
          <Sub vermelho>#{i + 1}</Sub>
          <Texto style={styles.nome}>{c.nome}</Texto>
          <Sub>{c.desc}</Sub>
        </Cartao>
      ))}
    </Tela>
  );
}

const styles = StyleSheet.create({
  nome: {
    fontSize: 17,
    fontWeight: '600',
  },
});
