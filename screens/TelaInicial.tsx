import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useState } from 'react';
import Tela, { margemWeb } from '../components/Tela';
import {
  Botao,
  Cartao,
  Gradiente,
  Grade2,
  Icone,
  Secao,
  Sub,
  Texto,
} from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { Carne } from '../data/carnes';
import { categorias } from '../data/categorias';
import { imagensCategorias } from '../data/imagensCategorias';
import { useNavegacao } from './rotas';

// Carnes da "Amostra do catálogo" no protótipo
const AMOSTRA = [1, 2, 4, 10];

const web = Platform.OS === 'web';

// Web: espaço entre cartões e largura de referência de cada coluna da grade
const ESPACO_GRADE = 16;
const LARGURA_COLUNA = 200;

export default function TelaInicial() {
  const { carneById } = useApp();
  const { cores } = useTema();
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
      <Gradiente
        tipo="destaque"
        style={[
          styles.destaque,
          { borderColor: cores.bordaDestaque },
          web && [styles.destaqueWeb, { minHeight: Math.max(260, height * 0.4) }],
        ]}
      >
        <Image source={require('../assets/banner.png')} resizeMode="cover" style={styles.foto} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: cores.camadaBanner }]} />
        <Texto
          style={[
            styles.destaqueTitulo,
            { color: cores.sobreFoto },
            web && styles.destaqueTituloWeb,
          ]}
        >
          Qual carne você vai levar hoje?
        </Texto>
        <Sub style={[styles.destaqueSub, { color: cores.subSobreFoto }, web && styles.destaqueSubWeb]}>
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
                accessibilityLabel={c.nome}
                onPress={() => navigation.popTo('Escolhas', { cat: c.id })}
              >
                {imagensCategorias[c.id] ? (
                  <View style={[styles.categoriaWebCartao, styles.comFoto, { borderColor: cores.linha20 }]}>
                    <Image
                      source={imagensCategorias[c.id]}
                      resizeMode="cover"
                      style={styles.foto}
                    />
                    <View style={styles.faixaNome}>
                      <Texto style={[styles.nomeFotoWeb, { color: cores.sobreFoto }]}>{c.nome}</Texto>
                    </View>
                  </View>
                ) : (
                  <Gradiente
                    tipo="categoria"
                    style={[styles.categoriaWebCartao, { borderColor: cores.linha20 }]}
                  >
                    <Icone nome={c.icone} tamanho={64} cor={cores.vermelhoIcone} />
                    <Texto style={styles.categoriaWebNome}>{c.nome}</Texto>
                  </Gradiente>
                )}
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
              <Pressable
                key={c.id}
                accessibilityLabel={c.nome}
                onPress={() => navigation.popTo('Escolhas', { cat: c.id })}
              >
                {imagensCategorias[c.id] ? (
                  <View style={[styles.categoria, styles.comFoto, { borderColor: cores.linha20 }]}>
                    <Image
                      source={imagensCategorias[c.id]}
                      resizeMode="cover"
                      style={styles.foto}
                    />
                    <View style={styles.faixaNome}>
                      <Texto style={[styles.categoriaNome, { color: cores.sobreFoto }]}>
                        {c.nome}
                      </Texto>
                    </View>
                  </View>
                ) : (
                  <Gradiente tipo="categoria" style={[styles.categoria, { borderColor: cores.linha20 }]}>
                    <Icone nome={c.icone} tamanho={44} cor={cores.vermelhoIcone} />
                    <Texto style={styles.categoriaNome}>{c.nome}</Texto>
                  </Gradiente>
                )}
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
  destaque: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: 'hidden',
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
    aspectRatio: 4 / 3,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  categoriaNome: {
    fontSize: 17,
    fontWeight: '600',
  },
  // Card com foto: a imagem cobre o card inteiro e o nome fica numa faixa escura embaixo
  comFoto: {
    overflow: 'hidden',
  },
  foto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  faixaNome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  nomeFotoWeb: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Web: grade de categorias com cartões 4:3 e espaço de 16, alinhada à esquerda
  gradeWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: ESPACO_GRADE,
    marginBottom: 16,
  },
  categoriaWebCartao: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    borderWidth: 0.5,
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
