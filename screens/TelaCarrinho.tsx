import { Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import {
  detalheDoItem,
  fichaEmKg,
  fichaParaTela,
  formatarPeso,
  ItemCarrinho,
  pesoDoItem,
  pesoPorCarneDoBlend,
} from '../data/escolha';
import { fotoDaCarne } from '../data/imagensCategorias';
import { useNavegacao } from './rotas';

const web = Platform.OS === 'web';
const LARGURA_EMPILHAR = 640;

export default function TelaCarrinho() {
  const { salvos, removerSalvo, carneById } = useApp();
  const { cores } = useTema();
  const navigation = useNavegacao();
  const { width } = useWindowDimensions();

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

  function dadosDoItem(s: ItemCarrinho) {
    const detalhe = detalheDoItem(s);
    const cada = s.blend ? ` (${formatarPeso(pesoPorCarneDoBlend(s.pessoas), emKg)} de cada)` : '';
    const primeira = carneById(s.carnes[0]);
    return {
      foto: primeira ? fotoDaCarne(primeira) : undefined,
      nome: s.carnes.map((id) => carneById(id)?.nome).join(' + '),
      peso: `${formatarPeso(pesoDoItem(s), emKg)}${cada}${detalhe ? ` · ${detalhe}` : ''}`,
    };
  }

  if (web) {
    const empilhar = width < LARGURA_EMPILHAR;
    const { total } = fichaParaTela(salvos);
    return (
      <Tela>
        <Titulo>Carrinho</Titulo>
        <View style={[styles.colunas, empilhar && styles.colunasEmpilhadas]}>
          <View style={empilhar ? styles.colunaInteira : styles.lista}>
            {salvos.map((s) => {
              const { foto, nome, peso } = dadosDoItem(s);
              return (
                <Cartao key={s.id}>
                  <View style={styles.linha}>
                    {foto ? (
                      <Image source={foto} resizeMode="cover" style={styles.fotoWeb} />
                    ) : (
                      <View style={[styles.fotoWeb, { backgroundColor: cores.linha18 }]} />
                    )}
                    <View style={styles.info}>
                      <Sub style={[styles.categoria, { color: cores.laranjaLegivel }]}>
                        {nomeCategoria(s.preparo)}
                      </Sub>
                      <Texto style={styles.item}>{nome}</Texto>
                      <Sub>{peso}</Sub>
                    </View>
                  </View>
                  <Botao2
                    titulo="Remover"
                    accessibilityLabel={`Remover ${nome}`}
                    style={styles.remover}
                    onPress={() => removerSalvo(s.id)}
                  />
                </Cartao>
              );
            })}
          </View>
          <Cartao style={[styles.resumo, empilhar ? styles.colunaInteira : styles.resumoLado]}>
            <Titulo style={styles.resumoTitulo}>Resumo</Titulo>
            <View style={[styles.resumoLinha, { borderBottomColor: cores.linha18 }]}>
              <Sub>Itens</Sub>
              <Texto style={styles.resumoValor}>{salvos.length}</Texto>
            </View>
            <View style={[styles.resumoLinha, styles.resumoUltima]}>
              <Sub>Peso total</Sub>
              <Texto style={styles.resumoValor}>{total}</Texto>
            </View>
            <Pressable
              onPress={() => navigation.popTo('Ficha')}
              accessibilityRole="button"
              accessibilityLabel="Finalizar"
              style={[styles.finalizar, { backgroundColor: cores.laranjaLegivel }]}
            >
              <Texto style={[styles.finalizarTexto, { color: cores.botaoTexto }]}>Finalizar</Texto>
            </Pressable>
            <Botao2
              titulo="Nova escolha"
              style={styles.novaEscolha}
              onPress={() => navigation.popTo('Escolhas', {})}
            />
          </Cartao>
        </View>
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Carrinho</Titulo>
      {salvos.map((s) => {
        const { foto, nome, peso } = dadosDoItem(s);
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
                <Texto style={styles.item}>{nome}</Texto>
                <Sub>{peso}</Sub>
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
  fotoWeb: {
    width: 72,
    height: 72,
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
  colunas: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  colunasEmpilhadas: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0,
  },
  lista: {
    flex: 3,
    minWidth: 0,
  },
  colunaInteira: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
  },
  categoria: {
    fontWeight: '600',
  },
  resumo: {
    padding: 18,
  },
  resumoLado: {
    flex: 2,
    minWidth: 0,
  },
  resumoTitulo: {
    marginBottom: 8,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resumoUltima: {
    borderBottomWidth: 0,
    marginBottom: 12,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: '700',
  },
  finalizar: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  finalizarTexto: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  novaEscolha: {
    marginBottom: 0,
  },
});
