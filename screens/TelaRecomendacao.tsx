import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Tela from '../components/Tela';
import { estilosInicio, FONTE_CORPO } from '../components/tema';
import { Botao, Botao2, Foto, Gradiente, Sub, Texto, Titulo } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { criarItem, top3 } from '../data/escolha';
import { fotoDaCarne } from '../data/imagensCategorias';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Recomendacao'>;

// Posições do TOP 3, na ordem do resultado (docs/referencia/clara.html).
// Largura: 92 + 116 + 92 + 2 × 10 de espaço = 320, o que cabe num celular de 360 com 18 de margem de cada lado
const LUGARES = [
  { nome: 'primeiro', foto: 116 },
  { nome: 'segundo', foto: 92 },
  { nome: 'terceiro', foto: 92 },
];

// Da esquerda para a direita: #2, #1, #3
const ORDEM_PODIO = [1, 0, 2];

// Fotos redondas com borda de 3: no #1 na cor de destaque, no #2 e no #3 transparente
const BORDA_FOTO = 3;

// Tempo do "Adicionado ✓" no botão
const TEMPO_ADICIONADO = 2000;

// Entrada do pódio ao abrir a tela: #3, depois #2, depois #1 (300 ms entre um e outro).
// Cada um sobe 20 px, vai de transparente a opaco e cresce de 0,8 a 1,0 em 500 ms
const ENTRADA_DURACAO = 500;
const ENTRADA_INTERVALO = 300;
const ENTRADA_SUBIDA = 20;
const ENTRADA_ESCALA = 0.8;

export default function TelaRecomendacao({ route, navigation }: Props) {
  const { escolha } = route.params;
  const { carnes, adicionarItem, tema } = useApp();
  const { cores } = useTema();
  // Estilo novo do pódio: cor de destaque e cor principal do tema
  const e = estilosInicio[tema];
  const top = top3(carnes, escolha);
  // Cortes adicionados há menos de 2 s: o botão mostra "Adicionado ✓"
  const [adicionados, setAdicionados] = useState<number[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  // Progresso da entrada de cada lugar (0 = escondido, 1 = no lugar), índice = posição (#1, #2, #3)
  const entrada = useRef(LUGARES.map(() => new Animated.Value(0))).current;

  // Roda uma vez a cada vez que a tela é aberta; com movimento reduzido no sistema, o pódio aparece direto
  useEffect(() => {
    let cancelado = false;
    let animacao: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduzir) => {
        if (cancelado) return;
        if (reduzir) {
          entrada.forEach((v) => v.setValue(1));
          return;
        }
        animacao = Animated.stagger(
          ENTRADA_INTERVALO,
          [...entrada].reverse().map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: ENTRADA_DURACAO,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: Platform.OS !== 'web',
            }),
          ),
        );
        animacao.start();
      });
    return () => {
      cancelado = true;
      animacao?.stop();
    };
  }, [entrada]);

  useEffect(() => {
    const ativos = timers.current;
    return () => ativos.forEach(clearTimeout);
  }, []);

  // Toque na foto ou no botão: a escolha vai para o carrinho com preparo, peso e espessura (ou tipo).
  // Fica no pódio para escolher outras; enquanto mostra "Adicionado ✓", um novo toque no mesmo corte
  // é ignorado, para a foto e o botão não adicionarem duas vezes
  function escolher(id: number) {
    if (timers.current.has(id)) return;
    adicionarItem(criarItem(escolha, [id], Date.now()));
    setAdicionados((lista) => [...lista, id]);
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setAdicionados((lista) => lista.filter((a) => a !== id));
      }, TEMPO_ADICIONADO),
    );
  }

  return (
    <Tela
      estreita
      rodapeBarra
      rodape={
        <>
          <Botao pilula titulo="Ver ficha de compra" onPress={() => navigation.popTo('Ficha')} />
          <Botao2 titulo="Nova escolha" onPress={() => navigation.popTo('Escolhas', {})} />
        </>
      }
    >
      <Titulo style={styles.titulo}>Seu TOP 3</Titulo>

      <View style={styles.podio}>
        {ORDEM_PODIO.filter((i) => top[i]).map((i) => {
          const c = top[i];
          const lugar = LUGARES[i];
          const primeiro = i === 0;
          const rotulo = `${c.nome}, ${lugar.nome} lugar`;
          const adicionado = adicionados.includes(c.id);
          const corBotaoTexto = primeiro ? cores.botaoTexto : cores.vinhoBotaoTexto;
          const textoBotao = (
            <Texto style={[styles.botaoTexto, { color: corBotaoTexto }]} numberOfLines={2}>
              {adicionado ? 'Adicionado ✓' : 'Escolher esta carne'}
            </Texto>
          );
          const progresso = entrada[i];
          return (
            <Animated.View
              key={c.id}
              style={{
                width: lugar.foto,
                opacity: progresso,
                transform: [
                  { translateY: progresso.interpolate({ inputRange: [0, 1], outputRange: [ENTRADA_SUBIDA, 0] }) },
                  { scale: progresso.interpolate({ inputRange: [0, 1], outputRange: [ENTRADA_ESCALA, 1] }) },
                ],
              }}
            >
              <Pressable
                onPress={() => escolher(c.id)}
                accessibilityRole="button"
                accessibilityLabel={rotulo}
              >
                <View
                  accessibilityLabel={rotulo}
                  style={[
                    styles.foto,
                    {
                      width: lugar.foto,
                      height: lugar.foto,
                      borderRadius: lugar.foto / 2,
                      borderColor: primeiro ? e.destaque : 'transparent',
                    },
                  ]}
                >
                  <Foto nome={c.foto} fonte={fotoDaCarne(c)} altura={lugar.foto - 2 * BORDA_FOTO} />
                </View>
                <Text style={[styles.numero, { color: e.destaque }]}>#{i + 1}</Text>
                <Text style={[styles.corte, { color: e.principal }]}>{c.nome}</Text>
              </Pressable>
              {/* Irmão da foto (não dentro dela): cada toque dispara uma só adição */}
              <Pressable
                onPress={() => escolher(c.id)}
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${c.nome}`}
                accessibilityState={{ disabled: adicionado }}
                style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
              >
                {primeiro ? (
                  <Gradiente tipo="botao" style={styles.botaoFundo}>
                    {textoBotao}
                  </Gradiente>
                ) : (
                  <View style={[styles.botaoFundo, { backgroundColor: cores.vinhoBotao }]}>{textoBotao}</View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Sub style={styles.dica}>Escolha uma ou mais carnes para o carrinho.</Sub>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: {
    textAlign: 'center',
  },
  // Três fotos em linha, alinhadas pela base, espaço 10
  podio: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  foto: {
    borderWidth: BORDA_FOTO,
    overflow: 'hidden',
  },
  numero: {
    fontFamily: FONTE_CORPO.negrito,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  corte: {
    fontFamily: FONTE_CORPO.normal,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  // Pílula de 32 de altura (cresce com a fonte do sistema aumentada, em vez de cortar o texto)
  botao: {
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoFundo: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  dica: {
    marginTop: 16,
    textAlign: 'center',
  },
});
