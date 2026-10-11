import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mosaico from '../components/Mosaico';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import { Botao, Botao2, Sub, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { useNavegacao } from './rotas';

// Tela existente no protótipo, mas nenhum botão leva até ela (abrirGostos não é chamada)
export default function TelaGostos() {
  const { usuario, carnes, salvarGostos } = useApp();
  const navigation = useNavegacao();
  const [selecionados, setSelecionados] = useState<number[]>(usuario?.gostos ?? []);
  const total = selecionados.length;

  function alternar(id: number) {
    setSelecionados((lista) =>
      lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id],
    );
  }

  function continuar() {
    salvarGostos(selecionados);
    navigation.popTo('Inicio');
  }

  return (
    <Tela semMenu>
      <Titulo>O que você gosta?</Titulo>
      <Sub style={styles.instrucao}>
        Toque nas carnes que você gosta. Você pode escolher quantas quiser.{' '}
        {total ? <Text style={styles.vermelho}>{total} selecionada(s)</Text> : null}
      </Sub>
      <Mosaico
        carnes={carnes.filter((c) => c.ativo && c.gosto)}
        selecionada={(c) => selecionados.includes(c.id)}
        onToque={(c) => alternar(c.id)}
      />
      <View style={styles.espaco} />
      <Botao titulo="Continuar" onPress={continuar} />
      <Botao2
        titulo={usuario?.gostos ? 'Voltar' : 'Pular por agora'}
        onPress={() => navigation.popTo('Inicio')}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  instrucao: {
    marginBottom: 12,
  },
  vermelho: {
    color: cores.vermelho,
  },
  espaco: {
    height: 8,
  },
});
