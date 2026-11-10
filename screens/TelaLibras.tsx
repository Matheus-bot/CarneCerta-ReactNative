import { ComponentRef, useRef } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Tela, { margemWeb } from '../components/Tela';
import { Cartao, Sub, Texto, Titulo } from '../components/ui';
import { InterpreteRef, InterpreteVLibras, TextoVLibras } from '../components/VLibrasWidget';

const TEXTO_PICANHA =
  'Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa.';

const TEXTO_ACEM =
  'Acém. É um corte bovino da parte do pescoço. É ideal para cozidos e ensopados. Fica macio quando cozinhado devagar, na panela.';

// Paleta e Fraldinha: nome + descrição do catálogo (data/carnes.ts)
const TEXTO_PALETA = 'Paleta. Bom para cozidos e assados lentos.';

const TEXTO_FRALDINHA = 'Fraldinha. Muito saborosa e suculenta, ótima para grelha.';

// Carnes da tela, em linhas de duas. Todas seguem o card do Acém: foto e nome, com a descrição
// invisível por cima do card (web) para o VLibras traduzir ao tocar; no celular o toque traduz
// no intérprete de baixo
const CARNES: { nome: string; texto: string; foto: ImageSourcePropType }[] = [
  {
    nome: 'Picanha',
    texto: TEXTO_PICANHA,
    foto: require('../assets/imagens/imagenscarnes/picanha/picanhainteiracrua.jpeg'),
  },
  {
    nome: 'Acém',
    texto: TEXTO_ACEM,
    foto: require('../assets/imagens/imagenscarnes/acem/aceminteirocru.jpeg'),
  },
  {
    nome: 'Paleta',
    texto: TEXTO_PALETA,
    foto: require('../assets/imagens/imagenscarnes/paleta/Paletabovinainteiracrua.jpeg'),
  },
  {
    nome: 'Fraldinha',
    texto: TEXTO_FRALDINHA,
    foto: require('../assets/imagens/imagenscarnes/fraldinha/fraldinhainteiracrua03.jpg'),
  },
];
const LINHAS = [CARNES.slice(0, 2), CARNES.slice(2, 4)];

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
// Web lado a lado: as duas linhas de cards cabem na altura da janela. Desconta o cabeçalho (68),
// a barra inferior (62), o espaço da rolagem (16) e o título com a instrução (100); cada card
// tem, além da foto, 79 (padding 24, espaço 10, nome 35 e margem 10)
const DESCONTO_ALTURA_WEB = 68 + 62 + 16 + 100;
const CARD_SEM_FOTO = 79;

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
  const fotoMaxima = ladoALado
    ? Math.min(FOTO_MAXIMA, (height - DESCONTO_ALTURA_WEB) / LINHAS.length - CARD_SEM_FOTO)
    : FOTO_MAXIMA;
  const alturaFoto = limitar(coluna * FOTO_PROPORCAO, FOTO_MINIMA, Math.max(FOTO_MINIMA, fotoMaxima));
  const alturaInterprete = limitar(height * INTERPRETE_PROPORCAO, INTERPRETE_MINIMO, INTERPRETE_MAXIMO);

  // Celular: tocar no card traduz no intérprete de baixo; na web o clique no texto já traduz
  const traduzir = (indice: number) => (web ? undefined : () => interprete.current?.traduzir(indice));

  return (
    <Tela
      painelAoLado={ladoALado}
      painel={
        <InterpreteVLibras
          ref={interprete}
          textos={CARNES.map((c) => c.texto)}
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
        {LINHAS.map((linha, l) => (
          <View key={l} style={[styles.grade, { gap: ESPACO_CARDS }]}>
            {linha.map((c, k) => (
              <Pressable
                key={c.nome}
                style={styles.coluna}
                onPress={traduzir(l * 2 + k)}
                disabled={web}
                accessible
                accessibilityLabel={`${c.nome}. Toque para ouvir em Libras`}
              >
                <Cartao style={styles.coluna}>
                  <Image source={c.foto} resizeMode="cover" style={[styles.foto, { height: alturaFoto }]} />
                  <Texto style={styles.nome}>{c.nome}</Texto>
                  {web && <TextoVLibras conteudo={c.texto} invisivel />}
                </Cartao>
              </Pressable>
            ))}
          </View>
        ))}
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
