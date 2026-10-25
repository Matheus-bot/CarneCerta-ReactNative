import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Gradiente } from './components/ui';
import { AppProvider } from './contexto/AppContexto';
import { RootStackParamList } from './screens/rotas';
import TelaCadastro from './screens/TelaCadastro';
import TelaCarrinho from './screens/TelaCarrinho';
import TelaCatalogo from './screens/TelaCatalogo';
import TelaCategorias from './screens/TelaCategorias';
import TelaDetalhe from './screens/TelaDetalhe';
import TelaEscolhas from './screens/TelaEscolhas';
import TelaInicial from './screens/TelaInicial';
import TelaLibras from './screens/TelaLibras';
import TelaLogin from './screens/TelaLogin';
import TelaRecomendacao from './screens/TelaRecomendacao';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Fundo transparente para aparecer o gradiente do "celular"
const tema = { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } };

const web = Platform.OS === 'web';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Gradiente tipo="fundo" style={[styles.fundo, web && styles.fundoWeb]}>
          <Gradiente tipo="celular" style={styles.celular}>
            <NavigationContainer theme={tema}>
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                  animation: 'none',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              >
                <Stack.Screen name="Login" component={TelaLogin} />
                <Stack.Screen name="Cadastro" component={TelaCadastro} />
                <Stack.Screen name="Inicio" component={TelaInicial} />
                <Stack.Screen name="Categorias" component={TelaCategorias} />
                <Stack.Screen name="Escolhas" component={TelaEscolhas} />
                <Stack.Screen name="Recomendacao" component={TelaRecomendacao} />
                <Stack.Screen name="Carrinho" component={TelaCarrinho} />
                <Stack.Screen name="Catalogo" component={TelaCatalogo} />
                <Stack.Screen name="Detalhe" component={TelaDetalhe} />
                <Stack.Screen name="Libras" component={TelaLibras} />
              </Stack.Navigator>
            </NavigationContainer>
          </Gradiente>
        </Gradiente>
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
  },
  fundoWeb: {
    alignItems: 'center',
  },
  celular: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
});
