import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import { Cartao, Grade2, Icone, Texto, Titulo } from '../components/ui';
import { categorias } from '../data/categorias';
import { useNavegacao } from './rotas';

export default function TelaCategorias() {
  const navigation = useNavegacao();

  return (
    <Tela>
      <Titulo>Categorias</Titulo>
      <Grade2>
        {categorias.map((c) => (
          <Cartao
            key={c.id}
            style={styles.cartao}
            onPress={() => navigation.popTo('Escolhas', { cat: c.id })}
          >
            <Icone nome={c.icone} tamanho={36} cor={cores.vermelho} />
            <Texto style={styles.nome}>{c.nome}</Texto>
          </Cartao>
        ))}
      </Grade2>
    </Tela>
  );
}

const styles = StyleSheet.create({
  cartao: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  nome: {
    fontWeight: '600',
    marginTop: 8,
  },
});
