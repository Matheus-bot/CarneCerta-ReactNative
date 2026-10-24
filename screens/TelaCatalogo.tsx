import { useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Tela from '../components/Tela';
import { Cartao, Chip, Entrada, Foto, Grade, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import { useNavegacao } from './rotas';

const FILTROS = ['Todas', ...categorias.map((c) => c.nome)];

const web = Platform.OS === 'web';

// Web: 5 colunas em telas grandes, 3 em médias e 2 em pequenas; celular: sempre 2
function colunasDaGrade(largura: number) {
  if (!web) return 2;
  if (largura >= 1024) return 5;
  if (largura >= 640) return 3;
  return 2;
}

export default function TelaCatalogo() {
  const { disponiveis } = useApp();
  const navigation = useNavegacao();
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState('Todas');
  const [busca, setBusca] = useState('');

  const q = busca.toLowerCase();
  const lista = disponiveis()
    .filter((c) => filtro === 'Todas' || nomeCategoria(c.cat) === filtro)
    .filter((c) => c.nome.toLowerCase().includes(q));

  return (
    <Tela>
      <Titulo>Catálogo</Titulo>
      <Entrada placeholder="Buscar corte..." value={busca} onChangeText={setBusca} />
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Chip key={f} titulo={f} ativo={filtro === f} onPress={() => setFiltro(f)} />
        ))}
      </View>
      <Grade colunas={colunasDaGrade(width)}>
        {lista.map((c) => (
          <Pressable
            key={c.id}
            style={web && styles.cartaoWeb}
            onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
          >
            <Cartao style={web && styles.cartaoWeb}>
              <Foto nome={c.foto} />
              <Texto style={styles.nome}>{c.nome}</Texto>
              {web && <Sub>{c.desc}</Sub>}
              <Sub vermelho>{nomeCategoria(c.cat)}</Sub>
            </Cartao>
          </Pressable>
        ))}
      </Grade>
    </Tela>
  );
}

const styles = StyleSheet.create({
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  nome: {
    fontWeight: '600',
  },
  // Na web os cartões da mesma linha ficam com a mesma altura
  cartaoWeb: {
    flex: 1,
    marginBottom: 0,
  },
});
