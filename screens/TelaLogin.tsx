import { useState } from 'react';
import Tela from '../components/Tela';
import { Botao, Botao2, Entrada, Sub, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { useNavegacao } from './rotas';

export default function TelaLogin() {
  const { entrar } = useApp();
  const navigation = useNavegacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function fazerLogin() {
    const u = entrar(email, senha);
    if (!u) {
      setErro('E-mail ou senha incorretos.');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  }

  return (
    <Tela>
      <Titulo>Entrar</Titulo>
      <Entrada
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Entrada placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <Botao titulo="Entrar" onPress={fazerLogin} />
      <Sub vermelho>{erro}</Sub>
      <Botao2 titulo="Criar conta" onPress={() => navigation.popTo('Cadastro')} />
      <Sub>Conta de teste: user@carnecerta.com, senha 1234.</Sub>
    </Tela>
  );
}
