import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutRectangle, Platform, StyleSheet, View } from 'react-native';
import { cores } from '../components/tema';
import { Gradiente, Icone } from '../components/ui';
import { useNavegacao } from './rotas';

// Duração total da splash, em milissegundos
const DURACAO = 4000;

// Escrita: o ✓ e cada letra entram em sequência, 0,12 s um depois do outro
const INTERVALO = 120;
const ENTRADA = 400;
const LETRAS = [...'Carne'].map((l) => ({ l, cor: cores.texto })).concat(
  [...'Certa'].map((l) => ({ l, cor: cores.vermelho })),
);

// Corte: inclinação da linha em relação à vertical
const INCLINACAO = 20;
const RAD = (INCLINACAO * Math.PI) / 180;

// Separação das metades: para fora do corte e ao longo dele
const AFASTAMENTO = 14;
const DESLIZE = 6;

// O driver nativo não existe na web
const nativo = Platform.OS !== 'web';

const suave = Easing.inOut(Easing.cubic);

export default function TelaSplash() {
  const navigation = useNavegacao();
  // Um único relógio de 0 a DURACAO; cada parte da animação é um trecho dele
  const t = useRef(new Animated.Value(0)).current;
  // Posição e tamanho da palavra, medidos para posicionar as duas metades
  const [caixa, setCaixa] = useState<LayoutRectangle | null>(null);

  useEffect(() => {
    const animacao = Animated.timing(t, {
      toValue: DURACAO,
      duration: DURACAO,
      easing: Easing.linear,
      useNativeDriver: nativo,
    });
    animacao.start(({ finished }) => {
      // reset: a splash sai da pilha e o "voltar" não retorna para ela
      if (finished) navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
    });
    return () => animacao.stop();
  }, [t, navigation]);

  function trecho(inicio: number, fim: number, de: number, para: number) {
    return t.interpolate({
      inputRange: [inicio, fim],
      outputRange: [de, para],
      easing: suave,
      extrapolate: 'clamp',
    });
  }

  // 1,6 a 2,6 s: a linha é traçada de cima a baixo; some quando as metades se separam
  const linhaTraco = trecho(1600, 2600, 0, 1);
  const linhaOpacidade = t.interpolate({
    inputRange: [1600, 1700, 2600, 3000],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  // 2,6 a 3,4 s: as metades se afastam e somem
  const separacao = trecho(2600, 3400, 0, 1);
  const metadesOpacidade = trecho(2600, 3400, 1, 0);

  // 3,4 a 4 s: o fundo escurece e a splash some para a tela inicial
  const escurecer = trecho(3400, 3800, 0, 0.6);
  const telaOpacidade = trecho(3700, DURACAO, 1, 0);

  function metade(lado: -1 | 1) {
    if (!caixa) return null;
    const { x, y, width, height } = caixa;
    // Quadrado girado em volta do centro da palavra; cada metade dele recorta um lado do corte
    const lado2 = Math.ceil(width + 2 * height + 40);
    const recorte = {
      left: lado === -1 ? 0 : lado2 / 2,
      opacity: metadesOpacidade,
      transform: [
        { translateX: Animated.multiply(separacao, lado * AFASTAMENTO) },
        { translateY: Animated.multiply(separacao, lado * DESLIZE) },
      ],
    };
    // A palavra gira ao contrário para ficar reta e no mesmo lugar
    const palavra = {
      left: (lado2 - width) / 2 - (lado === -1 ? 0 : lado2 / 2),
      top: (lado2 - height) / 2,
      transform: [{ rotate: `${-INCLINACAO}deg` }],
    };
    return (
      <View
        key={lado}
        pointerEvents="none"
        style={[
          styles.quadrado,
          {
            left: x + width / 2 - lado2 / 2,
            top: y + height / 2 - lado2 / 2,
            width: lado2,
            height: lado2,
            transform: [{ rotate: `${INCLINACAO}deg` }],
          },
        ]}
      >
        <Animated.View style={[styles.recorte, { width: lado2 / 2, height: lado2 }, recorte]}>
          <View style={[styles.palavra, palavra]}>
            <Palavra t={t} />
          </View>
        </Animated.View>
        {lado === 1 && (
          <Linha
            comprimento={(height + 48) / Math.cos(RAD)}
            centro={lado2 / 2}
            traco={linhaTraco}
            opacidade={linhaOpacidade}
          />
        )}
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: telaOpacidade }]}>
      <Gradiente tipo="fundo" style={StyleSheet.absoluteFill} />

      {/* Cópia invisível só para medir a palavra no centro da tela */}
      <View style={styles.invisivel} onLayout={(e) => setCaixa(e.nativeEvent.layout)}>
        <Palavra />
      </View>
      {metade(-1)}
      {metade(1)}

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.escuro, { opacity: escurecer }]}
      />
    </Animated.View>
  );
}

// ✓ + "CarneCerta"; com o relógio, cada item entra com fade e leve deslizamento lateral
function Palavra({ t }: { t?: Animated.Value }) {
  function entrada(i: number) {
    if (!t) return null;
    const inicio = i * INTERVALO;
    const faixa = { inputRange: [inicio, inicio + ENTRADA], extrapolate: 'clamp' as const };
    return {
      opacity: t.interpolate({ ...faixa, outputRange: [0, 1] }),
      transform: [
        {
          translateX: t.interpolate({
            ...faixa,
            outputRange: [-10, 0],
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    };
  }

  return (
    <View style={styles.linhaLogo}>
      <Animated.View style={[styles.icone, entrada(0)]}>
        <Icone nome="check" tamanho={34} cor={cores.vermelho} />
      </Animated.View>
      {LETRAS.map(({ l, cor }, i) => (
        <Animated.Text key={i} style={[styles.letra, { color: cor }, entrada(i + 1)]}>
          {l}
        </Animated.Text>
      ))}
    </View>
  );
}

// Linha de corte vermelha com brilho discreto, traçada de cima a baixo
function Linha({
  comprimento,
  centro,
  traco,
  opacidade,
}: {
  comprimento: number;
  centro: number;
  traco: Animated.AnimatedInterpolation<number>;
  opacidade: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Animated.View
      style={[
        styles.linha,
        {
          left: centro - 1,
          top: centro - comprimento / 2,
          height: comprimento,
          opacity: opacidade,
          transform: [{ scaleY: traco }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invisivel: {
    opacity: 0,
  },
  quadrado: {
    position: 'absolute',
  },
  recorte: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  palavra: {
    position: 'absolute',
  },
  linhaLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: {
    marginRight: 10,
  },
  letra: {
    fontSize: 30,
    fontWeight: '600',
  },
  linha: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
    backgroundColor: cores.vermelho,
    boxShadow: cores.brilhoDestaque,
    transformOrigin: 'top',
  },
  // Escurece para o fundo do tema escuro antes de ir para a Início
  escuro: {
    backgroundColor: cores.fundo,
  },
});
