import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mosaico from '../components/Mosaico';
import Tela from '../components/Tela';
import { cores } from '../components/tema';
import {
  Botao,
  Botao2,
  Cartao,
  Chip,
  Entrada,
  Gradiente,
  Sub,
  Texto,
  Titulo,
} from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { balcoes } from '../data/balcoes';
import { Carne } from '../data/carnes';
import { categorias } from '../data/categorias';

type Aba = 'carnes' | 'gostos' | 'libras' | 'iot';

const ABAS: [Aba, string][] = [
  ['carnes', 'Carnes'],
  ['gostos', 'Gostos'],
  ['libras', 'Libras'],
  ['iot', 'Balcões'],
];

export default function TelaAdmin() {
  const { usuario } = useApp();
  const [aba, setAba] = useState<Aba>('carnes');
  const [msg, setMsg] = useState('');

  if (usuario?.tipo !== 'admin') {
    return (
      <Tela>
        <Sub>Acesso restrito ao administrador.</Sub>
      </Tela>
    );
  }

  const mensagem = msg ? <Sub vermelho>{msg}</Sub> : null;

  return (
    <Tela>
      <Titulo>Administração</Titulo>
      <View style={styles.abas}>
        {ABAS.map(([valor, titulo]) => (
          <Chip
            key={valor}
            titulo={titulo}
            ativo={aba === valor}
            onPress={() => {
              setAba(valor);
              setMsg('');
            }}
          />
        ))}
      </View>

      {aba === 'carnes' && <AbaCarnes mensagem={mensagem} setMsg={setMsg} />}
      {aba === 'gostos' && <AbaGostos mensagem={mensagem} setMsg={setMsg} />}
      {aba === 'libras' && <AbaLibras mensagem={mensagem} setMsg={setMsg} />}
      {aba === 'iot' && <AbaBalcoes />}
    </Tela>
  );
}

type PropsAba = {
  mensagem: ReactNode;
  setMsg: (msg: string) => void;
};

