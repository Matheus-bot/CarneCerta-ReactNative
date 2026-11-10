import { useIsFocused } from '@react-navigation/native';
import { ComponentRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTema } from '../contexto/AppContexto';
import { Texto } from './ui';

// Script oficial: o widget se inicializa sozinho (vlibras.gov.br/doc/widget).
// Na web ele põe na página o botão de sinal (#vlibras-access-wrapper) e, ao abrir, o intérprete
// (#vlibras-app-root, aberto quando data-active="true")
const SCRIPT = 'https://vlibras.gov.br/app/vlibras-plugin.js';
// Estado guardado pelo widget (zustand persist): {"state":{"isOpen":...}}
const CHAVE_ESTADO = '@vlibras-widget';
// Cliques com esta marca são ignorados pelo VLibras (o próprio widget usa nos cliques que repassa)
const CLIQUE_IGNORADO = '__vlibrasSyntheticClick';
// Classe no body enquanto a tela Libras está aberta (web): intérprete encaixado e botão de sinal escondido
const CLASSE_LIBRAS = 'carnecerta-libras';
// Altura da barra do intérprete e dos controles, descontada da área do avatar
const ALTURA_CONTROLES = 110;
// Intervalo para reabrir o intérprete se a pessoa fechar na tela Libras (ms)
const MANTER_ABERTO = 700;

const web = Platform.OS === 'web';

