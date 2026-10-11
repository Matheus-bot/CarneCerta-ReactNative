import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Children, ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { NomeIcone } from '../data/categorias';
import { cores, gradientes } from './tema';

type Filhos = { children?: ReactNode };

export function Icone({ nome, tamanho, cor }: { nome: NomeIcone; tamanho: number; cor?: string }) {
  return <MaterialCommunityIcons name={nome} size={tamanho} color={cor ?? cores.texto} />;
}

export function Gradiente({
  tipo,
  style,
  children,
}: Filhos & { tipo: keyof typeof gradientes; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient {...gradientes[tipo]} style={style}>
      {children}
    </LinearGradient>
  );
}

// Texto padrão (cor clara)
export function Texto({ style, ...props }: TextProps) {
  return <Text style={[styles.texto, style]} {...props} />;
}

// .titulo
export function Titulo({ style, children }: Filhos & { style?: StyleProp<TextStyle> }) {
  return <Texto style={[styles.titulo, style]}>{children}</Texto>;
}

// .sub e .sub.red
export function Sub({
  vermelho,
  style,
  children,
  onPress,
}: Filhos & { vermelho?: boolean; style?: StyleProp<TextStyle>; onPress?: () => void }) {
  return (
    <Texto style={[styles.sub, vermelho && styles.vermelho, style]} onPress={onPress}>
      {children}
    </Texto>
  );
}

// .sec: título de seção com texto à direita
export function Secao({ titulo, direita }: { titulo: string; direita?: ReactNode }) {
  return (
    <View style={styles.secao}>
      <Texto style={styles.secaoTitulo}>{titulo}</Texto>
      {direita}
    </View>
  );
}

// .btn
export function Botao({
  titulo,
  onPress,
  style,
}: {
  titulo: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.botaoSombra, style]}>
      <Gradiente tipo="botao" style={styles.botao}>
        <Texto style={styles.botaoTexto}>{titulo}</Texto>
      </Gradiente>
    </Pressable>
  );
}

// .btn2
export function Botao2({
  titulo,
  onPress,
  style,
}: {
  titulo: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.botao2Margem, style]}>
      <Gradiente tipo="botao2" style={styles.botao2}>
        <Texto style={styles.botao2Texto}>{titulo}</Texto>
      </Gradiente>
    </Pressable>
  );
}

// .card
export function Cartao({
  onPress,
  style,
  children,
}: Filhos & { onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const conteudo = (
    <Gradiente tipo="cartao" style={[styles.cartao, style]}>
      {children}
    </Gradiente>
  );
  return onPress ? <Pressable onPress={onPress}>{conteudo}</Pressable> : conteudo;
}

// .foto
export function Foto({ nome, altura = 84 }: { nome: string; altura?: number }) {
  return (
    <Gradiente tipo="foto" style={[styles.foto, { height: altura }]}>
      <Icone nome="image-outline" tamanho={16} cor="#d6d6de" />
      <Text style={styles.fotoTexto}>foto: {nome}</Text>
    </Gradiente>
  );
}

// .in
export function Entrada({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="rgba(245,245,247,0.5)"
      style={[styles.entrada, style]}
      {...props}
    />
  );
}

// .chip e .chip.on
export function Chip({
  titulo,
  ativo,
  onPress,
  style,
}: {
  titulo: string;
  ativo?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chipMargem, style]}>
      {ativo ? (
        <Gradiente tipo="botao" style={[styles.chip, styles.chipAtivo]}>
          <Texto style={styles.chipTexto}>{titulo}</Texto>
        </Gradiente>
      ) : (
        <View style={styles.chip}>
          <Texto style={styles.chipTexto}>{titulo}</Texto>
        </View>
      )}
    </Pressable>
  );
}

// .opt e .opt.on
export function Opcao({
  titulo,
  ativo,
  onPress,
}: {
  titulo: string;
  ativo?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Gradiente
        tipo={ativo ? 'opcaoAtiva' : 'opcao'}
        style={[styles.opcao, ativo && styles.opcaoAtiva]}
      >
        <Texto style={styles.opcaoTexto}>{titulo}</Texto>
      </Gradiente>
    </Pressable>
  );
}

// .grid2: duas colunas iguais com espaço de 10
export function Grade2({ children }: Filhos) {
  const itens = Children.toArray(children);
  const linhas: ReactNode[][] = [];
  for (let i = 0; i < itens.length; i += 2) linhas.push(itens.slice(i, i + 2));
  return (
    <View style={styles.grade}>
      {linhas.map((linha, i) => (
        <View key={i} style={styles.gradeLinha}>
          {linha.map((item, j) => (
            <View key={j} style={styles.gradeItem}>
              {item}
            </View>
          ))}
          {linha.length === 1 && <View style={styles.gradeItem} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  texto: {
    color: cores.texto,
    fontSize: 16,
  },
  titulo: {
    fontSize: 21,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 12,
  },
  sub: {
    color: cores.sub,
    fontSize: 13,
    marginVertical: 4,
  },
  vermelho: {
    color: cores.vermelho,
  },
  secao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: '600',
  },
  botaoSombra: {
    marginBottom: 8,
    borderRadius: 12,
    boxShadow: '0px 4px 14px rgba(224, 48, 46, 0.35)',
  },
  botao: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  botao2Margem: {
    marginBottom: 8,
  },
  botao2: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 11,
    alignItems: 'center',
  },
  botao2Texto: {
    fontSize: 14,
    textAlign: 'center',
  },
  cartao: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 12,
    marginBottom: 10,
  },
  foto: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  fotoTexto: {
    color: '#d6d6de',
    fontSize: 12,
  },
  entrada: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 11,
    color: cores.texto,
    fontSize: 14,
    marginBottom: 10,
  },
  chipMargem: {
    marginRight: 6,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipAtivo: {
    borderColor: 'transparent',
  },
  chipTexto: {
    fontSize: 13,
  },
  opcao: {
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },
  opcaoAtiva: {
    borderColor: cores.vermelho,
  },
  opcaoTexto: {
    fontSize: 15,
  },
  grade: {
    gap: 10,
  },
  gradeLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  gradeItem: {
    flex: 1,
  },
});
