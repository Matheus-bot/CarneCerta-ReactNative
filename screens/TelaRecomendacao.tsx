import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Foto, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { Carne } from '../data/carnes';
import { RootStackParamList } from './rotas';

type Props = NativeStackScreenProps<RootStackParamList, 'Recomendacao'>;

export default function TelaRecomendacao({ route, navigation }: Props) {
  const { cat, ids } = route.params;
  const { carneById, salvarRecomendacao } = useApp();
  const [msg, setMsg] = useState('');
  const top = ids.map(carneById).filter((c): c is Carne => !!c);

  // Nova recomendação: limpa a mensagem
  useEffect(() => setMsg(''), [ids]);

  function salvar() {
    salvarRecomendacao(cat, ids);
    setMsg('Recomendação salva no carrinho.');
  }

  return (
    <Tela>
      <Titulo>Seu TOP 3</Titulo>
      {msg ? <Sub vermelho>{msg}</Sub> : null}
      {top.map((c, i) => (
        <Cartao
          key={c.id}
          onPress={() => navigation.popTo('Detalhe', { id: c.id, origem: 'catalogo' })}
        >
          <Foto nome={c.foto} />
          <Sub vermelho>#{i + 1}</Sub>
          <Texto style={styles.nome}>{c.nome}</Texto>
          <Sub>{c.desc}</Sub>
        </Cartao>
      ))}
      <Sub>Pontuação de exemplo. A tabela de regras do TOP 3 será aplicada depois.</Sub>
      <Botao titulo="Salvar recomendação" onPress={salvar} />
      <Botao2 titulo="Nova escolha" onPress={() => navigation.popTo('Categorias')} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  nome: {
    fontSize: 17,
    fontWeight: '600',
  },
});
