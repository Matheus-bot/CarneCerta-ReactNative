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
  // Administração (as funções devolvem a mensagem mostrada na tela)
  toggleAtivo: (id: number) => string;
  salvarCarne: (id: number, nome: string, desc: string, valor: string) => string;
  salvarLibras: (id: number, link: string) => string;
  adicionarCarne: (nova: NovaCarne) => { ok: boolean; msg: string };
  alternarGosto: (id: number) => string;
};

export type NovaCarne = {
  nome: string;
  valor: string;
  desc: string;
  cat: string;
  libras: string;
};

const AppContexto = createContext<AppContextoTipo | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carnes, setCarnes] = useState<Carne[]>(carnesIniciais);
  const [salvos, setSalvos] = useState<RecomendacaoSalva[]>([]);
  const [proximoId, setProximoId] = useState(carnesIniciais.length + 1);

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

  function alterarCarne(id: number, mudancas: Partial<Carne>) {
    setCarnes((lista) => lista.map((c) => (c.id === id ? { ...c, ...mudancas } : c)));
  }

  function toggleAtivo(id: number) {
    const c = carneById(id);
    if (!c) return '';
    alterarCarne(id, { ativo: !c.ativo });
    return !c.ativo
      ? '"' + c.nome + '" disponível para usuários.'
      : '"' + c.nome + '" oculta dos usuários.';
  }

  function salvarCarne(id: number, nome: string, desc: string, valor: string) {
    alterarCarne(id, { nome, desc, valor });
    return 'Carne "' + nome + '" salva.';
  }

  function salvarLibras(id: number, link: string) {
    const c = carneById(id);
    if (!c) return '';
    const libras = link.trim();
    alterarCarne(id, { libras });
    return libras ? 'Vídeo de "' + c.nome + '" cadastrado.' : 'Link de "' + c.nome + '" removido.';
  }

  function adicionarCarne(nova: NovaCarne) {
    const nome = nova.nome.trim();
    const valor = nova.valor.trim();
    if (!nome || !valor) return { ok: false, msg: 'Informe nome e valor da carne.' };
    setCarnes((lista) => [
      ...lista,
      {
        id: proximoId,
        nome,
        cat: nova.cat,
        economia: 2,
        maciez: 2,
        sabor: 2,
        desc: nova.desc.trim() || 'Sem descrição.',
        valor,
        foto: nome.toLowerCase(),
        libras: nova.libras.trim(),
        ativo: true,
        gosto: true,
      },
    ]);
    setProximoId(proximoId + 1);
    return { ok: true, msg: 'Carne "' + nome + '" cadastrada.' };
  }

  function alternarGosto(id: number) {
    const c = carneById(id);
    if (!c) return '';
    alterarCarne(id, { gosto: !c.gosto });
    return !c.gosto
      ? '"' + c.nome + '" aparece nas opções de gosto.'
      : '"' + c.nome + '" removida das opções de gosto.';
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
        toggleAtivo,
        salvarCarne,
        salvarLibras,
        adicionarCarne,
        alternarGosto,
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
