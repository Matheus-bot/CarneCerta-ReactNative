import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ReactNode, useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextStyle, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Contador, Grade2, Icone, Opcao, Sub, Texto } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import {
  BLENDS,
  carnesParaMoer,
  criarItem,
  DIETAS,
  ESPESSURAS,
  Escolha,
  ordenarBlends,
  PREPAROS_FITNESS,
  PRIORIDADES,
  QUANTIDADE_MAXIMA,
  QUANTIDADE_MINIMA,
  TAMANHOS_CORTE,
  temTamanhoCorte,
  temVezesMoer,
  TIPOS_BIFE,
} from '../data/escolha';
import { RootStackParamList } from './rotas';
import { tamanho } from '../components/tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Escolhas'>;

type Etapa = {
  pergunta: string;
  opcoes: { id: string; nome: string }[];
  valor?: string;
  escolher: (id: string) => void;
  pronto?: boolean; // false: não dá para continuar (ex.: campo do contador vazio)
  aviso?: string; // mensagem quando não está pronto
  dica?: string; // no lugar de "Escolha uma só"
  extra?: ReactNode; // abaixo das opções
};

const SIM_NAO = [
  { id: 'sim', nome: 'Sim' },
  { id: 'nao', nome: 'Não' },
];

function simNao(valor?: boolean) {
  return valor === undefined ? undefined : valor ? 'sim' : 'nao';
}

// Respostas em andamento: tudo opcional até a pessoa responder
type Respostas = Partial<Escolha> & { carneMoer?: number; pessoasTexto?: string };

// Começo do fluxo: o contador de pessoas (ou marmitas) começa em 1
function respostasIniciais(cat?: string): Respostas {
  return { preparo: cat, pessoas: QUANTIDADE_MINIMA, pessoasTexto: String(QUANTIDADE_MINIMA) };
}

