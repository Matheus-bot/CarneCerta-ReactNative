import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Cartao, Gradiente, Sub, Texto, Titulo } from '../components/ui';
import VLibrasWidget from '../components/VLibrasWidget';
import { useTema } from '../contexto/AppContexto';

const TEXTO_PICANHA =
  'Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa.';

export default function TelaLibras() {
  const { cores } = useTema();
  return (
    <Tela>
      <Titulo>Libras</Titulo>
      <Sub style={styles.instrucao}>
        Toque no ícone do VLibras e depois em Picanha para ouvir a tradução em Libras.
      </Sub>
      <Cartao>
        <Gradiente tipo="foto" style={styles.foto}>
          <Texto style={[styles.fotoTexto, { color: cores.fotoTexto }]}>Foto em breve</Texto>
        </Gradiente>
        <Texto style={styles.nome}>Picanha</Texto>
        <VLibrasWidget conteudo={TEXTO_PICANHA} />
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
  nome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  fotoTexto: {
    fontSize: 13,
  },
});
