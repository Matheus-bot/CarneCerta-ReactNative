import { ComponentRef, useRef } from 'react';
import { Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Tela, { margemWeb } from '../components/Tela';
import { Cartao, Sub, Texto, Titulo } from '../components/ui';
import { InterpreteRef, InterpreteVLibras, TextoVLibras } from '../components/VLibrasWidget';

const TEXTO_PICANHA =
  'Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa.';

const TEXTO_ACEM =
  'Acém. É um corte bovino da parte do pescoço. É ideal para cozidos e ensopados. Fica macio quando cozinhado devagar, na panela.';

const web = Platform.OS === 'web';

// Web: carnes na metade esquerda e intérprete na direita a partir desta largura de janela;
// abaixo dela (e no celular), intérprete na parte de baixo
const LARGURA_LADO_A_LADO = 900;
// Margem lateral do conteúdo no celular (components/Tela.tsx, mainConteudo)
const MARGEM_CELULAR = 18;
const ESPACO_CARDS = web ? 16 : 10;
const ESPACO_INTERPRETE = 16;
// Foto do card: 60% da largura da coluna, entre 90 e 220
const FOTO_PROPORCAO = 0.6;
const FOTO_MINIMA = 90;
const FOTO_MAXIMA = 220;
// Intérprete embaixo: 42% da altura da janela, entre 260 e 420
const INTERPRETE_PROPORCAO = 0.42;
const INTERPRETE_MINIMO = 260;
const INTERPRETE_MAXIMO = 420;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.round(Math.min(Math.max(valor, minimo), maximo));

export default function TelaLibras() {
  const { width, height } = useWindowDimensions();
  const interprete = useRef<InterpreteRef>(null);
  const areaCarnes = useRef<ComponentRef<typeof View>>(null);

  const ladoALado = web && width >= LARGURA_LADO_A_LADO;
  const margem = web ? margemWeb(width) : MARGEM_CELULAR;
  // Largura das carnes: metade do que sobra ao lado do intérprete, ou a tela toda menos as margens
  const largura = ladoALado ? (width - 2 * margem - ESPACO_INTERPRETE) / 2 : width - 2 * margem;
  const coluna = (largura - ESPACO_CARDS) / 2;
  const alturaFoto = limitar(coluna * FOTO_PROPORCAO, FOTO_MINIMA, FOTO_MAXIMA);
  const alturaInterprete = limitar(height * INTERPRETE_PROPORCAO, INTERPRETE_MINIMO, INTERPRETE_MAXIMO);

  // Celular: tocar no card traduz no intérprete de baixo; na web o clique no texto já traduz
  const traduzir = (indice: number) => (web ? undefined : () => interprete.current?.traduzir(indice));

  return (
    <Tela
      painelAoLado={ladoALado}
      painel={
        <InterpreteVLibras
          ref={interprete}
          textos={[TEXTO_PICANHA, TEXTO_ACEM]}
          areaTexto={areaCarnes}
          style={
            ladoALado
              ? { marginLeft: ESPACO_INTERPRETE, marginRight: margem, marginTop: 4, marginBottom: 12 }
              : { flex: 0, height: alturaInterprete, marginHorizontal: margem, marginBottom: 10 }
          }
        />
      }
    >
      <View ref={areaCarnes}>
        <Titulo>Libras</Titulo>
        <Sub style={styles.instrucao}>
          Toque no ícone do VLibras e depois em Picanha para ouvir a tradução em Libras.
        </Sub>
        <View style={[styles.grade, { gap: ESPACO_CARDS }]}>
          <Pressable style={styles.coluna} onPress={traduzir(0)} disabled={web}>
            <Cartao style={styles.coluna}>
              <Image
                source={require('../assets/imagens/imagenscarnes/picanha/picanhainteiracrua.jpeg')}
                resizeMode="cover"
                style={[styles.foto, { height: alturaFoto }]}
              />
              <Texto style={styles.nome}>Picanha</Texto>
              <TextoVLibras conteudo={TEXTO_PICANHA} />
            </Cartao>
          </Pressable>
          <Pressable
            style={styles.coluna}
            onPress={traduzir(1)}
            disabled={web}
            accessible
            accessibilityLabel="Acém. Toque para ouvir em Libras"
          >
            <Cartao style={styles.coluna}>
              <Image
                source={require('../assets/imagens/imagenscarnes/acem/aceminteirocru.jpeg')}
                resizeMode="cover"
                style={[styles.foto, { height: alturaFoto }]}
              />
              <Texto style={styles.nome}>Acém</Texto>
              {web && <TextoVLibras conteudo={TEXTO_ACEM} invisivel />}
            </Cartao>
          </Pressable>
        </View>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  instrucao: {
    marginBottom: 12,
  },
  grade: {
    flexDirection: 'row',
  },
  coluna: {
    flex: 1,
  },
  foto: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
});
