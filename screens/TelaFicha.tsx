import { StyleSheet, Text, View } from 'react-native';
import Tela from '../components/Tela';
import { Botao2 } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import {
  dataDeHoje,
  formatarPeso,
  montarFicha,
  pesoDaFicha,
  pessoasDaFicha,
} from '../data/escolha';
import { useNavegacao } from './rotas';

// Ficha para o açougueiro: papel claro nos dois temas
export default function TelaFicha() {
  const { salvos, carneById } = useApp();
  const { cores } = useTema();
  const tinta = { color: cores.tinta };
  const linhaFina = { borderBottomColor: cores.tintaLinha };
  const navigation = useNavegacao();
  const linhas = montarFicha(salvos);
  const pessoas = pessoasDaFicha(salvos);
  const total = linhas.reduce((soma, l) => soma + l.peso, 0);

  return (
    <Tela
      estreita
      rodape={<Botao2 titulo="Voltar ao carrinho" onPress={() => navigation.popTo('Carrinho')} />}
    >
      <View style={[styles.papel, { backgroundColor: cores.papel }]}>
        <Text style={[styles.titulo, tinta]}>Ficha para o açougueiro</Text>
        <Text style={[styles.subtitulo, tinta]}>
          {dataDeHoje()}
          {pessoas ? ` · ${pessoas} pessoas` : ''}
        </Text>

        <View style={[styles.linha, styles.cabecalho, { borderBottomColor: cores.tinta }]}>
          <Text style={[styles.celula, tinta, styles.corte, styles.negrito]}>Corte</Text>
          <Text style={[styles.celula, tinta, styles.preparo, styles.negrito]}>Preparo</Text>
          <Text style={[styles.celula, tinta, styles.detalhe, styles.negrito]}>Espessura ou tipo</Text>
          <Text style={[styles.celula, tinta, styles.peso, styles.negrito]}>Peso</Text>
        </View>

        {linhas.map((l, i) => (
          <View key={i} style={[styles.linha, linhaFina]}>
            <Text style={[styles.celula, tinta, styles.corte]}>
              {l.carnes.map((id) => carneById(id)?.nome).join(' + ')}
            </Text>
            <Text style={[styles.celula, tinta, styles.preparo]}>{nomeCategoria(l.preparo)}</Text>
            <Text style={[styles.celula, tinta, styles.detalhe]}>{l.detalhe}</Text>
            <Text style={[styles.celula, tinta, styles.peso]}>{pesoDaFicha(l.peso, l.emKg)}</Text>
          </View>
        ))}

        <View style={[styles.linha, styles.rodape, { borderTopColor: cores.tinta }]}>
          <Text style={[styles.celula, tinta, styles.negrito, styles.totalTitulo]}>Total geral</Text>
          <Text style={[styles.celula, tinta, styles.peso, styles.negrito]}>
            {formatarPeso(Math.ceil(total / 100) * 100, true)}
          </Text>
        </View>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  papel: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitulo: {
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
  },
  cabecalho: {
    borderBottomWidth: 1,
  },
  rodape: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    marginTop: -StyleSheet.hairlineWidth,
  },
  celula: {
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
