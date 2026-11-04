import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Cartao, Gradiente, Sub, Texto, Titulo } from '../components/ui';
import VLibrasWidget from '../components/VLibrasWidget';

export default function TelaLibras() {
  return (
    <Tela>
      <Titulo>Libras</Titulo>
      <Sub style={styles.instrucao}>
        Toque no ícone do VLibras e depois em Picanha para ouvir a tradução em Libras.
      </Sub>
      <Cartao>
        <Gradiente tipo="foto" style={styles.foto}>
          <Texto style={styles.fotoTexto}>Foto em breve</Texto>
        </Gradiente>
        <VLibrasWidget conteudo="Picanha" />
      </Cartao>
    </Tela>
  );
}

const styles = StyleSheet.create({
  instrucao: {
    marginBottom: 12,
  },
  foto: {
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fotoTexto: {
    color: '#d6d6de',
    fontSize: 13,
  },
});
