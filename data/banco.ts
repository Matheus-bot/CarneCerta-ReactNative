import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { ItemCarrinho, normalizarItem } from './escolha';

export type FichaSalva = {
  id: number;
  criadaEm: string; // data ISO
  itens: ItemCarrinho[];
};

const NOME_BANCO = 'carnecerta.db';
const CHAVE_CARRINHO = 'carrinho';

// Na web, um worker que não carrega nunca responde: desiste para o app seguir sem salvar
const LIMITE_ABERTURA = 5000;

// Grava e lê só as escolhas, nunca o peso: ao abrir, o peso é recalculado com as regras atuais.
// Carrinho ou ficha antiga com peso gravado: o peso é ignorado na leitura (nada é apagado do banco)
const paraGravar = (itens: ItemCarrinho[]) => JSON.stringify(itens.map(normalizarItem));
const lerItens = (dados: string): ItemCarrinho[] => JSON.parse(dados).map(normalizarItem);

let conexao: Promise<SQLiteDatabase> | null = null;

async function abrirECriarTabelas() {
  const db = await openDatabaseAsync(NOME_BANCO);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS kv (chave TEXT PRIMARY KEY, valor TEXT);
    CREATE TABLE IF NOT EXISTS fichas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      criada_em TEXT,
      dados TEXT
    );
  `);
  return db;
}

function abrir() {
  if (!conexao) {
    let limite: ReturnType<typeof setTimeout>;
    const tempoEsgotado = new Promise<never>((_, rejeitar) => {
      limite = setTimeout(() => rejeitar(new Error('o banco demorou para abrir')), LIMITE_ABERTURA);
    });
    conexao = Promise.race([abrirECriarTabelas(), tempoEsgotado]).finally(() => clearTimeout(limite));
    // Se falhou, a próxima operação tenta abrir de novo
    conexao.catch(() => {
      conexao = null;
    });
  }
  return conexao;
}

// Uma operação por vez, na ordem pedida: o último carrinho salvo é sempre o que fica
let fila: Promise<unknown> = Promise.resolve();

function executar<T>(tarefa: (db: SQLiteDatabase) => Promise<T>, vazio: T): Promise<T> {
  const resultado = fila.then(async () => {
    try {
      return await tarefa(await abrir());
    } catch (erro) {
      console.warn('Banco indisponível, o app segue sem salvar:', erro);
      return vazio;
    }
  });
  fila = resultado;
  return resultado;
}

export function lerCarrinho() {
  return executar<ItemCarrinho[]>(async (db) => {
    const linha = await db.getFirstAsync<{ valor: string }>(
      'SELECT valor FROM kv WHERE chave = ?',
      CHAVE_CARRINHO,
    );
    return linha ? lerItens(linha.valor) : [];
  }, []);
}

export function salvarCarrinho(itens: ItemCarrinho[]) {
  return executar(async (db) => {
    await db.runAsync(
      'INSERT OR REPLACE INTO kv (chave, valor) VALUES (?, ?)',
      CHAVE_CARRINHO,
      paraGravar(itens),
    );
    return true;
  }, false);
}

// Da mais recente para a mais antiga
export function listarFichas() {
  return executar<FichaSalva[]>(async (db) => {
    const linhas = await db.getAllAsync<{ id: number; criada_em: string; dados: string }>(
      'SELECT id, criada_em, dados FROM fichas ORDER BY id DESC',
    );
    return linhas.map((l) => ({ id: l.id, criadaEm: l.criada_em, itens: lerItens(l.dados) }));
  }, []);
}

// Devolve o id da ficha criada, ou null se não salvou
export function salvarFicha(itens: ItemCarrinho[]) {
  return executar<number | null>(async (db) => {
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO fichas (criada_em, dados) VALUES (?, ?)',
      new Date().toISOString(),
      paraGravar(itens),
    );
    return lastInsertRowId;
  }, null);
}

export function excluirFicha(id: number) {
  return executar(async (db) => {
    await db.runAsync('DELETE FROM fichas WHERE id = ?', id);
    return true;
  }, false);
}
