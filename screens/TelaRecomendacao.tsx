import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Foto, Gradiente, Sub, Texto, Titulo } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { criarItem, top3 } from '../data/escolha';
import { fotoDaCarne } from '../data/imagensCategorias';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Recomendacao'>;

// Posições do TOP 3, na ordem do resultado.
// Largura: 96 + 116 + 96 + 2 × 8 de espaço = 324, o que cabe num celular de 360 com 18 de margem de cada lado
const LUGARES = [
  { nome: 'primeiro', foto: 116, bloco: 64, numero: 18, corte: 14 },
  { nome: 'segundo', foto: 96, bloco: 44, numero: 12, corte: 12 },
  { nome: 'terceiro', foto: 96, bloco: 30, numero: 11, corte: 11 },
];

// Da esquerda para a direita: #3, #1, #2
const ORDEM_PODIO = [2, 0, 1];

const BORDA_PRIMEIRO = 3;

// Tempo do "Adicionado ✓" no botão
const TEMPO_ADICIONADO = 2000;

export default function TelaRecomendacao({ route, navigation }: Props) {
  const { escolha } = route.params;
  const { carnes, adicionarItem } = useApp();
  const { cores, gradientes } = useTema();
  const top = top3(carnes, escolha);
  // Cortes adicionados há menos de 2 s: o botão mostra "Adicionado ✓"
  const [adicionados, setAdicionados] = useState<number[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

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
          const corTexto = primeiro ? cores.chipTextoAtivo : cores.texto;
          const adicionado = adicionados.includes(c.id);
          const corBotaoTexto = primeiro ? cores.botaoTexto : cores.vinhoBotaoTexto;
          const textoBotao = (
            <Texto style={[styles.botaoTexto, { color: corBotaoTexto }]} numberOfLines={2}>
              {adicionado ? 'Adicionado ✓' : 'Escolher esta carne'}
            </Texto>
          );
          return (
            <View key={c.id} style={{ width: lugar.foto }}>
              <Pressable
                onPress={() => escolher(c.id)}
                accessibilityRole="button"
                accessibilityLabel={rotulo}
              >
                <View
                  accessibilityLabel={rotulo}
                  style={[
                    styles.foto,
                    { height: lugar.foto },
                    primeiro && {
                      borderWidth: BORDA_PRIMEIRO,
                      borderColor: gradientes.botao.colors[0],
                    },
                  ]}
                >
                  <Foto
                    nome={c.foto}
                    fonte={fotoDaCarne(c)}
                    altura={primeiro ? lugar.foto - 2 * BORDA_PRIMEIRO : lugar.foto}
                  />
                </View>
                {/* Altura mínima: com a fonte do sistema aumentada, o bloco cresce em vez de cortar o texto */}
                <View accessibilityLabel={rotulo}>
                  <Gradiente
                    tipo={primeiro ? 'chipAtivo' : 'cartao'}
                    style={[
                      styles.bloco,
                      { minHeight: lugar.bloco },
                      !primeiro && [styles.blocoBorda, { borderColor: cores.linha18 }],
                    ]}
                  >
                    <Texto
                      style={[
                        styles.numero,
                        {
                          color: primeiro ? corTexto : cores.vermelho,
                          fontSize: lugar.numero,
                          lineHeight: Math.round(lugar.numero * 1.2),
                        },
                      ]}
                    >
                      #{i + 1}
                    </Texto>
                    <Texto
                      style={[
                        styles.corte,
                        {
                          color: corTexto,
                          fontSize: lugar.corte,
                          lineHeight: Math.round(lugar.corte * 1.2),
                        },
                      ]}
                    >
                      {c.nome}
                    </Texto>                  </Gradiente>
                </View>
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
            </View>
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
  podio: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  foto: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bloco: {
    borderRadius: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blocoBorda: {
    borderWidth: 0.5,
  },
  numero: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  corte: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
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
