# Carrinho e fichas salvos no aparelho

## O que é salvo

- **Carrinho atual:** tabela `kv`, chave `carrinho`, em JSON. É salvo a cada mudança e lido ao abrir o app.
- **Fichas salvas:** tabela `fichas` (`id`, `criada_em`, `dados`). `dados` guarda em JSON os itens do carrinho no momento em que a ficha foi salva.

Nada mais é salvo. Não há login nem dados pessoais. O tema continua abrindo no escuro.

## Onde fica

No banco SQLite `carnecerta.db`, aberto com `openDatabaseAsync` do `expo-sqlite`. O código está em `data/banco.ts`.

- **Celular:** arquivo privado do app. Sai ao desinstalar o app.
- **Navegador:** armazenamento do próprio site (OPFS), separado por endereço e porta. Sai ao limpar os dados do site.

Na web, o `metro.config.js` inclui o arquivo `.wasm` do SQLite no bundle. Como o app usa só a API assíncrona, os cabeçalhos COOP/COEP não são necessários.

## Se o banco falhar

O app continua funcionando, só sem salvar:

- O carrinho funciona na memória e se perde ao fechar o app.
- A lista de fichas aparece vazia.
- O botão da ficha mostra "Não foi possível salvar" e permite tentar de novo.
- O motivo aparece como aviso no console.

Se o banco demorar mais de 5 segundos para abrir, o app desiste dessa tentativa e tenta de novo na próxima operação.

**Navegador com duas abas:** só a primeira aba usa o banco. A segunda funciona como banco indisponível. Para testar, deixe só uma aba do app aberta.

**Carrinho antigo:** o carrinho guardado antes desta versão (`localStorage`) não é copiado para o novo banco.

## Como testar

No navegador (`npx expo start -c`, tecla `w`) e no celular (Expo Go):

1. Adicione carnes ao carrinho e confira o número no ícone.
2. Feche o app (no navegador, feche a aba) e reabra. O carrinho precisa voltar igual.
3. Remova um item, feche e reabra. O item precisa continuar fora.
4. Toque em Finalizar e em "Salvar ficha". O botão precisa mostrar "Ficha salva".
5. Na tela inicial, abra "Fichas salvas". A ficha aparece com data, número de carnes e total.
6. Feche e reabra o app. A ficha precisa continuar na lista.
7. Toque na ficha. Ela abre com os dados e a data de quando foi salva.
8. Toque em "Excluir" e em "Confirmar exclusão". Ao excluir a última, aparece "Você ainda não salvou nenhuma ficha."
9. Repita os passos 5 e 8 nos temas claro e escuro.
