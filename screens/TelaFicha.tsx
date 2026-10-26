import { StyleSheet, Text, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao2 } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import {
  dataDeHoje,
  formatarPeso,
  montarFicha,
  pesoDaFicha,
  pessoasDaFicha,
} from '../data/escolha';
import { useNavegacao } from './rotas';

// Ficha para o açougueiro: papel claro de propósito (a única tela clara do app)
const PAPEL = '#fbf4e2';
const TINTA = '#2a1f14';

export default function TelaFicha() {
  const { salvos, carneById } = useApp();
  const navigation = useNavegacao();
  const linhas = montarFicha(salvos);
  const pessoas = pessoasDaFicha(salvos);
  const total = linhas.reduce((soma, l) => soma + l.peso, 0);

  return (
    <Tela
      estreita
      rodape={<Botao2 titulo="Voltar ao carrinho" onPress={() => navigation.popTo('Carrinho')} />}
    >
      <View style={styles.papel}>
        <Text style={styles.titulo}>Ficha para o açougueiro</Text>
        <Text style={styles.subtitulo}>
          {dataDeHoje()}
          {pessoas ? ` · ${pessoas} pessoas` : ''}
        </Text>

        <View style={[styles.linha, styles.cabecalho]}>
          <Text style={[styles.celula, styles.corte, styles.negrito]}>Corte</Text>
          <Text style={[styles.celula, styles.preparo, styles.negrito]}>Preparo</Text>
          <Text style={[styles.celula, styles.detalhe, styles.negrito]}>Espessura ou tipo</Text>
          <Text style={[styles.celula, styles.peso, styles.negrito]}>Peso</Text>
        </View>

        {linhas.map((l, i) => (
          <View key={i} style={styles.linha}>
            <Text style={[styles.celula, styles.corte]}>
              {l.carnes.map((id) => carneById(id)?.nome).join(' + ')}
            </Text>
            <Text style={[styles.celula, styles.preparo]}>{nomeCategoria(l.preparo)}</Text>
            <Text style={[styles.celula, styles.detalhe]}>{l.detalhe}</Text>
            <Text style={[styles.celula, styles.peso]}>{pesoDaFicha(l.peso, l.emKg)}</Text>
          </View>
        ))}

        <View style={[styles.linha, styles.rodape]}>
          <Text style={[styles.celula, styles.negrito, styles.totalTitulo]}>Total geral</Text>
          <Text style={[styles.celula, styles.peso, styles.negrito]}>
            {formatarPeso(Math.ceil(total / 100) * 100, true)}
          </Text>
        </View>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  papel: {
    backgroundColor: PAPEL,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  titulo: {
    color: TINTA,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitulo: {
    color: TINTA,
    fontSize: 13,
    opacity: 0.75,
    marginTop: 4,
    marginBottom: 14,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(42,31,20,0.25)',
  },
  cabecalho: {
    borderBottomWidth: 1,
    borderBottomColor: TINTA,
  },
  rodape: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: TINTA,
    marginTop: -StyleSheet.hairlineWidth,
  },
  celula: {
    color: TINTA,
    fontSize: 13,
  },
  negrito: {
    fontWeight: '700',
  },
  corte: {
    flex: 3,
  },
  preparo: {
    flex: 2,
  },
  detalhe: {
    flex: 2.5,
  },
  peso: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalTitulo: {
    flex: 7.5,
  },
});
