import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Tela from '../components/Tela';
import { Cartao, Chip, Entrada, Foto, Grade2, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { categorias, nomeCategoria } from '../data/categorias';
import { useNavegacao } from './rotas';

const FILTROS = ['Todas', ...categorias.map((c) => c.nome)];

export default function TelaCatalogo() {
  const { disponiveis } = useApp();
  const navigation = useNavegacao();
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
      <Grade2>
        {lista.map((c) => (
          <Cartao
            key={c.id}
            onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
          >
            <Foto nome={c.foto} />
            <Texto style={styles.nome}>{c.nome}</Texto>
            <Sub vermelho>{nomeCategoria(c.cat)}</Sub>
          </Cartao>
        ))}
      </Grade2>
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
});
