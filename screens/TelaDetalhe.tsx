import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Tela from '../components/Tela';
import { Botao2, Cartao, Foto, Gradiente, Icone, Sub, Texto, Titulo } from '../components/ui';
import { useApp, useTema } from '../contexto/AppContexto';
import { nomeCategoria } from '../data/categorias';
import { fotoDaCarne } from '../data/imagensCategorias';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Detalhe'>;

export default function TelaDetalhe({ route, navigation }: Props) {
  const { id, origem } = route.params;
  const { carneById } = useApp();
  const { cores } = useTema();
  const [ficha, setFicha] = useState(false);
  const c = carneById(id);
  const libras = origem === 'libras';

  // Outra carne: fecha a ficha
  useEffect(() => setFicha(false), [id]);

  if (!c) return <Tela />;

  return (
    <Tela>
      <Foto nome={c.foto} fonte={fotoDaCarne(c)} altura={120} />
      <Titulo style={styles.semMargemTopo}>{c.nome}</Titulo>
      <Sub vermelho>{c.cat.map(nomeCategoria).join(', ')}</Sub>

      {libras ? (
        <Gradiente tipo="libras" style={styles.video}>
          {c.libras ? (
            <>
              <Icone nome="video-outline" tamanho={30} cor={cores.sub} />
              <Text style={[styles.videoTexto, { color: cores.sub }]}>Vídeo em Libras cadastrado</Text>
              <Text style={[styles.videoTexto, styles.videoLink, { color: cores.sub }]}>{c.libras}</Text>
            </>
          ) : (
            <>
              <Icone nome="video-off-outline" tamanho={30} cor={cores.sub} />
              <Text style={[styles.videoTexto, { color: cores.sub }]}>
                Vídeo em Libras ainda não cadastrado.
              </Text>
            </>
          )}
        </Gradiente>
      ) : (
        <Texto style={styles.descricao}>{c.desc}</Texto>
      )}

      <Cartao>
        <Sub>
          Economia: {c.economia}/3 · Maciez: {c.maciez}/3 · Sabor: {c.sabor}/3
        </Sub>
      </Cartao>

      {libras && (
        <>
          <Botao2
            titulo={ficha ? 'Ocultar ficha' : 'Ver ficha para o açougueiro'}
            onPress={() => setFicha(!ficha)}
          />
          {ficha && (
            <Gradiente tipo="ficha" style={styles.ficha}>
              <Text style={[styles.fichaTexto, { color: cores.tinta }]}>
                <Text style={styles.negrito}>Ficha do corte</Text>
                {'\n'}Corte: {c.nome}                {'\n'}Indicação: {c.desc}
                {'\n'}Observação: mostre esta ficha ao açougueiro.
              </Text>
            </Gradiente>
          )}
        </>
      )}

      <Botao2
        titulo="Voltar"
        style={styles.voltar}
        onPress={() => navigation.popTo(libras ? 'Libras' : 'Catalogo')}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  semMargemTopo: {
    marginTop: 0,
  },
  video: {
    height: 170,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  videoTexto: {
    fontSize: 13,
    textAlign: 'center',
  },
  videoLink: {
    fontSize: 11,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 15,
  },
  ficha: {
    borderRadius: 14,
    padding: 14,
  },
  fichaTexto: {
    fontSize: 14,
    lineHeight: 24,
  },
  negrito: {
    fontWeight: 'bold',
  },
  voltar: {
    marginTop: 8,
  },
});
