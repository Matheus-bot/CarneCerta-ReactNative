import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ReactNode, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import { Botao, Botao2, Chip, Entrada, Sub, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import {
  BLENDS,
  carnesParaMoer,
  criarItem,
  ESPESSURAS,
  Escolha,
  FAIXAS,
  MINIMO_MAIS10,
  ordenarBlends,
  PRIORIDADES,
  TIPOS_BIFE,
} from '../data/escolha';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Escolhas'>;

type Etapa = {
  pergunta: string;
  opcoes: { id: string; nome: string }[];
  valor?: string;
  escolher: (id: string) => void;
  pronto?: boolean; // além da opção escolhida (ex.: número digitado em "mais de 10")
  aviso?: string; // mensagem quando não está pronto
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
type Respostas = Partial<Escolha> & { ehBlend?: boolean; carneMoer?: number; pessoasTexto?: string };

export default function TelaEscolhas({ route, navigation }: Props) {
  const cat = route.params?.cat;
  const { carnes, adicionarItem } = useApp();
  const [r, setR] = useState<Respostas>({ preparo: cat });
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState('');

  // Toda entrada no fluxo começa do zero (também ao voltar por "Nova escolha" com o mesmo cat);
  // pelo cartão de categoria, o preparo já vem definido
  useFocusEffect(
    useCallback(() => {
      setR({ preparo: cat });
      setIndice(0);
      setErro('');
    }, [cat]),
  );

  function responder(novas: Respostas) {
    setR((atual) => ({ ...atual, ...novas }));
    setErro('');
  }

  // Uma pergunta por tela, na ordem: pessoas → preparo → prioridade → detalhes do preparo
  const etapas: Etapa[] = [
    {
      pergunta: 'Quantas pessoas?',
      opcoes: FAIXAS,
      valor: r.faixa,
      escolher: (id) =>
        responder({ faixa: id as Escolha['faixa'], pessoas: undefined, pessoasTexto: undefined }),
      // Mais de 10: a pessoa digita o número exato, a partir de 11
      pronto: r.faixa !== 'mais10' || (r.pessoas ?? 0) >= MINIMO_MAIS10,
      aviso: `Digite um número a partir de ${MINIMO_MAIS10}.`,
      extra:
        r.faixa === 'mais10' ? (
          <Entrada
            placeholder="Número de pessoas"
            keyboardType="number-pad"
            value={r.pessoasTexto ?? ''}
            onChangeText={(t) => {
              const numero = t.replace(/\D/g, '');
              responder({ pessoasTexto: numero, pessoas: numero ? Number(numero) : undefined });
            }}
          />
        ) : null,
    },
  ];

  // Pelo banner pergunta o preparo; pelo cartão de categoria ele já veio como parâmetro
  if (!cat) {
    etapas.push({
      pergunta: 'Qual o preparo?',
      opcoes: categorias,
      valor: r.preparo,
      // Outro preparo: limpa os detalhes do preparo anterior
      escolher: (id) =>
        responder({
          preparo: id,
          espessura: undefined,
          tipoBife: undefined,
          hamburguer: undefined,
          ehBlend: undefined,
          blend: undefined,
          carneMoer: undefined,
          vezesMoer: undefined,
        }),
    });
  }

  etapas.push({
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
          ehBlend: undefined,
          blend: undefined,
          carneMoer: undefined,
          vezesMoer: undefined,
        }),
    });
    if (r.hamburguer === true) {
      etapas.push({
        pergunta: 'É blend?',
        opcoes: SIM_NAO,
        valor: simNao(r.ehBlend),
        escolher: (id) => responder({ ehBlend: id === 'sim', blend: undefined }),
      });
      if (r.ehBlend) {
        // Os 3 blends, ordenados pela prioridade escolhida
        etapas.push({
          pergunta: 'Qual blend?',
          opcoes: ordenarBlends(carnes, r.prioridade ?? 'sabor'),
          valor: r.blend,
          escolher: (id) => responder({ blend: id as Escolha['blend'] }),
        });
      }
    }
    if (r.hamburguer === false) {
      etapas.push(
        {
          pergunta: 'Qual carne moer?',
          opcoes: carnesParaMoer(carnes).map((c) => ({ id: String(c.id), nome: c.nome })),
          valor: r.carneMoer === undefined ? undefined : String(r.carneMoer),
          escolher: (id) => responder({ carneMoer: Number(id) }),
        },
        {
          pergunta: 'Moer 1 ou 2 vezes?',
          opcoes: [
            { id: '1', nome: '1 vez' },
            { id: '2', nome: '2 vezes' },
          ],
          valor: r.vezesMoer === undefined ? undefined : String(r.vezesMoer),
          escolher: (id) => responder({ vezesMoer: id === '1' ? 1 : 2 }),
        },
      );
    }
  }

  // Blend e carne para moer já definem a carne: vão direto para o carrinho, sem TOP 3
  const carneDefinida = r.preparo === 'moida' && (r.hamburguer === false || r.ehBlend === true);

  const passo = Math.min(indice, etapas.length - 1);
  const etapa = etapas[passo];

  function proximo() {
    if (!etapa.valor) {
      setErro('Escolha uma opção para continuar.');
      return;
    }
    if (etapa.pronto === false) {
      setErro(etapa.aviso ?? '');
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
    const ids = r.ehBlend
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
  const progresso = `${((passo + 1) / etapas.length) * 100}%` as const;

  return (
    <Tela
      estreita
      rodape={
        <>
          {erro ? <Sub vermelho>{erro}</Sub> : null}
          <Botao titulo="Próximo" onPress={proximo} />
          <Botao2 titulo="Voltar" onPress={voltar} />
        </>
      }
    >
      <View style={styles.barra}>
        <View style={[styles.barraPreenchida, { width: progresso }]} />
      </View>

      <Titulo style={styles.pergunta}>{etapa.pergunta}</Titulo>
      {r.preparo ? <Sub style={styles.subtitulo}>{nomeCategoria(r.preparo)}</Sub> : null}

      <View style={styles.opcoes}>
        {etapa.opcoes.map((o) => (
          <Chip
            key={o.id}
            grande
            titulo={o.nome}
            ativo={etapa.valor === o.id}
            onPress={() => etapa.escolher(o.id)}
          />
        ))}
      </View>
      {etapa.extra}
    </Tela>
  );
}

const styles = StyleSheet.create({
  barra: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 20,
  },
  barraPreenchida: {
    height: '100%',
    backgroundColor: cores.vermelho,
  },
  pergunta: {
    fontSize: 24,
    marginTop: 0,
    marginBottom: 0,
  },
  subtitulo: {
    marginTop: 6,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
});
