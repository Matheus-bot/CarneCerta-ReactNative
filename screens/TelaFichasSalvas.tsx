import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Sub, Texto, Titulo } from '../components/ui';
import { excluirFicha, FichaSalva, listarFichas } from '../data/banco';
import { dataDeHoje, fichaParaTela, ItemCarrinho } from '../data/escolha';
import { useNavegacao } from './rotas';

// Cortes diferentes e o mesmo total da ficha: "2 carnes · 1400 g" (kg acima de 10 pessoas)
function resumoDaFicha(itens: ItemCarrinho[]) {
  const carnes = new Set(itens.flatMap((i) => i.carnes)).size;
  return `${carnes} ${carnes === 1 ? 'carne' : 'carnes'} · ${fichaParaTela(itens).total}`;
}

export default function TelaFichasSalvas() {
  const navigation = useNavegacao();
  // null: ainda lendo do banco
  const [fichas, setFichas] = useState<FichaSalva[] | null>(null);
  const [confirmando, setConfirmando] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativa = true;
      listarFichas().then((lista) => {
        if (ativa) setFichas(lista);
      });
      return () => {
        ativa = false;
      };
    }, []),
  );

  async function excluir(id: number) {
    await excluirFicha(id);
    setConfirmando(null);
    setFichas(await listarFichas());
  }

  if (fichas && !fichas.length) {
    return (
      <Tela>
        <Titulo>Fichas salvas</Titulo>
        <Sub>Você ainda não salvou nenhuma ficha.</Sub>
        <Botao titulo="Voltar ao início" onPress={() => navigation.popTo('Inicio')} />
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Fichas salvas</Titulo>
      {fichas?.map((ficha) => {
        const data = dataDeHoje(new Date(ficha.criadaEm));
        const resumo = resumoDaFicha(ficha.itens);
        return (
          <Cartao key={ficha.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir ficha de ${data}, ${resumo}`}
              onPress={() => navigation.popTo('FichaSalva', { ficha })}
            >
              <Texto style={styles.data}>{data}</Texto>
              <Sub>{resumo}</Sub>
            </Pressable>
            {confirmando === ficha.id ? (
              <>
                <Botao2
                  titulo="Confirmar exclusão"
                  accessibilityLabel={`Confirmar exclusão da ficha de ${data}`}
                  style={styles.acao}
                  onPress={() => excluir(ficha.id)}
                />
                <Botao2
                  titulo="Cancelar"
                  accessibilityLabel={`Cancelar exclusão da ficha de ${data}`}
                  style={styles.ultimaAcao}
                  onPress={() => setConfirmando(null)}
                />
              </>
            ) : (
              <Botao2
                titulo="Excluir"
                accessibilityLabel={`Excluir ficha de ${data}`}
                style={[styles.acao, styles.ultimaAcao]}
                onPress={() => setConfirmando(ficha.id)}
              />
            )}
          </Cartao>
        );
      })}
    </Tela>
  );
}

const styles = StyleSheet.create({
  data: {
    fontWeight: '600',
  },
  acao: {
    marginTop: 10,
  },
  ultimaAcao: {
    marginBottom: 0,
  },
});
