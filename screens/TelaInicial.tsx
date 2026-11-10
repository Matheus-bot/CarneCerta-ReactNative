import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { ComponentRef, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Tela, { margemWeb } from '../components/Tela';
import { estilosInicio, FONTE_CORPO, FONTE_TITULO } from '../components/tema';
import { Grade2, Icone } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { Carne } from '../data/carnes';
import { Categoria, categorias } from '../data/categorias';
import { imagensCategorias } from '../data/imagensCategorias';
import { useNavegacao } from './rotas';
import IconeAlcatra from '../assets/icones/carnes/alcatra.svg';
import IconeContraFile from '../assets/icones/carnes/contra-file.svg';
import IconePatinho from '../assets/icones/carnes/patinho.svg';
import IconePicanha from '../assets/icones/carnes/picanha.svg';

// Carnes da "Amostra do catálogo" no protótipo
const AMOSTRA = [1, 2, 4, 10];

// Ícones de desenho da amostra (assets/icones/carnes/), pelo id da carne
const ICONES_AMOSTRA: Partial<Record<number, typeof IconePicanha>> = {
  1: IconePicanha,
  2: IconeAlcatra,
  4: IconeContraFile,
  10: IconePatinho,
};
const TAMANHO_ICONE = 48;

const web = Platform.OS === 'web';

// Categorias em órbita: anel 3D com as 6 categorias, 60 graus cada (6 × 60 = 360)
const PASSO_ANEL = 360 / 6;
// Margem lateral do conteúdo da Início no celular (components/Tela.tsx, mainConteudoNovo)
const MARGEM_CELULAR = 20;
// Card: 34% da largura do anel, no máximo 170 (web) / 150 (celular)
const CARD_PROPORCAO = 0.34;
const CARD_MAXIMO = web ? 170 : 150;
// Raio: proporcional à largura (44% na web, 38% no celular), no máximo 1,3 × o card.
// Conferido para o card mais largo não passar da borda: celular 0,38 × 0,866 + 0,9 × 0,17 = 0,48 da largura;
// web (perspectiva = 3 × raio, card a 60° com escala 0,857) 0,44 × 0,742 + 0,857 × 0,17 = 0,47 da largura
const RAIO_PROPORCAO = web ? 0.44 : 0.38;
const RAIO_MAXIMO_EM_CARDS = 1.3;
// Os cards de trás sobem até 18% do card, para o anel aparecer
const SUBIDA = 0.18;
// Altura do nome embaixo da foto (padding 8 + 10 e a linha do texto)
const ALTURA_NOME = 38;
// Arrastar: só vira giro depois de 6 px na horizontal (abaixo disso é toque no card)
const LIMIAR_ARRASTE = 6;
// Roda do mouse na horizontal (web): graus por unidade de rolagem
const GRAUS_POR_RODA = 0.25;
// Giro automático: uma volta em 60 s (cada card ~10 s à frente)
const GIRO_AUTOMATICO = -360 / 60; // graus por segundo
// Depois de soltar: inércia leve (constante de tempo, s) e volta ao automático após 3 s sem toque
const INERCIA = 0.6;
const VOLTA_AO_AUTOMATICO = 3000; // ms
// Troca suave entre velocidades (pausa e retomada do automático), s
const SUAVIZACAO = 0.5;
// Limite da velocidade depois de um arraste rápido: 2 voltas por segundo
const VELOCIDADE_MAXIMA = 720;
// Toque no card logo depois de um arraste não abre a categoria (ms)
const IGNORAR_TOQUE_APOS_ARRASTE = 400;
// Web: banner (5,5 partes) à esquerda e categorias (6,5 partes) à direita a partir desta largura de janela
const LARGURA_DUAS_COLUNAS = 900;
const ESPACO_COLUNAS = 24;
const PARTES_BANNER = 5.5;
const PARTES_CATEGORIAS = 6.5;
// Web em duas colunas: banner e categorias ocupam a altura da janela menos o cabeçalho (56),
// a barra inferior (64), o espaço acima do conteúdo (4) e uma folga embaixo (16)
const DESCONTO_ALTURA = 56 + 64 + 4 + 16;
// Banner: metade da altura da janela, no mínimo 300
const BANNER_PROPORCAO_ALTURA = 0.5;
const BANNER_MINIMO = 300;
// Rótulo "Categorias" acima do anel (margem 24 + linha 16 + margem 12)
const ALTURA_ROTULO = 52;

// Estilo de docs/referencia/tela-inicial.html (medidas para 390 px de largura)
export default function TelaInicial() {
  const { carneById, tema } = useApp();
  const e = estilosInicio[tema];
  const navigation = useNavegacao();
  const { width, height } = useWindowDimensions();
  const amostra = AMOSTRA.map(carneById).filter((c): c is Carne => !!c?.ativo);

  // Web larga: banner à esquerda e categorias girando à direita
  const duasColunas = web && width >= LARGURA_DUAS_COLUNAS;
  const alturaArea = Math.max(height - DESCONTO_ALTURA, 0);
  const alturaBanner = Math.min(alturaArea, Math.max(BANNER_MINIMO, height * BANNER_PROPORCAO_ALTURA));

  // Largura real do anel (desconta a barra de rolagem); antes da medição, estima pela janela menos as
  // margens (nas duas colunas, a parte das categorias do que sobra depois do espaço entre elas)
  const [larguraAnel, setLarguraAnel] = useState(0);
  const conteudo = width - 2 * (web ? margemWeb(width) : MARGEM_CELULAR);
  const disponivel =
    larguraAnel ||
    (duasColunas
      ? ((conteudo - ESPACO_COLUNAS) * PARTES_CATEGORIAS) / (PARTES_BANNER + PARTES_CATEGORIAS)
      : conteudo);

  // Rótulo de seção: DM Sans 12 negrito, maiúsculas, na cor do rótulo
  const secao = (titulo: string, direita?: ReactNode) => (
    <View style={styles.secao}>
      <Text style={[styles.rotuloSecao, { color: e.rotulo }]}>{titulo}</Text>
      {direita}
    </View>
  );

  // Cartão de categoria: foto quadrada em cima e o nome embaixo
  // tamanho: largura do card no anel; a foto recebe a mesma altura (na web, o Image sem altura
  // explícita usa a altura natural do arquivo e o card sai comprido)
  const cartaoCategoria = (c: Categoria, tamanho: number) => (
    <View style={[styles.categoria, { backgroundColor: e.cartao, borderColor: e.borda }]}>
      {imagensCategorias[c.id] ? (
        <Image
          source={imagensCategorias[c.id]}
          resizeMode="cover"
          style={[styles.categoriaFoto, { height: tamanho }]}
        />
      ) : (
        <View style={[styles.categoriaFoto, styles.categoriaSemFoto, { height: tamanho }]}>
          <Icone nome={c.icone} tamanho={36} cor={e.destaque} />
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[
          e.nomeCategoriaBebas ? styles.categoriaNomeBebas : styles.categoriaNome,
          { color: e.principal },
        ]}
      >
        {c.nome}
      </Text>
    </View>
  );

  const irParaCategoria = (c: Categoria) => navigation.popTo('Escolhas', { cat: c.id });

  // Itens do anel: criados uma vez por tema (o anel muda só a posição a cada quadro)
  const itensOrbita = useMemo(
    () =>
      categorias.map((c) => ({
        chave: c.id,
        rotulo: c.nome,
        conteudo: (tamanho: number) => cartaoCategoria(c, tamanho),
        aoTocar: () => irParaCategoria(c),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tema],
  );

  return (
    <Tela>
      <View style={duasColunas && [styles.linhaWeb, { minHeight: alturaArea }]}>
        <View
          style={[
            styles.banner,
            { backgroundColor: e.cartao },
            web && [styles.bannerWeb, { minHeight: Math.max(260, height * 0.4) }],
            duasColunas && [styles.colunaBanner, { minHeight: alturaBanner }],
          ]}
        >
          <Image source={require('../assets/banner.png')} resizeMode="cover" style={styles.bannerFoto} />
          {/* Gradiente escuro sobre a foto: mais forte embaixo, onde ficam os textos e o botão */}
          <LinearGradient colors={e.faixaFoto} style={StyleSheet.absoluteFill} />
          <Text style={[styles.bannerTexto, { color: e.sobreFoto }, web && styles.centro]}>
            Responda algumas perguntas e descubra o corte ideal para o seu preparo.
          </Text>
          <Text style={[styles.bannerTitulo, { color: e.sobreFoto }, web && [styles.bannerTituloWeb, styles.centro]]}>
            Qual carne você vai levar hoje?
          </Text>
          <Pressable
            onPress={() => navigation.popTo('Escolhas', {})}
            accessibilityRole="button"
            accessibilityLabel="Escolher carne para o meu preparo"
            style={({ pressed }) => [
              styles.botao,
              web && styles.botaoWeb,
              { backgroundColor: e.degradeBotao ? undefined : e.destaque },
              e.sombraBotao && { boxShadow: e.sombraBotao },
              pressed && styles.pressionado,
            ]}
          >
            {/* Tema claro: degradê laranja atrás do texto, com o mesmo arredondamento do botão */}
            {e.degradeBotao && <LinearGradient {...e.degradeBotao} style={[StyleSheet.absoluteFill, styles.botaoDegrade]} />}
            <Text style={[styles.botaoTexto, { color: e.textoSobreDestaque }]}>
              Escolher carne para o meu preparo
            </Text>
          </Pressable>
        </View>

        <View style={duasColunas && styles.colunaCategorias}>
          {secao('Categorias')}
          <Orbita
            largura={disponivel}
            aoMedir={setLarguraAnel}
            itens={itensOrbita}
            alturaMaxima={duasColunas ? alturaArea - ALTURA_ROTULO : undefined}
          />
        </View>
      </View>

      {secao(
        'Amostra do catálogo',
        <Text style={[styles.verTodos, { color: e.destaque }]} onPress={() => navigation.popTo('Catalogo')}>
          Ver todos
        </Text>,
      )}
      {web ? (
        // Web: faixa compacta, quatro itens em linha com o ícone ao lado do nome
        <View style={styles.faixaAmostra}>
          {amostra.map((c) => {
            const IconeCarne = ICONES_AMOSTRA[c.id];
            return (
              <Pressable
                key={c.id}
                onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
              >
                <View
                  style={[
                    styles.itemAmostra,
                    !IconeCarne && styles.itemAmostraSemIcone,
                    { backgroundColor: e.cartao, borderColor: e.borda },
                  ]}
                >
                  {IconeCarne && <IconeCarne width={TAMANHO_ICONE} height={TAMANHO_ICONE} />}
                  <Text style={[styles.itemAmostraNome, { color: e.principal }]}>{c.nome}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        // Celular: a grade de antes, com o ícone ao lado de cada nome
        <Grade2>
          {amostra.map((c) => {
            const IconeCarne = ICONES_AMOSTRA[c.id];
            return (
              <Pressable
                key={c.id}
                onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
              >
                <View
                  style={[
                    styles.cartao,
                    styles.cartaoComIcone,
                    { backgroundColor: e.cartao, borderColor: e.borda },
                  ]}
                >
                  {IconeCarne && <IconeCarne width={TAMANHO_ICONE} height={TAMANHO_ICONE} />}
                  <Text style={[styles.cartaoNome, { color: e.texto }]}>{c.nome}</Text>
                </View>
              </Pressable>
            );
          })}
        </Grade2>
      )}
    </Tela>
  );
}

type ItemOrbita = {
  chave: string;
  rotulo: string;
  conteudo: (tamanho: number) => ReactNode; // recebe a largura do card
  aoTocar: () => void;
};

// Anel de categorias que gira sozinho, devagar (uma volta em 60 s).
// Arrastar (dedo ou mouse) gira junto e, ao soltar, segue com inércia leve na velocidade do arraste;
// depois de 3 s sem toque, volta ao giro lento. Com o dedo ou o mouse sobre o anel, o giro automático para.
// Movimento reduzido no sistema: o anel fica parado e só gira com o arraste (sem inércia).
// Tocar num card continua abrindo a categoria.
// alturaMaxima (web em duas colunas): o card cresce com a largura até o anel caber nesta altura,
// sem o limite de 170
function Orbita({
  largura,
  aoMedir,
  itens,
  alturaMaxima,
}: {
  largura: number;
  aoMedir: (largura: number) => void;
  itens: ItemOrbita[];
  alturaMaxima?: number;
}) {
  const focada = useIsFocused();
  const [giro, setGiro] = useState(0); // graus
  const anelRef = useRef<ComponentRef<typeof View>>(null);

  // Estado do movimento, fora do React (muda a cada quadro)
  const mov = useRef({
    angulo: 0, // graus
    velocidade: GIRO_AUTOMATICO, // graus por segundo
    arrastando: false,
    sobre: false, // dedo ou mouse sobre o anel
    ultimoToque: -Infinity, // ms (performance.now / Date.now)
    inicioArraste: 0,
    reduzir: false, // movimento reduzido do sistema
    fimArraste: -Infinity, // ms: soltar um arraste em cima de um card não conta como toque
  });

  const cardMaximo =
    alturaMaxima === undefined
      ? CARD_MAXIMO
      : Math.max(CARD_MAXIMO, Math.floor((alturaMaxima - ALTURA_NOME - 8) / (1 + SUBIDA)));
  const card = Math.min(Math.floor(largura * CARD_PROPORCAO), cardMaximo);
  const raio = Math.min(largura * RAIO_PROPORCAO, card * RAIO_MAXIMO_EM_CARDS);
  const alturaCard = card + ALTURA_NOME;
  const subidaMaxima = card * SUBIDA;
  // Altura do bloco: o card da frente inteiro mais a subida dos de trás
  const altura = Math.ceil(alturaCard + subidaMaxima + 8);

  // Graus por pixel arrastado: o card da frente acompanha o dedo (arco = raio × ângulo)
  const grausPorPixel = useRef(0);
  grausPorPixel.current = 180 / (Math.PI * Math.max(raio, 1));

  // Movimento reduzido do sistema (no celular e, na web, pelo prefers-reduced-motion)
  useEffect(() => {
    const aplicar = (ativo: boolean) => {
      mov.current.reduzir = ativo;
      if (ativo) mov.current.velocidade = 0;
    };
    AccessibilityInfo.isReduceMotionEnabled().then(aplicar);
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', aplicar);
    return () => assinatura.remove();
  }, []);

  // Um quadro por vez enquanto a tela está visível: atualiza a velocidade e o ângulo
  useEffect(() => {
    if (!focada) return;
    let quadro = 0;
    let anterior = Date.now();
    const passo = () => {
      const agora = Date.now();
      const dt = Math.min((agora - anterior) / 1000, 0.1); // s; limita saltos depois de pausas
      anterior = agora;
      const m = mov.current;
      if (!m.arrastando) {
        const semToque = agora - m.ultimoToque;
        if (m.reduzir) {
          m.velocidade = 0;
        } else if (semToque < VOLTA_AO_AUTOMATICO) {
          // Inércia: a velocidade do arraste vai diminuindo
          m.velocidade *= Math.exp(-dt / INERCIA);
        } else {
          // Giro automático; pausado com o dedo ou o mouse sobre o anel. Troca suave de velocidade
          const alvo = m.sobre ? 0 : GIRO_AUTOMATICO;
          m.velocidade += (alvo - m.velocidade) * (1 - Math.exp(-dt / SUAVIZACAO));
        }
        if (m.velocidade !== 0) {
          m.angulo += m.velocidade * dt;
          setGiro(m.angulo);
        }
      }
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [focada]);

  const arraste = useRef(
    PanResponder.create({
      // Só assume com movimento horizontal claro; toque simples e rolagem vertical ficam com a tela
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > LIMIAR_ARRASTE && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        mov.current.arrastando = true;
        mov.current.inicioArraste = mov.current.angulo;
        mov.current.velocidade = 0;
      },
      onPanResponderMove: (_, g) => {
        mov.current.angulo = mov.current.inicioArraste + g.dx * grausPorPixel.current;
        setGiro(mov.current.angulo);
      },
      // Ao soltar: continua na velocidade do arraste (px/ms → graus/s), com limite
      onPanResponderRelease: (_, g) => soltar(g.vx),
      onPanResponderTerminate: (_, g) => soltar(g.vx),
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  function soltar(vx: number) {
    const m = mov.current;
    m.arrastando = false;
    m.ultimoToque = Date.now();
    m.fimArraste = Date.now();
    const velocidade = vx * 1000 * grausPorPixel.current;
    m.velocidade = m.reduzir ? 0 : Math.max(-VELOCIDADE_MAXIMA, Math.min(VELOCIDADE_MAXIMA, velocidade));
  }

  // Dedo sobre o anel (celular): pausa o automático; ao tirar, conta os 3 s
  // (encostar o dedo também segura o anel se ele ainda estiver girando por inércia)
  const tocar = () => {
    mov.current.sobre = true;
    mov.current.velocidade = 0;
  };
  const largar = () => {
    mov.current.sobre = false;
    mov.current.ultimoToque = Math.max(mov.current.ultimoToque, Date.now() - VOLTA_AO_AUTOMATICO);
  };

  // Web: mouse sobre o anel pausa o giro automático; a roda na horizontal (trackpad) gira o anel
  useEffect(() => {
    if (!web) return;
    const elemento = anelRef.current as unknown as HTMLElement | null;
    if (!elemento?.addEventListener) return;
    const entrar = () => {
      mov.current.sobre = true;
    };
    const sair = () => {
      mov.current.sobre = false;
    };
    const aoRolar = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return; // rolagem vertical continua rolando a página
      ev.preventDefault();
      mov.current.angulo -= ev.deltaX * GRAUS_POR_RODA;
      mov.current.velocidade = 0;
      mov.current.ultimoToque = Date.now();
      setGiro(mov.current.angulo);
    };
    elemento.addEventListener('pointerenter', entrar);
    elemento.addEventListener('pointerleave', sair);
    elemento.addEventListener('wheel', aoRolar, { passive: false });
    return () => {
      elemento.removeEventListener('pointerenter', entrar);
      elemento.removeEventListener('pointerleave', sair);
      elemento.removeEventListener('wheel', aoRolar);
    };
  }, []);

  // Os cards só mudam com o tamanho; a cada quadro muda só a posição
  const conteudos = useMemo(() => itens.map((item) => item.conteudo(card)), [itens, card]);

  return (
    <View
      ref={anelRef}
      style={[styles.orbita, { height: altura }]}
      onLayout={(ev) => aoMedir(ev.nativeEvent.layout.width)}
      onTouchStart={tocar}
      onTouchEnd={largar}
      onTouchCancel={largar}
      {...arraste.panHandlers}
    >
      {itens.map((item, i) => {
        const angulo = giro + i * PASSO_ANEL;
        const rad = (angulo * Math.PI) / 180;
        const frente = (1 + Math.cos(rad)) / 2; // 1 na frente, 0 atrás
        const subida = -(1 - frente) * subidaMaxima;
        // Web: 3D com CSS. O card vai para o anel (rotateY + translateZ) e volta a ficar de frente
        // (rotateY ao contrário), para o texto não aparecer espelhado; a perspectiva dá a escala.
        // Celular: posição X = seno × raio e escala pela profundidade (cosseno)
        const transform = web
          ? [
              { perspective: raio * 3 },
              { translateY: subida },
              { translateZ: -raio },
              { rotateY: `${angulo}deg` },
              { translateZ: raio },
              { rotateY: `${-angulo}deg` },
            ]
          : [{ translateX: Math.sin(rad) * raio }, { translateY: subida }, { scale: 0.6 + 0.4 * frente }];
        return (
          <Pressable
            key={item.chave}
            accessibilityLabel={item.rotulo}
            onPress={() => {
              // Na web, soltar o mouse depois de arrastar também gera um clique no card: ignora
              if (mov.current.arrastando || Date.now() - mov.current.fimArraste < IGNORAR_TOQUE_APOS_ARRASTE) return;
              item.aoTocar();
            }}
            style={[
              styles.orbitaItem,
              {
                width: card,
                left: largura / 2 - card / 2,
                top: subidaMaxima,
                zIndex: Math.round(frente * 100),
                opacity: 0.45 + 0.55 * frente,
                transform,
              },
            ]}
          >
            {conteudos[i]}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Banner: altura 232, raio 20, padding 20, conteúdo embaixo
  banner: {
    height: 232,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'flex-end',
  },
  // Web: banner mais alto e conteúdo centralizado, como antes
  bannerWeb: {
    height: undefined,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerFoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerTexto: {
    fontFamily: FONTE_CORPO.normal,
    fontSize: 13,
    lineHeight: 17,
    opacity: 0.92,
  },
  // Bebas Neue tem um peso só: fontWeight normal evita o negrito falso
  bannerTitulo: {
    fontFamily: FONTE_TITULO,
    fontWeight: 'normal',
    fontSize: 40,
    lineHeight: 40,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 14,
  },
  bannerTituloWeb: {
    fontSize: 64,
    lineHeight: 64,
  },
  centro: {
    textAlign: 'center',
  },
  botao: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  botaoDegrade: {
    borderRadius: 999,
  },
  botaoWeb: {
    alignSelf: 'center',
  },
  botaoTexto: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 14,
  },
  pressionado: {
    opacity: 0.85,
  },
  // Rótulo de seção: margem 24 acima e 12 abaixo; espaçamento 0.06 em de 12 px = 0.72
  secao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  rotuloSecao: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 12,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  verTodos: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 12,
  },
  // Categoria: raio 16, borda 1, foto quadrada e nome com padding 8 10 10
  categoria: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoriaFoto: {
    width: '100%',
    aspectRatio: 1,
  },
  categoriaSemFoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriaNome: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 12,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  // Tema escuro: Bebas 17, espaçamento 0.04 em = 0.68
  categoriaNomeBebas: {
    fontFamily: FONTE_TITULO,
    fontWeight: 'normal',
    fontSize: 17,
    letterSpacing: 0.68,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  // Web larga: banner e categorias lado a lado (5 : 7)
  linhaWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACO_COLUNAS,
  },
  colunaBanner: {
    flex: PARTES_BANNER,
  },
  colunaCategorias: {
    flex: PARTES_CATEGORIAS,
  },
  // Anel de categorias: os cards ficam um sobre o outro, no centro, e o transform os espalha
  orbita: {
    width: '100%',
    position: 'relative',
  },
  orbitaItem: {
    position: 'absolute',
  },
  cartao: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  // Celular: ícone ao lado do nome, no mesmo cartão
  cartaoComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Web: faixa compacta da amostra (raio 12, borda 1, padding 6 12 6 6, espaço 10)
  faixaAmostra: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemAmostra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: TAMANHO_ICONE + 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingTop: 6,
    paddingRight: 12,
    paddingBottom: 6,
    paddingLeft: 6,
  },
  // Sem ícone (Patinho): o nome não fica colado na borda
  itemAmostraSemIcone: {
    paddingLeft: 12,
  },
  itemAmostraNome: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 14,
  },
  cartaoNome: {
    fontFamily: FONTE_CORPO.semi,
  },
});
