import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ARQUIVOS_FONTE } from './components/tema';
import { Gradiente } from './components/ui';
import { carregarVLibrasWeb } from './components/VLibrasWidget';
import { AppProvider, useApp } from './contexto/AppContexto';
import { RootStackParamList } from './screens/rotas';
import TelaCarrinho from './screens/TelaCarrinho';
import TelaCatalogo from './screens/TelaCatalogo';
import TelaDetalhe from './screens/TelaDetalhe';
import TelaEscolhas from './screens/TelaEscolhas';
import TelaFicha from './screens/TelaFicha';
import TelaFichasSalvas from './screens/TelaFichasSalvas';
import TelaInicial from './screens/TelaInicial';
import TelaLibras from './screens/TelaLibras';
import TelaRecomendacao from './screens/TelaRecomendacao';
import TelaSplash from './screens/TelaSplash';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Fundo transparente para aparecer o gradiente do "celular"
const tema = { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } };

const web = Platform.OS === 'web';

function BarraDeStatus() {
  const { tema } = useApp();
  return <StatusBar style={tema === 'escuro' ? 'light' : 'dark'} />;
}

export default function App() {
  // Fonte do app (Bebas Neue, components/tema.ts): o app só aparece depois de carregar; se falhar, segue com a do sistema
  const [fonteCarregada, erroFonte] = useFonts(ARQUIVOS_FONTE);
  // Web: botão de sinal do VLibras em todas as telas; o intérprete só abre sozinho na tela Libras
  useEffect(carregarVLibrasWeb, []);
  if (!fonteCarregada && !erroFonte) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Gradiente tipo="fundo" style={[styles.fundo, web && styles.fundoWeb]}>
          <Gradiente tipo="celular" style={styles.celular}>
            <NavigationContainer theme={tema}>
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                  animation: 'none',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              >
                <Stack.Screen name="Splash" component={TelaSplash} />
                <Stack.Screen name="Inicio" component={TelaInicial} />
                <Stack.Screen name="Escolhas" component={TelaEscolhas} />
                <Stack.Screen name="Recomendacao" component={TelaRecomendacao} />
                <Stack.Screen name="Carrinho" component={TelaCarrinho} />
                <Stack.Screen name="Ficha" component={TelaFicha} />
                <Stack.Screen name="FichasSalvas" component={TelaFichasSalvas} />
                <Stack.Screen name="FichaSalva" component={TelaFicha} />
                <Stack.Screen name="Catalogo" component={TelaCatalogo} />
                <Stack.Screen name="Detalhe" component={TelaDetalhe} />
                <Stack.Screen name="Libras" component={TelaLibras} />
              </Stack.Navigator>
            </NavigationContainer>
          </Gradiente>
        </Gradiente>
        <BarraDeStatus />
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
