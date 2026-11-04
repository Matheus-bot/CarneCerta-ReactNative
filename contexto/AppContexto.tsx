import 'expo-sqlite/localStorage/install';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Carne, carnes } from '../data/carnes';
import { ItemCarrinho } from '../data/escolha';

type AppContextoTipo = {
  carnes: Carne[];
  salvos: ItemCarrinho[];
  adicionarItem: (item: ItemCarrinho) => void;
  removerSalvo: (id: number) => void;
  carneById: (id: number) => Carne | undefined;
  disponiveis: () => Carne[];
};

const AppContexto = createContext<AppContextoTipo | null>(null);

// Carrinho guardado no aparelho: SQLite no celular, localStorage do navegador na web
const CHAVE_CARRINHO = 'carrinho';

function carregarCarrinho(): ItemCarrinho[] {
  try {
    const texto = localStorage.getItem(CHAVE_CARRINHO);
    return texto ? JSON.parse(texto) : [];
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [salvos, setSalvos] = useState<ItemCarrinho[]>(carregarCarrinho);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(salvos));
    } catch {
      // sem armazenamento disponível: o carrinho fica só na memória
    }
  }, [salvos]);

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
        carnes,
        salvos,
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
