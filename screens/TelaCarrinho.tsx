import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import { detalheDoItem, formatarPeso } from '../data/escolha';
import { useNavegacao } from './rotas';

export default function TelaCarrinho() {
  const { salvos, removerSalvo, carneById } = useApp();
  const navigation = useNavegacao();

  if (!salvos.length) {
    return (
      <Tela>
        <Titulo>Carrinho</Titulo>
        <Sub>Nenhuma escolha no carrinho ainda.</Sub>
        <Botao titulo="Escolher carne" onPress={() => navigation.popTo('Categorias')} />
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Carrinho</Titulo>
      {salvos.map((s) => {
        const detalhe = detalheDoItem(s);
        return (
          <Cartao key={s.id}>
            <Sub vermelho>{nomeCategoria(s.preparo)}</Sub>
            <Texto style={styles.item}>
              {s.carnes.map((id) => carneById(id)?.nome).join(' + ')}
            </Texto>
            <Sub>
              {formatarPeso(s.peso, s.emKg)}
              {detalhe ? ` · ${detalhe}` : ''}
            </Sub>
            <Botao2 titulo="Remover" style={styles.remover} onPress={() => removerSalvo(s.id)} />
          </Cartao>
        );
      })}
      <Botao titulo="Finalizar" onPress={() => navigation.popTo('Ficha')} />
      <Botao2 titulo="Nova escolha" onPress={() => navigation.popTo('Categorias')} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  item: {
    fontWeight: '600',
    marginTop: 4,
  },
  remover: {
    marginTop: 10,
    marginBottom: 0,
  },
});
