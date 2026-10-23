import { useRoute } from '@react-navigation/native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../contexto/AppContexto';
import { NomeIcone } from '../data/categorias';
import { useNavegacao } from '../screens/rotas';
import { cores } from './tema';
import { Gradiente, Icone, Texto } from './ui';

type Props = {
  children?: ReactNode;
};

export default function Tela({ children }: Props) {
  const { usuario, salvos, sair } = useApp();
  const navigation = useNavegacao();
  const rota = useRoute();
  const insets = useSafeAreaInsets();

  function item(tela: 'Inicio' | 'Catalogo' | 'Libras', icone: NomeIcone, titulo: string) {
    return (
      <ItemMenu
        icone={icone}
        titulo={titulo}
        ativo={rota.name === tela}
        onPress={() => navigation.popTo(tela)}
      />
    );
  }

  function fazerLogout() {
    sair();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }


  return (
    <View style={styles.container}>
      <View style={[styles.topo, { paddingTop: 16 + insets.top }]}>
        <View style={styles.logo}>
          <Icone nome="check" tamanho={22} cor={cores.vermelho} />
          <Texto style={styles.logoTexto}>
            Carne<Text style={styles.vermelho}>Certa</Text>
          </Texto>
        </View>
        {usuario && (
          <Pressable onPress={() => navigation.popTo('Carrinho')} accessibilityLabel="Carrinho">
            <Gradiente tipo="botao2" style={styles.carrinho}>
              <Icone nome="cart-outline" tamanho={20} />
            </Gradiente>
            {salvos.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>{salvos.length}</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainConteudo}>
        {children}
      </ScrollView>

      {usuario && (
        <Gradiente tipo="menu" style={[styles.menu, { paddingBottom: 14 + insets.bottom }]}>
          {item('Inicio', 'home-outline', 'Início')}
          {item('Catalogo', 'format-list-bulleted', 'Catálogo')}
          {item('Libras', 'wheelchair-accessibility', 'Libras')}
          <ItemMenu icone="logout" titulo="Sair" onPress={fazerLogout} />
        </Gradiente>
      )}
    </View>
  );
}

function ItemMenu({
  icone,
  titulo,
  ativo,
  onPress,
}: {
  icone: NomeIcone;
  titulo: string;
  ativo?: boolean;
  onPress: () => void;
}) {
  const cor = ativo ? cores.vermelho : cores.sub;
  return (
    <Pressable style={styles.itemMenu} onPress={onPress}>
      <Icone nome={icone} tamanho={20} cor={cor} />
      <Text style={[styles.itemMenuTexto, { color: cor }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topo: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoTexto: {
    fontSize: 19,
    fontWeight: '600',
  },
  vermelho: {
    color: cores.vermelho,
  },
  carrinho: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 12,
  },
  main: {
    flex: 1,
  },
  mainConteudo: {
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  menu: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemMenu: {
    alignItems: 'center',
    gap: 4,
  },
  itemMenuTexto: {
    fontSize: 12,
  },
});
