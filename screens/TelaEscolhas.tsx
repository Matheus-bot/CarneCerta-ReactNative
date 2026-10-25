import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Opcao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import {
  BLENDS,
  carnesParaMoer,
  criarItem,
  ESPESSURAS,
  Escolha,
  FAIXAS,
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
};

const SIM_NAO = [
  { id: 'sim', nome: 'Sim' },
  { id: 'nao', nome: 'Não' },
];

function simNao(valor?: boolean) {
  return valor === undefined ? undefined : valor ? 'sim' : 'nao';
}

// Respostas em andamento: tudo opcional até a pessoa responder
type Respostas = Partial<Escolha> & { ehBlend?: boolean; carneMoer?: number };

export default function TelaEscolhas({ route, navigation }: Props) {
  const cat = route.params?.cat;
  const { carnes, adicionarItem } = useApp();
  const [r, setR] = useState<Respostas>({ preparo: cat });
  const [indice, setIndice] = useState(0);
  const [erro, setErro] = useState('');

  // Nova entrada no fluxo: limpa as respostas e já marca o preparo da categoria tocada
  useEffect(() => {
    setR({ preparo: cat });
    setIndice(0);
    setErro('');
  }, [cat]);

  function responder(novas: Respostas) {
    setR((atual) => ({ ...atual, ...novas }));
    setErro('');
  }

  // Uma pergunta por tela; as perguntas de detalhe dependem do preparo
  const etapas: Etapa[] = [
    {
      pergunta: 'Quantas pessoas?',
      opcoes: FAIXAS,
      valor: r.faixa,
      escolher: (id) => responder({ faixa: id as Escolha['faixa'] }),
    },
    {
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
    },
  ];

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
        etapas.push({
          pergunta: 'Qual blend?',
          opcoes: BLENDS,
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

  // Blend e carne para moer já definem a carne: não passam por prioridade nem TOP 3
  const carneDefinida = r.preparo === 'moida' && (r.hamburguer === false || r.ehBlend === true);
  if (!carneDefinida) {
    etapas.push(
      {
        pergunta: 'O que é mais importante?',
        opcoes: PRIORIDADES,
        valor: r.prioridade,
        escolher: (id) => responder({ prioridade: id as Escolha['prioridade'] }),
      },
      {
        pergunta: 'Quer economizar?',
        opcoes: SIM_NAO,
        valor: simNao(r.economizar),
        escolher: (id) => responder({ economizar: id === 'sim' }),
      },
    );
  }

  const etapa = etapas[Math.min(indice, etapas.length - 1)];

  function proximo() {
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
    const ids = r.ehBlend
      ? BLENDS.find((b) => b.id === r.blend)!.carnes
      : [r.carneMoer!];
    adicionarItem(criarItem(escolha, ids, Date.now()));
    navigation.popTo('Carrinho');
  }

  function voltar() {
    setErro('');
    if (indice === 0) navigation.popTo('Categorias');
    else setIndice(indice - 1);
  }

  return (
    <Tela>
      {r.preparo ? <Sub>{nomeCategoria(r.preparo)}</Sub> : null}
      <Titulo style={styles.semMargemTopo}>Suas escolhas</Titulo>

      <Cartao>
        <Texto style={styles.pergunta}>
          {indice + 1}. {etapa.pergunta}
        </Texto>
        {etapa.opcoes.map((o) => (
          <Opcao
            key={o.id}
            titulo={o.nome}
            ativo={etapa.valor === o.id}
            onPress={() => etapa.escolher(o.id)}
          />
        ))}
      </Cartao>

      {erro ? <Sub vermelho>{erro}</Sub> : null}
      <Botao titulo="Próximo" onPress={proximo} />
      <Botao2 titulo="Voltar" onPress={voltar} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  semMargemTopo: {
    marginTop: 0,
  },
  pergunta: {
    fontWeight: '600',
    marginBottom: 8,
  },
});
