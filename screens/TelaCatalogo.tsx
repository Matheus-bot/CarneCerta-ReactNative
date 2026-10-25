import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Tela, { margemWeb } from '../components/Tela';
import { Cartao, Chip, Entrada, Foto, Grade, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import { useNavegacao } from './rotas';

// 'todos' ou o id de uma categoria (data/categorias.ts)
const FILTROS = [{ id: 'todos', nome: 'Todos' }, ...categorias];

const web = Platform.OS === 'web';

// Web: largura de referência de cada coluna da grade, como na tela inicial
const LARGURA_COLUNA = 200;

// Web: colunas calculadas pela largura disponível (mínimo 2); celular: sempre 2
function colunasDaGrade(largura: number) {
  if (!web) return 2;
  const disponivel = largura - 2 * margemWeb(largura);
  return Math.max(2, Math.floor(disponivel / LARGURA_COLUNA));
}

// Minúsculas e sem acentos, para a busca: "Acém" → "acem"
function semAcento(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function TelaCatalogo() {
  const { disponiveis } = useApp();
  const navigation = useNavegacao();
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  // Busca e categoria filtram juntas; disponiveis() já traz só as carnes ativas
  const q = semAcento(busca.trim());
  const lista = disponiveis()
    .filter((c) => filtro === 'todos' || c.cat.includes(filtro))
    .filter((c) => semAcento(c.nome).includes(q));

  const chips = FILTROS.map((f) => (
    <Chip key={f.id} titulo={f.nome} ativo={filtro === f.id} onPress={() => setFiltro(f.id)} />
  ));

  return (
    <Tela>
      <Titulo>Catálogo</Titulo>
      <Entrada placeholder="Buscar corte..." value={busca} onChangeText={setBusca} />
      {/* Web: chips em linha, quebrando quando não cabem; celular: faixa rolável na horizontal */}
      {web ? (
        <View style={styles.filtros}>{chips}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosCelular}
        >
          {chips}
        </ScrollView>
      )}
      {lista.length === 0 ? (
        <Sub>Nenhuma carne encontrada.</Sub>
      ) : (
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
                <Sub vermelho>{c.cat.map(nomeCategoria).join(', ')}</Sub>
              </Cartao>
            </Pressable>
          ))}
        </Grade>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filtrosCelular: {
    flexGrow: 0,
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
