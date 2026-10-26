import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import { formatarPeso, montarFicha } from '../data/escolha';
import { useNavegacao } from './rotas';

// Ficha para o açougueiro: itens iguais (mesmo corte e mesmo preparo) somados
export default function TelaFicha() {
  const { salvos, carneById } = useApp();
  const navigation = useNavegacao();
  const linhas = montarFicha(salvos);

  return (
    <Tela>
      <Titulo>Ficha para o açougueiro</Titulo>
      {linhas.map((l, i) => (
        <Cartao key={i}>
          <Texto style={styles.item}>{l.carnes.map((id) => carneById(id)?.nome).join(' + ')}</Texto>
          <Sub vermelho>{nomeCategoria(l.preparo)}</Sub>
          <Sub>
            {formatarPeso(l.peso, l.emKg)}
            {l.detalhe ? ` · ${l.detalhe}` : ''}
          </Sub>
        </Cartao>
      ))}
      <Botao2 titulo="Voltar" onPress={() => navigation.popTo('Carrinho')} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  item: {
    fontWeight: '600',
  },
});
