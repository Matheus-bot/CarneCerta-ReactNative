import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Opcao, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import { RootStackParamList } from './rotas';

type Prioridade = 'economia' | 'maciez' | 'sabor';

const PRIORIDADES: [Prioridade, string][] = [
  ['economia', 'Economia'],
  ['maciez', 'Maciez'],
  ['sabor', 'Sabor'],
];

type Props = NativeStackScreenProps<RootStackParamList, 'Escolhas'>;

export default function TelaEscolhas({ route, navigation }: Props) {
  const { cat } = route.params;
  const { usuario, disponiveis } = useApp();
  const [prio, setPrio] = useState<Prioridade | null>(null);
  const [econ, setEcon] = useState<boolean | null>(null);
  const [erro, setErro] = useState('');

  // Nova categoria: limpa as respostas (escolherCat no protótipo)
  useEffect(() => {
    setPrio(null);
    setEcon(null);
    setErro('');
  }, [cat]);

  function verTop() {
    if (!prio || econ === null) {
      setErro('Responda as duas perguntas para ver a recomendação.');
      return;
    }
    // PLACEHOLDER: pontuação de exemplo do protótipo.
    // A tabela de regras do TOP 3 ainda será definida pelo grupo.
    const gostos = usuario?.gostos ?? [];
    const top = disponiveis()
      .map((c) => ({
        id: c.id,
        pontos:
          c[prio] * 2 +
          (econ ? c.economia : 0) +
          (c.cat === cat ? 1 : 0) +
          (gostos.includes(c.id) ? 1 : 0),
      }))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 3);
    navigation.popTo('Recomendacao', { cat, ids: top.map((r) => r.id) });
  }

  return (
    <Tela>
      <Sub>{nomeCategoria(cat)}</Sub>
      <Titulo style={styles.semMargemTopo}>Suas escolhas</Titulo>

      <Cartao>
        <Texto style={styles.pergunta}>1. O que é mais importante?</Texto>
        {PRIORIDADES.map(([valor, titulo]) => (
          <Opcao
            key={valor}
            titulo={titulo}
            ativo={prio === valor}
            onPress={() => {
              setPrio(valor);
              setErro('');
            }}
          />
        ))}
      </Cartao>

      <Cartao>
        <Texto style={styles.pergunta}>2. Quer economizar?</Texto>
        <Opcao
          titulo="Sim"
          ativo={econ === true}
          onPress={() => {
            setEcon(true);
            setErro('');
          }}
        />
        <Opcao
          titulo="Não"
          ativo={econ === false}
          onPress={() => {
            setEcon(false);
            setErro('');
          }}
        />
      </Cartao>

      {erro ? <Sub vermelho>{erro}</Sub> : null}
      <Botao titulo="Ver recomendação" onPress={verTop} />
      <Botao2 titulo="Voltar" onPress={() => navigation.popTo('Categorias')} />
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