export default function TelaEscolhas({ route, navigation }: Props) {
  const cat = route.params?.cat;
  const { carnes, adicionarItem } = useApp();
  const { cores } = useTema();
  const [r, setR] = useState<Respostas>(() => respostasIniciais(cat));
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState('');

  // Toda entrada no fluxo começa do zero (também ao voltar por "Nova escolha" com o mesmo cat);
  // pelo cartão de categoria, o preparo já vem definido
  useFocusEffect(
    useCallback(() => {
      setR(respostasIniciais(cat));
      setIndice(0);
      setErro('');
    }, [cat]),
  );

  function responder(novas: Respostas) {
    setR((atual) => ({ ...atual, ...novas }));
    setErro('');
  }

  const fitness = r.preparo === 'fitness';
  const etapas: Etapa[] = [];

  // Pelo banner pergunta o preparo primeiro (o Fitness muda as perguntas seguintes);
  // pelo cartão de categoria ele já veio como parâmetro
  if (!cat) {
    etapas.push({
      pergunta: 'Qual o preparo?',
      opcoes: categorias,
      valor: r.preparo,
      // Outro preparo: limpa a prioridade e os detalhes do preparo anterior
      escolher: (id) =>
        responder({
          preparo: id,
          prioridade: undefined,
          economizar: undefined,
          espessura: undefined,
          tipoBife: undefined,
          hamburguer: undefined,
          blend: undefined,
          carneMoer: undefined,
          vezesMoer: undefined,
          dieta: undefined,
          preparoFitness: undefined,
          tamanhoCorte: undefined,
        }),
    });
  }

  // Pessoas (ou marmitas, no Fitness): contador de 1 a 99; os botões e o campo mexem no mesmo valor
  const quantidade = r.pessoas ?? 0;
  const etapaQuantidade: Etapa = {
    pergunta: fitness ? 'Quantas marmitas?' : 'Quantas pessoas?',
    opcoes: [],
    valor: r.pessoasTexto,
    escolher: () => {},
    pronto: quantidade >= QUANTIDADE_MINIMA && quantidade <= QUANTIDADE_MAXIMA,
    aviso: `Digite um número de ${QUANTIDADE_MINIMA} a ${QUANTIDADE_MAXIMA}.`,
    dica: `De ${QUANTIDADE_MINIMA} a ${QUANTIDADE_MAXIMA}`,
    extra: (
      <Contador
        texto={r.pessoasTexto ?? ''}
        aoMudar={(t) => responder({ pessoasTexto: t, pessoas: t ? Number(t) : undefined })}
        minimo={QUANTIDADE_MINIMA}
        maximo={QUANTIDADE_MAXIMA}
        rotulo={fitness ? 'Número de marmitas' : 'Número de pessoas'}
      />
    ),
  };

  // Tamanho do corte: em Panela e nos preparos fitness de panela; só aparece na ficha
  const etapaTamanhoCorte: Etapa = {
    pergunta: 'Qual o tamanho do corte?',
    opcoes: TAMANHOS_CORTE,
    valor: r.tamanhoCorte,
    escolher: (id) => responder({ tamanhoCorte: id as Escolha['tamanhoCorte'] }),
  };

  const etapaVezesMoer: Etapa = {
    pergunta: 'Moer 1 ou 2 vezes?',
    opcoes: [
      { id: '1', nome: '1 vez' },
      { id: '2', nome: '2 vezes' },
    ],
    valor: r.vezesMoer === undefined ? undefined : String(r.vezesMoer),
    escolher: (id) => responder({ vezesMoer: id === '1' ? 1 : 2 }),
  };

  // Fitness: dieta → marmitas → preparo (→ tamanho do corte nos cubos, ou moer 1 ou 2 vezes na moída).
  // Não pergunta pessoas nem prioridade:
  // as marmitas substituem as pessoas e o TOP 3 traz as carnes magras primeiro
  if (fitness) {
    etapas.push(
      {
        pergunta: 'Qual o tipo de dieta?',
        opcoes: DIETAS,
        valor: r.dieta,
        escolher: (id) => responder({ dieta: id as Escolha['dieta'] }),
      },
      etapaQuantidade,
      {
        pergunta: 'Qual o preparo da marmita?',
        opcoes: PREPAROS_FITNESS,
        valor: r.preparoFitness,
        escolher: (id) =>
          responder({
            preparoFitness: id as Escolha['preparoFitness'],
            tamanhoCorte: undefined,
            vezesMoer: undefined,
          }),
      },
    );
    const preparoEscolhido = { preparo: 'fitness', preparoFitness: r.preparoFitness };
    if (temTamanhoCorte(preparoEscolhido)) etapas.push(etapaTamanhoCorte);
    if (temVezesMoer(preparoEscolhido)) etapas.push(etapaVezesMoer);
  } else {
    etapas.push(etapaQuantidade, {
      pergunta: 'O que é mais importante?',
      opcoes: PRIORIDADES,
      valor: r.prioridade,
      // Sem a pergunta "Quer economizar?": a economia vem só da prioridade Economia
      escolher: (id) =>
        responder({
          prioridade: id as Escolha['prioridade'],
          economizar: id === 'economia',
        }),
    });
  }

  if (r.preparo === 'panela') etapas.push(etapaTamanhoCorte);
  if (r.preparo === 'churrasco') {
    etapas.push({
      pergunta: 'Qual a espessura?',
      opcoes: ESPESSURAS,
      valor: r.espessura,
      escolher: (id) => responder({ espessura: id as Escolha['espessura'] }),
    });
  }
  if (r.preparo === 'bifes') {
    etapas.push({
      pergunta: 'Qual o tipo de bife?',
      opcoes: TIPOS_BIFE,
      valor: r.tipoBife,
      escolher: (id) => responder({ tipoBife: id as Escolha['tipoBife'] }),
    });
  }
  if (r.preparo === 'moida') {
    etapas.push({
      pergunta: 'É para hambúrguer?',
      opcoes: SIM_NAO,
      valor: simNao(r.hamburguer),
      escolher: (id) =>
        responder({
          hamburguer: id === 'sim',
          blend: undefined,
          carneMoer: undefined,
          vezesMoer: undefined,
        }),
    });
    if (r.hamburguer === true) {
      // Hambúrguer sempre leva duas carnes: os 3 blends, ordenados pela prioridade escolhida
      etapas.push({
        pergunta: 'Qual blend?',
        opcoes: ordenarBlends(carnes, r.prioridade ?? 'sabor'),
        valor: r.blend,
        escolher: (id) => responder({ blend: id as Escolha['blend'] }),
      });
    }
    if (r.hamburguer === false) {
      etapas.push(
        {
          pergunta: 'Qual carne moer?',
          opcoes: carnesParaMoer(carnes).map((c) => ({ id: String(c.id), nome: c.nome })),
          valor: r.carneMoer === undefined ? undefined : String(r.carneMoer),
          escolher: (id) => responder({ carneMoer: Number(id) }),
        },
        etapaVezesMoer,
      );
    }
  }

  // Moída já define a carne (hambúrguer: as duas do blend; sem hambúrguer: a carne para moer):
  // vai direto para o carrinho, sem TOP 3
  const carneDefinida = r.preparo === 'moida' && r.hamburguer !== undefined;

  const passo = Math.min(indice, etapas.length - 1);
  const etapa = etapas[passo];

  function proximo() {
    if (etapa.pronto === false) {
      setErro(etapa.aviso ?? '');
      return;
    }
    if (!etapa.valor) {
      setErro('Escolha uma opção para continuar.');
      return;
    }
    if (indice < etapas.length - 1) {
      setIndice(indice + 1);
      return;
    }
    const escolha = r as Escolha;
    if (!carneDefinida) {
      navigation.popTo('Recomendacao', { escolha });
      return;
    }
    const ids = r.hamburguer
      ? BLENDS.find((b) => b.id === r.blend)!.carnes
      : [r.carneMoer!];
    adicionarItem(criarItem(escolha, ids, Date.now()));
    navigation.popTo('Carrinho');
  }

  function voltar() {
    setErro('');
    if (indice === 0) navigation.popTo('Inicio');
    else setIndice(indice - 1);
  }

  // Barra de progresso: cresce a cada passo (o total muda conforme o preparo)
  const porcentagem = Math.round(((passo + 1) / etapas.length) * 100);
  const progresso = `${porcentagem}%` as const;

  return (
    <Tela
      estreita
      rodapeBarra
      rodape={
        <>
          {erro ? <Sub vermelho>{erro}</Sub> : null}
          <Botao pilula titulo="Continuar" onPress={proximo} />
        </>
      }
    >
      {/* O Voltar fica no topo: o rodapé tem só o botão de continuar */}
      <View style={styles.topo}>
        <Pressable
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          style={styles.voltar}
        >
          <Icone nome="chevron-left" tamanho={20} cor={cores.sub} />
          <Sub style={styles.voltarTexto}>Voltar</Sub>
        </Pressable>
        <View style={[styles.barra, { backgroundColor: cores.trilha }]}>
          <View
            style={[styles.barraPreenchida, { backgroundColor: cores.vermelho, width: progresso }]}
          />
        </View>
        <Sub style={styles.porcentagem}>{progresso}</Sub>
      </View>

      <Texto
        accessibilityRole="header"
        textBreakStrategy="balanced"
        style={[styles.pergunta, { color: cores.titulo }, textoEquilibrado]}
      >
        {etapa.pergunta}
      </Texto>
      <Sub style={styles.dica}>
        {r.preparo ? `${nomeCategoria(r.preparo)} · ` : ''}
        {etapa.dica ?? 'Escolha uma só'}
      </Sub>

      <View style={styles.opcoes}>
        <Grade2>
          {etapa.opcoes.map((o) => (
            <Opcao
              key={o.id}
              titulo={o.nome}
              ativo={etapa.valor === o.id}
              onPress={() => etapa.escolher(o.id)}
            />
          ))}
        </Grade2>
      </View>
      {etapa.extra}
    </Tela>
  );
}

// text-wrap: balance só existe na web; no Android o equivalente é o textBreakStrategy
const textoEquilibrado = Platform.OS === 'web' ? ({ textWrap: 'balance' } as TextStyle) : undefined;

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -6,
  },
  voltarTexto: {
    marginVertical: 0,
  },
  barra: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barraPreenchida: {
    height: '100%',
  },
  porcentagem: {
    minWidth: 36,
    marginVertical: 0,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  pergunta: {
    fontSize: tamanho(24),
    fontWeight: '600',
  },
  dica: {
    marginTop: 6,
  },
  opcoes: {
    marginTop: 20,
    marginBottom: 10,
  },
});
