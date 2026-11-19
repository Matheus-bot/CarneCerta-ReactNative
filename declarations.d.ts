// Arquivos .svg viram componentes (react-native-svg-transformer, configurado em metro.config.js)
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
