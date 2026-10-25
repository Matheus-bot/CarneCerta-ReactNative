import { createContext, ReactNode, useContext, useState } from 'react';
import { Carne, carnes } from '../data/carnes';
import { ItemCarrinho } from '../data/escolha';
import { Usuario, usuarios as usuariosIniciais } from '../data/usuarios';

type AppContextoTipo = {
  usuario: Usuario | null;
  carnes: Carne[];
  salvos: ItemCarrinho[];
  entrar: (email: string, senha: string) => Usuario | null;
  cadastrar: (novo: Usuario) => void;
  sair: () => void;
  adicionarItem: (item: ItemCarrinho) => void;
  removerSalvo: (id: number) => void;
  carneById: (id: number) => Carne | undefined;
  disponiveis: () => Carne[];
};

const AppContexto = createContext<AppContextoTipo | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [salvos, setSalvos] = useState<ItemCarrinho[]>([]);

  function entrar(email: string, senha: string) {
    const u = usuarios.find((x) => x.email === email && x.senha === senha) ?? null;
    if (u) setUsuario(u);
    return u;
  }

  function cadastrar(novo: Usuario) {
    setUsuarios((lista) => [...lista, novo]);
    setUsuario(novo);
  }

  function sair() {
    setUsuario(null);
    setSalvos([]);
  }

  function adicionarItem(item: ItemCarrinho) {
    setSalvos((lista) => [...lista, item]);
  }

  function removerSalvo(id: number) {
    setSalvos((lista) => lista.filter((s) => s.id !== id));
  }

  function carneById(id: number) {
    return carnes.find((c) => c.id === id);
  }

  function disponiveis() {
    return carnes.filter((c) => c.ativo);
  }

  return (
    <AppContexto.Provider
      value={{
        usuario,
        carnes,
        salvos,
        entrar,
        cadastrar,
        sair,
        adicionarItem,
        removerSalvo,
        carneById,
        disponiveis,
      }}
    >
      {children}
    </AppContexto.Provider>
  );
}

export function useApp() {
  const contexto = useContext(AppContexto);
  if (!contexto) throw new Error('useApp precisa estar dentro de AppProvider');
  return contexto;
}
