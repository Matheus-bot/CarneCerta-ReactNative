import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categorias } from '../data/categorias';

const quantidadeCarrinho = 0;

export default function TelaInicial() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.cabecalho}>
        <Text style={styles.logo}>CarneCerta</Text>
        <View style={styles.carrinho}>
          <Text style={styles.carrinhoIcone}>🛒</Text>
          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>{quantidadeCarrinho}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        <Pressable
          style={({ pressed }) => [styles.botaoDestaque, pressed && styles.botaoPressionado]}
        >
          <Text style={styles.botaoDestaqueTexto}>Escolher carne para o meu preparo</Text>
        </Pressable>

        <Text style={styles.tituloSecao}>Categorias</Text>
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carrossel}
          renderItem={({ item }) => (
            <View style={styles.cartao}>
              <Text style={styles.cartaoIcone}>{item.icone}</Text>
              <Text style={styles.cartaoNome}>{item.nome}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logo: {
    color: '#ff5a52',
    fontSize: 24,
    fontWeight: 'bold',
  },
  carrinho: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  carrinhoIcone: {
    fontSize: 22,
  },
  contador: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0302e',
  },
  contadorTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conteudo: {
    paddingVertical: 20,
  },
  botaoDestaque: {
    marginHorizontal: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#e0302e',
  },
  botaoPressionado: {
    backgroundColor: '#ff5a52',
  },
  botaoDestaqueTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tituloSecao: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 14,
    marginHorizontal: 20,
  },
  carrossel: {
    paddingHorizontal: 20,
    gap: 14,
  },
  cartao: {
    width: 160,
    height: 170,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cartaoIcone: {
    fontSize: 56,
  },
  cartaoNome: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
  },
});
