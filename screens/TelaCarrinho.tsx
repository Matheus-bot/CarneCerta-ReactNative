import { Image, StyleSheet, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import {
  detalheDoItem,
  fichaEmKg,
  formatarPeso,
  pesoDoItem,
  pesoPorCarneDoBlend,
} from '../data/escolha';
import { fotoDaCarne } from '../data/imagensCategorias';
import { useNavegacao } from './rotas';

export default function TelaCarrinho() {
  const { salvos, removerSalvo, carneById } = useApp();
  const { cores } = useTema();
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
        const primeira = carneById(s.carnes[0]);
        const foto = primeira ? fotoDaCarne(primeira) : undefined;
        const cada = s.blend ? ` (${formatarPeso(pesoPorCarneDoBlend(s.pessoas), emKg)} de cada)` : '';
        return (
          <Cartao key={s.id}>
            <View style={styles.linha}>
              {foto ? (
                <Image source={foto} resizeMode="cover" style={styles.foto} />
              ) : (
                <View style={[styles.foto, { backgroundColor: cores.linha18 }]} />
              )}
              <View style={styles.info}>
                <Sub vermelho>{nomeCategoria(s.preparo)}</Sub>
                <Texto style={styles.item}>
                  {s.carnes.map((id) => carneById(id)?.nome).join(' + ')}
                </Texto>
                <Sub>
                  {formatarPeso(pesoDoItem(s), emKg)}
                  {cada}
                  {detalhe ? ` · ${detalhe}` : ''}
                </Sub>
              </View>
            </View>
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
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foto: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  item: {
    fontWeight: '600',
    marginTop: 4,
  },
  remover: {
    marginTop: 10,
    marginBottom: 0,
  },
});
