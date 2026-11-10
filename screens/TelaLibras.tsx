import { Image, StyleSheet, View } from 'react-native';
import Tela from '../components/Tela';
import { Cartao, Sub, Texto, Titulo } from '../components/ui';
import VLibrasWidget from '../components/VLibrasWidget';

const TEXTO_PICANHA =
  'Picanha. É um corte bovino da parte de cima do traseiro. É macia e suculenta, com uma capa de gordura. É muito usada no churrasco, na brasa.';

const TEXTO_ACEM =
  'Acém. É um corte bovino da parte do pescoço. É ideal para cozidos e ensopados. Fica macio quando cozinhado devagar, na panela.';

export default function TelaLibras() {
  return (
    <Tela>
      <Titulo>Libras</Titulo>
      <Sub style={styles.instrucao}>
        Toque no ícone do VLibras e depois em Picanha para ouvir a tradução em Libras.
      </Sub>
      <View style={styles.grade}>
        <Cartao style={styles.coluna}>
          <Image
            source={require('../assets/imagens/imagenscarnes/picanha/picanhainteiracrua.jpeg')}
            resizeMode="cover"
            style={[styles.foto, styles.fotoCheia]}
          />
          <Texto style={styles.nome}>Picanha</Texto>
          <VLibrasWidget conteudo={TEXTO_PICANHA} />
        </Cartao>
        <View style={styles.coluna} accessible accessibilityLabel="Acém. Toque para ouvir em Libras">
          <Cartao style={styles.coluna}>
            <Image
              source={require('../assets/imagens/imagenscarnes/acem/aceminteirocru.jpeg')}
              resizeMode="cover"
              style={[styles.foto, styles.fotoCheia]}
            />
            <Texto style={styles.nome}>Acém</Texto>
            <VLibrasWidget conteudo={TEXTO_ACEM} invisivel />
          </Cartao>
        </View>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  instrucao: {
    marginBottom: 12,
  },
  grade: {
    flexDirection: 'row',
    gap: 10,
  },
  coluna: {
    flex: 1,
  },
  foto: {
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fotoCheia: {
    width: '100%',
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
});
