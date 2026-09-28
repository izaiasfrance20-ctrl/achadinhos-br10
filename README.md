# Achadinhos BR10

Site de vitrine com:
- Área pública para consumidores: somente fotos clicáveis.
- Área administrativa em `/admin`.
- Login de administrador.
- Adicionar foto + link.
- Editar foto/link.
- Excluir produtos.

## Rodar no computador
1. Instale Node.js 18 ou superior.
2. Abra o terminal nesta pasta.
3. Execute `npm install`.
4. Defina uma senha forte. Exemplo no Windows PowerShell:
   `$env:ADMIN_PASSWORD="SUA_SENHA_FORTE"`
   `$env:SESSION_SECRET="UMA_CHAVE_LONGA_E_ALEATORIA"`
5. Execute `npm start`.
6. Acesse `http://localhost:3000`.
7. Painel: `http://localhost:3000/admin`.

## Colocar na internet
É necessário publicar esta aplicação em uma hospedagem que rode Node.js e tenha armazenamento persistente para as fotos/arquivo `data/products.json`.
Configure as variáveis `ADMIN_USER`, `ADMIN_PASSWORD` e `SESSION_SECRET` no servidor.

IMPORTANTE: troque as credenciais padrão antes de publicar.
