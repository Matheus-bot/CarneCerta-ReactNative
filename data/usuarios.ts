export type Usuario = {
  nome: string;
  email: string;
  senha: string; // texto puro como no protótipo; forma de guardar ainda pendente
  tipo: 'admin' | 'usuario';
  gostos?: number[]; // ids das carnes escolhidas na tela "O que você gosta?"
};

// Código exigido no cadastro para criar conta de administrador
export const CODIGO_ADMIN = 'CARNE2026';

export const usuarios: Usuario[] = [
  { nome: 'Admin', email: 'admin@carnecerta.com', senha: '1234', tipo: 'admin' },
  { nome: 'Usuário', email: 'user@carnecerta.com', senha: '1234', tipo: 'usuario' },
];
