import { useRoute } from '@react-navigation/native';
import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, useTema } from '../contexto/AppContexto';
import { NomeIcone } from '../data/categorias';
import { useNavegacao } from '../screens/rotas';
import { Gradiente, Icone, Texto } from './ui';

type Props = {
  children?: ReactNode;
  rodape?: ReactNode; // fixo na base, fora da rolagem
  estreita?: boolean; // web: conteúdo centralizado com no máximo 560 de largura
  rodapeBarra?: boolean; // rodapé como barra: borda superior fina de ponta a ponta
};

const web = Platform.OS === 'web';

// Web: margem lateral de 24 em janelas pequenas e de 48 em janelas gr  andes
export function margemWeb(largura: number) {
  return largura < 1024 ? 24 : 48;
}

export default function Tela({ children, rodape, estreita, rodapeBarra }: Props) {
  const { salvos, tema, alternarTema } = useApp();
  const { cores } = useTema();
  const navigation = useNavegacao();
  const rota = useRoute();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Web: 24/48 pela janela; no bloco estreito, 24
  const margem = web && { paddingHorizontal: estreita ? 24 : margemWeb(width) };
  // O botão mostra o tema para o qual vai trocar
  const proximoTema = tema === 'escuro' ? 'Claro' : 'Escuro';
  // Em telas de celular o rótulo vai em duas linhas para caber ao lado dos outros botões
  const cabecalhoCurto = width < 430;

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

  return (
    <View style={styles.container}>
      <View style={[styles.topo, { paddingTop: 16 + insets.top }]}>
        <View style={styles.logo}>
          <Icone nome="check" tamanho={22} cor={cores.vermelho} />
          <Texto style={styles.logoTexto}>
            Carne<Text style={{ color: cores.vermelho }}>Certa</Text>
          </Texto>
        </View>
        <View style={styles.acoes}>
          {rota.name === 'Inicio' && (
            <>
              <Pressable
                onPress={() => navigation.popTo('FichasSalvas')}
                accessibilityRole="button"
                accessibilityLabel="Fichas salvas"
              >
                <Gradiente
                  tipo="botao2"
                  style={[
                    styles.alternar,
                    cabecalhoCurto && styles.fichasCurto,
                    { borderColor: cores.linha25 },
                  ]}
                >
                  <Texto style={[styles.alternarTexto, cabecalhoCurto && styles.fichasCurtoTexto]}>
                    {cabecalhoCurto ? 'Fichas\nsalvas' : 'Fichas salvas'}
                  </Texto>
                </Gradiente>
              </Pressable>
              <Pressable onPress={alternarTema} accessibilityRole="button" accessibilityLabel={proximoTema}>
                <Gradiente tipo="botao2" style={[styles.alternar, { borderColor: cores.linha25 }]}>
                  <Texto style={styles.alternarTexto}>{proximoTema}</Texto>
                </Gradiente>
              </Pressable>
            </>
          )}
          <Pressable onPress={() => navigation.popTo('Carrinho')} accessibilityLabel="Carrinho">
            <Gradiente tipo="botao2" style={[styles.carrinho, { borderColor: cores.linha25 }]}>
              <Icone nome="cart-outline" tamanho={20} />
            </Gradiente>
            {salvos.length > 0 && (
              <View style={[styles.badge, { backgroundColor: cores.vermelho }]}>
                <Text style={[styles.badgeTexto, { color: cores.badgeTexto }]}>{salvos.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* O cabeçalho ocupa a largura toda; o bloco do meio pode ser estreito na web */}
      <View style={[styles.corpo, web && estreita && styles.corpoEstreito]}>
        <ScrollView style={styles.main} contentContainerStyle={[styles.mainConteudo, margem]}>
          {children}
        </ScrollView>
        {rodape ? (
          <View
            style={[
              styles.rodape,
              rodapeBarra && [styles.rodapeBarra, { borderTopColor: cores.linha15 }],
              margem,
            ]}
          >
            {rodape}
          </View>
        ) : null}
      </View>

      <Gradiente
        tipo="menu"
        style={[styles.menu, { borderTopColor: cores.linha15, paddingBottom: 14 + insets.bottom }]}
      >
        {item('Inicio', 'home-outline', 'Início')}
        {item('Catalogo', 'format-list-bulleted', 'Catálogo')}
        {item('Libras', 'wheelchair-accessibility', 'Libras')}
      </Gradiente>
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
  const { cores } = useTema();
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
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alternar: {
    height: 42,
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternarTexto: {
    fontSize: 14,
  },
  fichasCurto: {
    paddingHorizontal: 8,
  },
  fichasCurtoTexto: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
  carrinho: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 0.5,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: {
    fontSize: 12,
  },
  corpo: {
    flex: 1,
  },
  corpoEstreito: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  main: {
    flex: 1,
  },
  rodape: {
    paddingTop: 8,
    paddingHorizontal: 18,
  },
  rodapeBarra: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mainConteudo: {
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  menu: {
    borderTopWidth: 0.5,
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
