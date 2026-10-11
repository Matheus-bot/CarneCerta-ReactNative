import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import {
  Botao,
  Cartao,
  Gradiente,
  Grade2,
  Icone,
  Secao,
  Sub,
  Texto,
  Titulo,
} from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { Carne } from '../data/carnes';
import { categorias } from '../data/categorias';
import { useNavegacao } from './rotas';

// Carnes da "Amostra do catálogo" no protótipo
const AMOSTRA = [1, 2, 4, 10];

export default function TelaInicial() {
  const { usuario, carneById } = useApp();
  const navigation = useNavegacao();
  const amostra = AMOSTRA.map(carneById).filter((c): c is Carne => !!c?.ativo);

  return (
    <Tela>
      <Sub>Olá,</Sub>
      <Titulo style={styles.semMargemTopo}>{usuario?.nome}</Titulo>

      <Gradiente tipo="destaque" style={styles.destaque}>
        <Texto style={styles.destaqueTitulo}>Qual carne você vai levar hoje?</Texto>
        <Sub style={styles.destaqueSub}>
          Responda algumas perguntas e descubra o corte ideal para o seu preparo.
        </Sub>
        <Botao
          titulo="Escolher carne para o meu preparo"
          onPress={() => navigation.popTo('Categorias')}
        />
      </Gradiente>

      <Secao titulo="Categorias" direita={<Sub>deslize</Sub>} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={174}
        decelerationRate="fast"
        contentContainerStyle={styles.carrossel}
      >
        {categorias.map((c) => (
          <Pressable key={c.id} onPress={() => navigation.popTo('Escolhas', { cat: c.id })}>
            <Gradiente tipo="categoria" style={styles.categoria}>
              <Icone nome={c.icone} tamanho={44} cor={cores.vermelhoIcone} />
              <Texto style={styles.categoriaNome}>{c.nome}</Texto>
            </Gradiente>
          </Pressable>
        ))}
      </ScrollView>

      <Secao
        titulo="Amostra do catálogo"
        direita={
          <Sub vermelho onPress={() => navigation.popTo('Catalogo')}>
            Ver todos
          </Sub>
        }
      />
      <Grade2>
        {amostra.map((c) => (
          <Cartao
            key={c.id}
            style={styles.semMargem}
            onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
          >
            <Texto style={styles.negrito}>{c.nome}</Texto>
          </Cartao>
        ))}
      </Grade2>
    </Tela>
  );
}

const styles = StyleSheet.create({
  semMargemTopo: {
    marginTop: 0,
  },
  destaque: {
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,90,82,0.45)',
    padding: 20,
    marginBottom: 14,
  },
  destaqueTitulo: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 29,
  },
  destaqueSub: {
    marginTop: 8,
    marginBottom: 16,
  },
  carrossel: {
    gap: 14,
    paddingBottom: 8,
  },
  categoria: {
    width: 160,
    height: 170,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  categoriaNome: {
    fontSize: 17,
    fontWeight: '600',
  },
  semMargem: {
    margin: 0,
    marginBottom: 0,
  },
  negrito: {
    fontWeight: '600',
  },
});
