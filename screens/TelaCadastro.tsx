import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Tela from '../components/Tela';
import { Botao, Botao2, Cartao, Entrada, Icone, Sub, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { CODIGO_ADMIN } from '../data/usuarios';
import { useNavegacao } from './rotas';

export default function TelaCadastro() {
  const { cadastrar } = useApp();
  const navigation = useNavegacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [admin, setAdmin] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');

  function fazerCadastro() {
    const n = nome.trim();
    const e = email.trim();
    if (!n || !e || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }
    if (admin && codigo !== CODIGO_ADMIN) {
      setErro('Código de administrador inválido.');
      return;
    }
    const tipo = admin ? 'admin' : 'usuario';
    cadastrar({ nome: n, email: e, senha, tipo });
    navigation.reset({ index: 0, routes: [{ name: tipo === 'admin' ? 'Admin' : 'Inicio' }] });
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
      <Cartao>
        <Pressable style={styles.marcar} onPress={() => setAdmin(!admin)}>
          <Icone nome={admin ? 'checkbox-marked' : 'checkbox-blank-outline'} tamanho={18} />
          <Texto style={styles.marcarTexto}>Sou administrador</Texto>
        </Pressable>
        <Entrada
          placeholder="Código de administrador"
          value={codigo}
          onChangeText={setCodigo}
          style={styles.codigo}
        />
      </Cartao>
      <Botao titulo="Cadastrar" onPress={fazerCadastro} />
      <Sub vermelho>{erro}</Sub>
      <Botao2 titulo="Voltar" onPress={() => navigation.popTo('Login')} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  marcar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marcarTexto: {
    fontSize: 14,
  },
  codigo: {
    marginTop: 8,
    marginBottom: 0,
  },
});
