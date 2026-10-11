import { Pressable, StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import { Gradiente, Grade2, Icone, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { iconeCategoria } from '../data/categorias';
import { useNavegacao } from './rotas';

export default function TelaLibras() {
  const { disponiveis } = useApp();
  const navigation = useNavegacao();

  return (
    <Tela>
      <Titulo>Libras</Titulo>
      <Sub style={styles.instrucao}>Toque em uma carne para ver o vídeo em Libras.</Sub>
      <Grade2>
        {disponiveis().map((c) => (
          <Pressable
            key={c.id}
            onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'libras' })}
          >
            <Gradiente tipo="quadrado" style={styles.quadrado}>
              <Icone nome={iconeCategoria(c.cat)} tamanho={38} cor={cores.vermelhoIcone} />
              <Texto style={styles.nome}>{c.nome}</Texto>
            </Gradiente>
          </Pressable>
        ))}
      </Grade2>
    </Tela>
  );
}

const styles = StyleSheet.create({
  instrucao: {
    marginBottom: 12,
  },
  quadrado: {
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 8,
  },
  nome: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
