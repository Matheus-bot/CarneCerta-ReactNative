// Dados simulados dos balcões; serão substituídos pelos valores reais do ESP32
export type Balcao = {
  nome: string;
  temp: number; // °C
};

export const balcoes: Balcao[] = [
  { nome: 'Balcão 1', temp: 3.8 },
  { nome: 'Balcão 2', temp: 4.2 },
  { nome: 'Balcão 3', temp: 6.1 },
];
