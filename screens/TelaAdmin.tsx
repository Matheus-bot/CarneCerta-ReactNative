import Tela from '../components/Tela';
import { Sub, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';

// PLACEHOLDER: as abas Carnes, Gostos, Libras e Balcões entram no Bloco 3
export default function TelaAdmin() {
  const { usuario } = useApp();

  if (usuario?.tipo !== 'admin') {
    return (
      <Tela>
        <Sub>Acesso restrito ao administrador.</Sub>
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Administração</Titulo>
    </Tela>
  );
}
