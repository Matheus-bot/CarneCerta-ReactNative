import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import { useNavegacao } from './rotas';

export default function TelaCarrinho() {
  const { salvos, removerSalvo, carneById } = useApp();
  const navigation = useNavegacao();

  if (!salvos.length) {
    return (
      <Tela>
        <Titulo>Carrinho</Titulo>
        <Sub>
          Nenhuma recomendação salva ainda. Faça uma escolha e toque em "Salvar recomendação".
        </Sub>
        <Botao titulo="Escolher carne" onPress={() => navigation.popTo('Categorias')} />
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Carrinho</Titulo>
      {salvos.map((s, i) => (
        <Cartao key={s.id}>
          <Sub vermelho>
            Recomendação {i + 1} · {nomeCategoria(s.cat)}
          </Sub>
          {s.ids.map((id, k) => (
            <Texto key={id} style={styles.item}>
              {k + 1}. {carneById(id)?.nome}
            </Texto>
          ))}
          <Botao2 titulo="Remover" style={styles.remover} onPress={() => removerSalvo(s.id)} />
        </Cartao>
      ))}
      <Botao titulo="Nova escolha" onPress={() => navigation.popTo('Categorias')} />
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
