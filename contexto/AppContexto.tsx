import { createContext, ReactNode, useContext, useState } from 'react';
import { Carne, carnes as carnesIniciais } from '../data/carnes';
import { Usuario, usuarios as usuariosIniciais } from '../data/usuarios';

export type RecomendacaoSalva = {
  id: number;
  cat: string;
  ids: number[];
};

type AppContextoTipo = {
  usuario: Usuario | null;
  carnes: Carne[];
  salvos: RecomendacaoSalva[];
  entrar: (email: string, senha: string) => Usuario | null;
  cadastrar: (novo: Usuario) => void;
  sair: () => void;
  salvarGostos: (ids: number[]) => void;
  salvarRecomendacao: (cat: string, ids: number[]) => void;
  removerSalvo: (id: number) => void;
  carneById: (id: number) => Carne | undefined;
  disponiveis: () => Carne[];
};

const AppContexto = createContext<AppContextoTipo | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carnes] = useState<Carne[]>(carnesIniciais);
  const [salvos, setSalvos] = useState<RecomendacaoSalva[]>([]);

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

  function salvarGostos(ids: number[]) {
    if (!usuario) return;
    const atualizado = { ...usuario, gostos: ids };
    setUsuario(atualizado);
    setUsuarios((lista) => lista.map((u) => (u.email === usuario.email ? atualizado : u)));
  }

  function salvarRecomendacao(cat: string, ids: number[]) {
    setSalvos((lista) => [...lista, { id: Date.now(), cat, ids }]);
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
        salvarGostos,
        salvarRecomendacao,
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
