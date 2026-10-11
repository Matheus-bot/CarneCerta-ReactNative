import { Pressable, StyleSheet, View } from 'react-native';
import { Carne } from '../data/carnes';
import { iconeCategoria, nomeCategoria } from '../data/categorias';
import { cores } from './tema';
import { Gradiente, Icone, Sub, Texto } from './ui';

// Alturas alternadas dos blocos, como no protótipo
const ALTURAS = [150, 190, 130, 175, 145, 200, 140, 180];

type Props = {
  carnes: Carne[];
  selecionada: (c: Carne) => boolean;
  onToque: (c: Carne) => void;
};

// .mas: duas colunas; a primeira metade dos itens vai na coluna da esquerda
export default function Mosaico({ carnes, selecionada, onToque }: Props) {
  const metade = Math.ceil(carnes.length / 2);
  const colunas = [carnes.slice(0, metade), carnes.slice(metade)];

  return (
    <View style={styles.mosaico}>
      {colunas.map((coluna, k) => (
        <View key={k} style={styles.coluna}>
          {coluna.map((c, i) => {
            const on = selecionada(c);
            const indice = k === 0 ? i : metade + i;
            return (
              <Pressable key={c.id} onPress={() => onToque(c)}>
                <Gradiente
                  tipo={on ? 'tileAtivo' : 'quadrado'}
                  style={[styles.tile, on && styles.tileAtivo, { height: ALTURAS[indice % ALTURAS.length] }]}
                >
                  {on && (
                    <View style={styles.marca}>
                      <Icone nome="check" tamanho={14} cor="#fff" />
                    </View>
                  )}
                  <Icone nome={iconeCategoria(c.cat)} tamanho={30} cor={cores.vermelhoIcone} />
                  <View>
                    <Texto style={styles.nome}>{c.nome}</Texto>
                    <Sub style={styles.categoria}>{nomeCategoria(c.cat)}</Sub>
                  </View>
                </Gradiente>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mosaico: {
    flexDirection: 'row',
    gap: 10,
  },
  coluna: {
    flex: 1,
  },
  tile: {
    marginBottom: 10,
    borderRadius: 18,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'space-between',
  },
  tileAtivo: {
    borderWidth: 2,
    borderColor: cores.vermelho,
  },
  marca: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoria: {
    marginTop: 2,
    marginBottom: 0,
  },
});
