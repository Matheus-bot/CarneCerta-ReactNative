import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Children, ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
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
import { useTema } from '../contexto/AppContexto';
import { NomeIcone } from '../data/categorias';
import { FONTE, NomeGradiente, tamanho } from './tema';

type Filhos = { children?: ReactNode };

export function Icone({ nome, tamanho, cor }: { nome: NomeIcone; tamanho: number; cor?: string }) {
  const { cores } = useTema();
  return <MaterialCommunityIcons name={nome} size={tamanho} color={cor ?? cores.texto} />;
}

export function Gradiente({
  tipo,
  style,
  children,
}: Filhos & { tipo: NomeGradiente; style?: StyleProp<ViewStyle> }) {
  const { gradientes } = useTema();
  return (
    <LinearGradient {...gradientes[tipo]} style={style}>
      {children}
    </LinearGradient>
  );
}

// Bebas Neue (components/tema.ts) em todo texto, nos dois temas
export function Texto({ style, ...props }: TextProps) {
  const { cores } = useTema();
  return (
    <Text
      style={[styles.texto, { color: cores.texto }, style, FONTE]}
      {...props}
    />
  );
}

// .titulo
export function Titulo({ style, children }: Filhos & { style?: StyleProp<TextStyle> }) {
  const { cores } = useTema();
  return (
    <Texto style={[styles.titulo, { color: cores.titulo }, style]}>{children}</Texto>
  );
}

// .sub e .sub.red
export function Sub({
  vermelho,
  style,
  children,
  onPress,
}: Filhos & { vermelho?: boolean; style?: StyleProp<TextStyle>; onPress?: () => void }) {
  const { cores } = useTema();
  const cor = vermelho ? cores.vermelho : cores.sub;
  return (
    <Texto style={[styles.sub, { color: cor }, style]} onPress={onPress}>
      {children}
    </Texto>
  );
}

// .sec: título de seção com texto à direita
export function Secao({ titulo, direita }: { titulo: string; direita?: ReactNode }) {
  const { cores } = useTema();
  return (
    <View style={styles.secao}>
      <Texto style={[styles.secaoTitulo, { color: cores.titulo }]}>{titulo}</Texto>
      {direita}
    </View>
  );
}

// .btn (grande: versão maior usada no bloco principal da web; pilula: barra fixa do rodapé)
export function Botao({
  titulo,
  onPress,
  style,
  grande,
  pilula,
  accessibilityLabel = titulo,
}: {
  titulo: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  grande?: boolean;
  pilula?: boolean;
  accessibilityLabel?: string;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.botaoSombra,
        pilula && styles.botaoPilulaSombra,
        { boxShadow: cores.sombraBotao },
        style,
      ]}
    >
      <Gradiente
        tipo="botao"
        style={[styles.botao, grande && styles.botaoGrande, pilula && styles.botaoPilula]}
      >
        <Texto style={[styles.botaoTexto, { color: cores.botaoTexto }, grande && styles.botaoTextoGrande]}>
          {titulo}
        </Texto>
      </Gradiente>
    </Pressable>
  );
}

// .btn2
export function Botao2({
  titulo,
  onPress,
  style,
  accessibilityLabel = titulo,
}: {
  titulo: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.botao2Margem, style]}
    >
      <Gradiente tipo="botao2" style={[styles.botao2, { borderColor: cores.linha25 }]}>
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
  const { cores } = useTema();
  const conteudo = (
    <Gradiente tipo="cartao" style={[styles.cartao, { borderColor: cores.linha18 }, style]}>
      {children}
    </Gradiente>
  );
  return onPress ? <Pressable onPress={onPress}>{conteudo}</Pressable> : conteudo;
}


export function Foto({
  nome,
  altura = 84,
  fonte,
}: {
  nome: string;
  altura?: number;
  fonte?: ImageSourcePropType;
}) {
  const { cores } = useTema();
  if (fonte) {
    return <Image source={fonte} resizeMode="cover" style={[styles.fotoImagem, { height: altura }]} />;
  }
  return (
    <Gradiente tipo="foto" style={[styles.foto, { height: altura }]}>
      <Icone nome="image-outline" tamanho={16} cor={cores.fotoTexto} />
      <Text style={[styles.fotoTexto, { color: cores.fotoTexto }, FONTE]}>
        foto: {nome}
      </Text>
    </Gradiente>
  );
}

// .in
export function Entrada({ style, ...props }: TextInputProps) {
  const { cores } = useTema();
  return (
    <TextInput
      placeholderTextColor={cores.placeholder}
      style={[
        styles.entrada,
        { backgroundColor: cores.campo, borderColor: cores.linha20, color: cores.texto },
        style,
        FONTE,
      ]}
      {...props}
    />
  );
}

