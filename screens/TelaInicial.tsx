import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useState } from 'react';
import Tela, { margemWeb } from '../components/Tela';
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

const web = Platform.OS === 'web';

// Web: espaço entre cartões e largura de referência de cada coluna da grade
const ESPACO_GRADE = 16;
const LARGURA_COLUNA = 200;

export default function TelaInicial() {
  const { usuario, carneById } = useApp();
  const navigation = useNavegacao();
  const { width, height } = useWindowDimensions();
  const amostra = AMOSTRA.map(carneById).filter((c): c is Carne => !!c?.ativo);

  // Largura real da grade (desconta a barra de rolagem); antes da medição, usa a janela
  const [larguraGrade, setLarguraGrade] = useState(0);
  const disponivel = larguraGrade || width - 2 * margemWeb(width);
  const colunas = Math.max(2, Math.floor(disponivel / LARGURA_COLUNA));
  const larguraCartao = Math.floor((disponivel - ESPACO_GRADE * (colunas - 1)) / colunas);

  return (
    <Tela>
      <Sub>Olá,</Sub>
      <Titulo style={styles.semMargemTopo}>{usuario?.nome}</Titulo>

      <Gradiente
        tipo="destaque"
        style={[
          styles.destaque,
          web && [styles.destaqueWeb, { minHeight: Math.max(260, height * 0.4) }],
        ]}
      >
        <Texto style={[styles.destaqueTitulo, web && styles.destaqueTituloWeb]}>
          Qual carne você vai levar hoje?
        </Texto>
        <Sub style={[styles.destaqueSub, web && styles.destaqueSubWeb]}>
          Responda algumas perguntas e descubra o corte ideal para o seu preparo.
        </Sub>
        <Botao
          titulo="Escolher carne para o meu preparo"
          grande={web}
          onPress={() => navigation.popTo('Escolhas', {})}
        />
      </Gradiente>

      {web ? (
        <>
          {/* Web: grade com número de colunas calculado pela largura, no lugar do carrossel */}
          <Secao titulo="Categorias" />
          <View
            style={styles.gradeWeb}
            onLayout={(e) => setLarguraGrade(e.nativeEvent.layout.width)}
          >
            {categorias.map((c) => (
              <Pressable
                key={c.id}
                style={{ width: larguraCartao }}
                onPress={() => navigation.popTo('Escolhas', { cat: c.id })}
              >
                <Gradiente tipo="categoria" style={styles.categoriaWebCartao}>
                  <Icone nome={c.icone} tamanho={64} cor={cores.vermelhoIcone} />
                  <Texto style={styles.categoriaWebNome}>{c.nome}</Texto>
                </Gradiente>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
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
        </>
      )}

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
  // Web: conteúdo centralizado; título e subtítulo maiores que no celular (22 → 44 e 13 → 18)
  destaqueWeb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  destaqueTituloWeb: {
    fontSize: 44,
    lineHeight: 54,
    textAlign: 'center',
  },
  destaqueSubWeb: {
    fontSize: 18,
    lineHeight: 26,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
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
  // Web: grade de categorias com cartões quadrados e espaço de 16, alinhada à esquerda
  gradeWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: ESPACO_GRADE,
    marginBottom: 16,
  },
  categoriaWebCartao: {
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriaWebNome: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    fontSize: 20,
    fontWeight: '700',
  },
  semMargem: {
    margin: 0,
    marginBottom: 0,
  },
  negrito: {
    fontWeight: '600',
  },
});
