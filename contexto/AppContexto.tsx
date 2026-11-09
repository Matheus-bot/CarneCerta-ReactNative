import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { NomeTema, temas } from '../components/tema';
import { lerCarrinho, salvarCarrinho } from '../data/banco';
import { Carne, carnes } from '../data/carnes';
import { ItemCarrinho } from '../data/escolha';

type AppContextoTipo = {
  carnes: Carne[];
  salvos: ItemCarrinho[];
  adicionarItem: (item: ItemCarrinho) => void;
  removerSalvo: (id: number) => void;
  carneById: (id: number) => Carne | undefined;
  disponiveis: () => Carne[];
  tema: NomeTema;
  alternarTema: () => void;
};

const AppContexto = createContext<AppContextoTipo | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Vazio até a leitura do banco terminar
  const [salvos, setSalvos] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);
  // Não é salvo nem segue o aparelho: o app sempre abre no escuro
  const [tema, setTema] = useState<NomeTema>('escuro');

  useEffect(() => {
    lerCarrinho().then((guardados) => {
      // Mantém o que foi adicionado enquanto a leitura não terminava
      setSalvos((atuais) => [...guardados, ...atuais]);
      setCarregado(true);
    });
  }, []);

  // Só salva depois de ler, para não apagar o carrinho guardado com a lista ainda vazia
  useEffect(() => {
    if (carregado) salvarCarrinho(salvos);
  }, [salvos, carregado]);

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

  function alternarTema() {
    setTema((atual) => (atual === 'escuro' ? 'claro' : 'escuro'));
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
        tema,
        alternarTema,
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

// Cores e gradientes do tema escolhido
export function useTema() {
  return temas[useApp().tema];
}