function escapar(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type JanelaVLibras = Window & { VLibrasWidget?: { open?: () => void } };

// Intérprete fechado ou aberto pelo X: abre (ou reabre) pelo próprio widget
function manterAberto() {
  const widget = (window as JanelaVLibras).VLibrasWidget;
  if (!widget?.open) return;
  const raiz = document.getElementById('vlibras-app-root');
  let estado = '';
  try {
    estado = localStorage.getItem(CHAVE_ESTADO) ?? '';
  } catch {}
  if (!raiz || raiz.dataset.active !== 'true' || estado.includes('"isOpen":false')) widget.open();
}

// Celular: o mesmo que manterAberto, dentro do HTML do WebView (texto fixo: no Hermes
// a função compilada não vira código-fonte)
const SCRIPT_MANTER_ABERTO = `(function(){function m(){var w=window.VLibrasWidget;if(!w||!w.open)return;var r=document.getElementById('vlibras-app-root');var s='';try{s=localStorage.getItem('${CHAVE_ESTADO}')||''}catch(e){}if(!r||r.dataset.active!=='true'||s.indexOf('"isOpen":false')>=0)w.open();}m();setInterval(m,${MANTER_ABERTO});})();`;

// Web: carrega o VLibras uma vez para o app todo. Começa fechado (só o botão de sinal);
// a tela Libras abre o intérprete
export function carregarVLibrasWeb() {
  if (!web || document.querySelector(`script[src="${SCRIPT}"]`)) return;
  try {
    const salvo = localStorage.getItem(CHAVE_ESTADO);
    if (salvo) localStorage.setItem(CHAVE_ESTADO, salvo.replace('"isOpen":true', '"isOpen":false'));
  } catch {}
  const estilo = document.createElement('style');
  estilo.textContent = `
    body.${CLASSE_LIBRAS} #vlibras-access-wrapper { display: none !important; }
    body.${CLASSE_LIBRAS} #vlibras-app-root {
      position: fixed;
      left: var(--cc-vlibras-x);
      top: var(--cc-vlibras-y);
      width: var(--cc-vlibras-w);
      height: var(--cc-vlibras-h);
      transform: translateZ(0);
      overflow: hidden;
      --widget-width: calc(var(--cc-vlibras-w) - 16px);
      --player-height: calc(var(--cc-vlibras-h) - ${ALTURA_CONTROLES}px);
    }`;
  document.head.appendChild(estilo);
  const script = document.createElement('script');
  script.src = SCRIPT;
  document.body.appendChild(script);
}

export type InterpreteRef = { traduzir: (indice: number) => void };

// Área do intérprete, sempre aberto enquanto a tela está visível.
// Web: a área fica vazia e o intérprete do widget (position fixed) é encaixado sobre ela;
// os cliques fora de `areaTexto` não traduzem (cabeçalho e barra inferior continuam funcionando).
// Celular: um WebView com o VLibras aberto; `traduzir(i)` traduz textos[i]
export const InterpreteVLibras = forwardRef<
  InterpreteRef,
  {
    textos: string[];
    areaTexto?: { current: ComponentRef<typeof View> | null };
    style?: StyleProp<ViewStyle>;
  }
>(function InterpreteVLibras({ textos, areaTexto, style }, ref) {
  const { cores } = useTema();
  const focada = useIsFocused();
  const areaRef = useRef<ComponentRef<typeof View>>(null);
  const webviewRef = useRef<ComponentRef<typeof WebView>>(null);

  useImperativeHandle(ref, () => ({
    traduzir: (indice: number) => {
      if (web) return; // na web o clique no texto já traduz
      webviewRef.current?.injectJavaScript(
        `(function(){var e=document.getElementById('t${indice}');if(e)e.click();})();true;`,
      );
    },
  }));

  // Web: posição e tamanho da área no body, para o CSS encaixar o intérprete
  const encaixar = () => {
    const elemento = areaRef.current as unknown as HTMLElement | null;
    if (!web || !elemento?.getBoundingClientRect) return;
    const r = elemento.getBoundingClientRect();
    const s = document.body.style;
    s.setProperty('--cc-vlibras-x', `${r.left}px`);
    s.setProperty('--cc-vlibras-y', `${r.top}px`);
    s.setProperty('--cc-vlibras-w', `${r.width}px`);
    s.setProperty('--cc-vlibras-h', `${r.height}px`);
  };

  useEffect(() => {
    if (!web || !focada) return;
    carregarVLibrasWeb();
    encaixar();
    document.body.classList.add(CLASSE_LIBRAS);
    manterAberto();
    const intervalo = setInterval(manterAberto, MANTER_ABERTO);
    // Fora da área das carnes, o clique segue normal (o VLibras aberto captura cliques em textos)
    const aoClicar = (ev: MouseEvent) => {
      const area = areaTexto?.current as unknown as HTMLElement | null;
      if (area?.contains?.(ev.target as Node)) return;
      Object.defineProperty(ev, CLIQUE_IGNORADO, { value: true });
    };
    window.addEventListener('click', aoClicar, true);
    window.addEventListener('resize', encaixar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener('click', aoClicar, true);
      window.removeEventListener('resize', encaixar);
      document.body.classList.remove(CLASSE_LIBRAS);
      // Saindo da tela Libras: fecha o intérprete e volta o botão de sinal
      document.getElementById('vlibras-app-root')?.setAttribute('data-active', 'false');
    };
  }, [focada, areaTexto]);

  if (web) {
    return <View ref={areaRef} onLayout={encaixar} style={[styles.area, style]} />;
  }

  // Celular: intérprete aberto ocupando o WebView, sem o botão de sinal; os textos ficam
  // invisíveis, só para o VLibras ler
  const paragrafos = textos.map((t, i) => `<p class="t" id="t${i}">${escapar(t)}</p>`).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden;background:${cores.campo};color:${cores.texto}}.t{position:fixed;top:0;left:0;margin:0;opacity:0;pointer-events:none;font-size:1px}#vlibras-access-wrapper{display:none!important}#vlibras-app-root{--widget-width:calc(100vw - 16px);--player-height:calc(100vh - ${ALTURA_CONTROLES}px)}</style></head><body>${paragrafos}<script>try{localStorage.setItem('${CHAVE_ESTADO}','{"state":{"isOpen":true,"opacity":1},"version":0}')}catch(e){}</script><script src="${SCRIPT}"></script><script>${SCRIPT_MANTER_ABERTO}</script></body></html>`;

  return (
    <View style={[styles.area, style]}>
      <WebView
        ref={webviewRef}
        accessibilityLabel="Área do VLibras"
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        source={{ html }}
        style={[styles.webview, { backgroundColor: cores.campo }]}
      />
    </View>
  );
});

// Texto para o VLibras traduzir ao tocar (web). invisivel: cobre o card pai com opacity 0,
// então o toque em qualquer parte do card traduz o texto
export function TextoVLibras({ conteudo, invisivel = false }: { conteudo: string; invisivel?: boolean }) {
  if (invisivel) {
    return <Texto style={[StyleSheet.absoluteFill, styles.invisivel]}>{conteudo}</Texto>;
  }
  return <Texto style={styles.texto}>{conteudo}</Texto>;
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  texto: {
    fontSize: 18,
    fontWeight: '600',
  },
  invisivel: {
    opacity: 0,
  },
});
