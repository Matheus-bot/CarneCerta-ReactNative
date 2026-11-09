import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import {
  detalheDoItem,
  fichaEmKg,
  formatarPeso,
  pesoDoItem,
  pesoPorCarneDoBlend,
} from '../data/escolha';
import { useNavegacao } from './rotas';

export default function TelaCarrinho() {
  const { salvos, removerSalvo, carneById } = useApp();
  const navigation = useNavegacao();

  if (!salvos.length) {
    return (
      <Tela>
        <Titulo>Carrinho</Titulo>
        <Sub>Nenhuma escolha no carrinho ainda.</Sub>
        <Botao titulo="Escolher carne" onPress={() => navigation.popTo('Escolhas', {})} />
      </Tela>
    );
  }

  // Peso recalculado com as regras atuais; unidade decidida pelo carrinho inteiro, como na ficha
  const emKg = fichaEmKg(salvos);

  return (
    <Tela>
      <Titulo>Carrinho</Titulo>
      {salvos.map((s) => {
        const detalhe = detalheDoItem(s);
        const cada = s.blend ? ` (${formatarPeso(pesoPorCarneDoBlend(s.pessoas), emKg)} de cada)` : '';
        return (
          <Cartao key={s.id}>
            <Sub vermelho>{nomeCategoria(s.preparo)}</Sub>
            <Texto style={styles.item}>
              {s.carnes.map((id) => carneById(id)?.nome).join(' + ')}
            </Texto>
            <Sub>
              {formatarPeso(pesoDoItem(s), emKg)}
              {cada}
              {detalhe ? ` · ${detalhe}` : ''}
            </Sub>
            <Botao2 titulo="Remover" style={styles.remover} onPress={() => removerSalvo(s.id)} />
          </Cartao>
        );
      })}
      <Botao titulo="Finalizar" onPress={() => navigation.popTo('Ficha')} />
      <Botao2 titulo="Nova escolha" onPress={() => navigation.popTo('Escolhas', {})} />
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