// Contador − campo +: os botões e o campo mexem no mesmo valor, sempre entre o mínimo e o máximo.
// O texto fica com quem usa: enquanto a pessoa digita, o campo pode ficar vazio; ao sair dele, volta ao mínimo
export function Contador({
  texto,
  aoMudar,
  minimo,
  maximo,
  rotulo,
}: {
  texto: string;
  aoMudar: (texto: string) => void;
  minimo: number;
  maximo: number;
  rotulo: string; // nome lido pelo leitor de tela (ex.: "Número de pessoas")
}) {
  const { cores } = useTema();
  const valor = Number(texto) || 0;
  const limitar = (n: number) => String(Math.min(maximo, Math.max(minimo, n)));

  function botao(sinal: -1 | 1) {
    const desativado = sinal < 0 ? valor <= minimo : valor >= maximo;
    return (
      <Pressable
        onPress={() => aoMudar(limitar(valor + sinal))}
        disabled={desativado}
        accessibilityRole="button"
        accessibilityLabel={sinal < 0 ? `Diminuir ${rotulo.toLowerCase()}` : `Aumentar ${rotulo.toLowerCase()}`}
        accessibilityState={{ disabled: desativado }}
        hitSlop={6}
        style={desativado && styles.contadorDesativado}
      >
        <Gradiente tipo="opcao" style={[styles.contadorBotao, { borderColor: cores.linha18 }]}>
          <Icone nome={sinal < 0 ? 'minus' : 'plus'} tamanho={26} cor={cores.titulo} />
        </Gradiente>
      </Pressable>
    );
  }

  return (
    <View style={styles.contador}>
      {botao(-1)}
      <Entrada
        value={texto}
        keyboardType="number-pad"
        maxLength={String(maximo).length}
        accessibilityLabel={rotulo}
        selectTextOnFocus
        onChangeText={(t) => {
          // Só números, sem zero à esquerda; acima do máximo, fica no máximo
          const numero = t.replace(/\D/g, '').replace(/^0+/, '');
          aoMudar(numero ? limitar(Number(numero)) : '');
        }}
        onBlur={() => {
          if (!texto) aoMudar(String(minimo));
        }}
        style={styles.contadorCampo}
      />
      {botao(1)}
    </View>
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
  const { cores } = useTema();
  return (
    <Pressable onPress={onPress} style={[styles.chipMargem, style]}>
      {ativo ? (
        <Gradiente tipo="chipAtivo" style={[styles.chip, styles.chipAtivo]}>
          <Texto style={[styles.chipTexto, { color: cores.chipTextoAtivo }]}>{titulo}</Texto>
        </Gradiente>
      ) : (
        <View style={[styles.chip, { borderColor: cores.chipBorda, backgroundColor: cores.chipFundo }]}>
          <Texto style={[styles.chipTexto, { color: cores.chipTexto }]}>{titulo}</Texto>
        </View>
      )}
    </Pressable>
  );
}

// Cartão de opção da tela de escolhas: preenche a célula da grade, para os cartões terem a mesma altura
export function Opcao({
  titulo,
  ativo,
  onPress,
}: {
  titulo: string;
  ativo?: boolean;
  onPress?: () => void;
}) {
  const { cores } = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={!!ativo}
      style={styles.opcaoToque}
    >
      <Gradiente
        tipo={ativo ? 'chipAtivo' : 'opcao'}
        style={[styles.opcao, { borderColor: ativo ? 'transparent' : cores.linha18 }]}
      >
        <Texto style={[styles.opcaoTexto, ativo && { color: cores.chipTextoAtivo }]}>{titulo}</Texto>
      </Gradiente>
    </Pressable>
  );
}

// .grid2: duas colunas iguais com espaço de 10
export function Grade2({ children }: Filhos) {
  return <Grade colunas={2}>{children}</Grade>;
}

// Colunas iguais com espaço de 10; a última linha é completada com espaços vazios
export function Grade({ colunas, children }: Filhos & { colunas: number }) {
  const itens = Children.toArray(children);
  const linhas: ReactNode[][] = [];
  for (let i = 0; i < itens.length; i += colunas) linhas.push(itens.slice(i, i + colunas));
  return (
    <View style={styles.grade}>
      {linhas.map((linha, i) => (
        <View key={i} style={styles.gradeLinha}>
          {linha.map((item, j) => (
            <View key={j} style={styles.gradeItem}>
              {item}
            </View>
          ))}
          {Array.from({ length: colunas - linha.length }, (_, j) => (
            <View key={'vazio' + j} style={styles.gradeItem} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  texto: {
    fontSize: tamanho(16),
  },
  titulo: {
    fontSize: tamanho(21),
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 12,
  },
  sub: {
    fontSize: tamanho(13),
    marginVertical: 4,
  },
  secao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 10,
  },
  secaoTitulo: {
    fontSize: tamanho(17),
    fontWeight: '600',
  },
  botaoSombra: {
    marginBottom: 8,
    borderRadius: 12,
  },
  botao: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  botaoTexto: {
    fontSize: tamanho(15),
    fontWeight: '600',
    textAlign: 'center',
  },
  botaoGrande: {
    height: 64,
    paddingVertical: 0,
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  botaoTextoGrande: {
    fontSize: tamanho(18),
  },
  botaoPilulaSombra: {
    borderRadius: 999,
  },
  botaoPilula: {
    borderRadius: 999,
    paddingVertical: 12,
  },
  botao2Margem: {
    marginBottom: 8,
  },
  botao2: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 11,
    alignItems: 'center',
  },
  botao2Texto: {
    fontSize: tamanho(14),
    textAlign: 'center',
  },
  cartao: {
    borderRadius: 16,
    borderWidth: 0.5,
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
  fotoImagem: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 8,
  },
  fotoTexto: {
    fontSize: tamanho(12),
  },
  entrada: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 11,
    fontSize: tamanho(14),
    marginBottom: 10,
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  contadorBotao: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorDesativado: {
    opacity: 0.4,
  },
  contadorCampo: {
    width: 96,
    marginBottom: 0,
    fontSize: tamanho(28),
    textAlign: 'center',
  },
  chipMargem: {
    marginRight: 6,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 0.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipAtivo: {
    borderColor: 'transparent',
  },
  chipTexto: {
    fontSize: tamanho(13),
  },
  opcaoToque: {
    flex: 1,
  },
  opcao: {
    flex: 1,
    minHeight: 72,
    borderWidth: 0.5,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoTexto: {
    fontSize: tamanho(15),
    fontWeight: '600',
    textAlign: 'center',
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
