import { useState } from 'react';
import Tela from '../components/Tela';
import { Botao, Botao2, Entrada, Sub, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { useNavegacao } from './rotas';

export default function TelaCadastro() {
  const { cadastrar } = useApp();
  const navigation = useNavegacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function fazerCadastro() {
    const n = nome.trim();
    const e = email.trim();
    if (!n || !e || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }
    cadastrar({ nome: n, email: e, senha });
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  }

  return (
    <Tela>
      <Titulo>Criar conta</Titulo>
      <Entrada placeholder="Nome completo" value={nome} onChangeText={setNome} />
      <Entrada
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Entrada placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <Botao titulo="Cadastrar" onPress={fazerCadastro} />
      <Sub vermelho>{erro}</Sub>
      <Botao2 titulo="Voltar" onPress={() => navigation.popTo('Login')} />
    </Tela>
  );
}