function AbaCarnes({ mensagem, setMsg }: PropsAba) {
  const { carnes, adicionarCarne } = useApp();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState(categorias[0].id);
  const [libras, setLibras] = useState('');

  function cadastrar() {
    const r = adicionarCarne({ nome, valor, desc, cat, libras });
    setMsg(r.msg);
    if (r.ok) {
      setNome('');
      setValor('');
      setDesc('');
      setCat(categorias[0].id);
      setLibras('');
    }
  }

  return (
    <>
      {mensagem}
      <Cartao>
        <Texto style={styles.negritoTitulo}>Cadastrar nova carne</Texto>
        <Entrada placeholder="Nome da carne" value={nome} onChangeText={setNome} />
        <Entrada placeholder="Valor (ex.: R$ 50,00/kg)" value={valor} onChangeText={setValor} />
        <Entrada placeholder="Descrição" value={desc} onChangeText={setDesc} />
        <View style={styles.categorias}>
          {categorias.map((c) => (
            <Chip key={c.id} titulo={c.nome} ativo={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </View>
        <Entrada
          placeholder="Link do vídeo em Libras (opcional)"
          value={libras}
          onChangeText={setLibras}
          autoCapitalize="none"
        />
        <Botao titulo="Cadastrar carne" style={styles.semMargem} onPress={cadastrar} />
      </Cartao>
      <Sub style={styles.legenda}>
        Catálogo padrão ({carnes.length} carnes). Desmarque as que não quer mostrar para os
        usuários.
      </Sub>
      {carnes.map((c) => (
        <CartaoCarne key={c.id} carne={c} setMsg={setMsg} />
      ))}
    </>
  );
}

function CartaoCarne({ carne, setMsg }: { carne: Carne; setMsg: (msg: string) => void }) {
  const { toggleAtivo, salvarCarne } = useApp();
  const [nome, setNome] = useState(carne.nome);
  const [valor, setValor] = useState(carne.valor);
  const [desc, setDesc] = useState(carne.desc);

  return (
    <Cartao>
      <View style={styles.linha}>
        <Texto style={styles.negrito}>{carne.nome}</Texto>
        <Chip
          titulo={carne.ativo ? 'Disponível' : 'Oculta'}
          ativo={carne.ativo}
          style={styles.semMargem}
          onPress={() => setMsg(toggleAtivo(carne.id))}
        />
      </View>
      <Entrada value={nome} onChangeText={setNome} />
      <Entrada value={valor} onChangeText={setValor} />
      <Entrada value={desc} onChangeText={setDesc} style={styles.ultimaEntrada} />
      <Botao2
        titulo="Salvar"
        style={styles.semMargem}
        onPress={() => setMsg(salvarCarne(carne.id, nome, desc, valor))}
      />
    </Cartao>
  );
}

function AbaGostos({ mensagem, setMsg }: PropsAba) {
  const { carnes, alternarGosto } = useApp();
  const n = carnes.filter((c) => c.gosto).length;

  return (
    <>
      <Sub style={styles.instrucao}>
        Toque nas carnes que vão aparecer como opções padrão de gosto para os usuários. Não precisa
        cadastrar nada.
      </Sub>
      <Sub style={styles.contagem}>
        <Text style={styles.vermelho}>{n} opção(ões) selecionada(s)</Text>
      </Sub>
      {mensagem}
      <Mosaico
        carnes={carnes}
        selecionada={(c) => c.gosto}
        onToque={(c) => setMsg(alternarGosto(c.id))}
      />
    </>
  );
}

function AbaLibras({ mensagem, setMsg }: PropsAba) {
  const { carnes } = useApp();

  return (
    <>
      {mensagem}
      <Sub style={styles.instrucao}>Cole o link do vídeo em Libras de cada carne.</Sub>
      {carnes.map((c) => (
        <CartaoLibras key={c.id} carne={c} setMsg={setMsg} />
      ))}
    </>
  );
}

function CartaoLibras({ carne, setMsg }: { carne: Carne; setMsg: (msg: string) => void }) {
  const { salvarLibras } = useApp();
  const [link, setLink] = useState(carne.libras);

  return (
    <Cartao>
      <View style={styles.linha}>
        <Texto style={styles.negrito}>{carne.nome}</Texto>
        {carne.libras ? (
          <Gradiente tipo="tagOk" style={styles.tag}>
            <Text style={[styles.tagTexto, styles.tagOkTexto]}>Cadastrado</Text>
          </Gradiente>
        ) : (
          <View style={[styles.tag, styles.tagPendente]}>
            <Text style={styles.tagTexto}>Pendente</Text>
          </View>
        )}
      </View>
      <Entrada
        value={link}
        onChangeText={setLink}
        placeholder="Link do vídeo em Libras"
        autoCapitalize="none"
        style={styles.ultimaEntrada}
      />
      <Botao2
        titulo="Salvar vídeo"
        style={styles.semMargem}
        onPress={() => setMsg(salvarLibras(carne.id, link))}
      />
    </Cartao>
  );
}

function AbaBalcoes() {
  return (
    <>
      <Sub>Dados simulados. Serão substituídos pelos valores reais do ESP32.</Sub>
      {balcoes.map((b) => (
        <Cartao key={b.nome} style={styles.balcao}>
          <Texto>{b.nome}</Texto>
          <Texto style={[styles.vermelho, styles.negrito]}>{b.temp.toFixed(1)} °C</Texto>
        </Cartao>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  abas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  negritoTitulo: {
    fontWeight: '600',
    marginBottom: 8,
  },
  negrito: {
    fontWeight: '600',
  },
  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  semMargem: {
    margin: 0,
    marginBottom: 0,
    marginRight: 0,
  },
  legenda: {
    marginTop: 14,
    marginBottom: 6,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ultimaEntrada: {
    marginBottom: 8,
  },
  instrucao: {
    marginBottom: 8,
  },
  contagem: {
    marginBottom: 10,
  },
  vermelho: {
    color: cores.vermelho,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  tagPendente: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tagTexto: {
    fontSize: 11,
    color: cores.sub,
  },
  tagOkTexto: {
    color: '#eafff3',
  },
  balcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
