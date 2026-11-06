import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Texto } from './ui';

// Script oficial: o widget se inicializa sozinho (vlibras.gov.br/doc/widget)
const SCRIPT = 'https://vlibras.gov.br/app/vlibras-plugin.js';

function escapar(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Texto exibido na área do widget; a pessoa abre o VLibras e toca nele para traduzir
export default function VLibrasWidget({ conteudo }: { conteudo: string }) {
  const web = Platform.OS === 'web';

  useEffect(() => {
    if (!web || document.querySelector(`script[src="${SCRIPT}"]`)) return;
    const script = document.createElement('script');
    script.src = SCRIPT;
    document.body.appendChild(script);
  }, [web]);

  if (web) {
    return (
      <View accessibilityLabel={conteudo}>
        <Texto style={styles.texto}>{conteudo}</Texto>
      </View>
    );
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>p{font-family:sans-serif;font-size:18px;line-height:1.5;margin:8px}</style></head><body><p>${escapar(conteudo)}</p><script src="${SCRIPT}"></script></body></html>`;

  return (
    <WebView
      accessibilityLabel={`${conteudo}, área do VLibras`}
      originWhitelist={['*']}
      javaScriptEnabled
      source={{ html }}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  texto: {
    fontSize: 18,
    fontWeight: '600',
  },
  webview: {
    height: 480,
    borderRadius: 12,
  },
});
