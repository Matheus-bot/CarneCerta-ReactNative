export type Usuario = {
  nome: string;
  email: string;
  senha: string; // texto puro como no protótipo; forma de guardar ainda pendente
};

export const usuarios: Usuario[] = [
  { nome: 'Usuário', email: 'user@carnecerta.com', senha: '1234' },
];
