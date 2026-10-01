# ARRUMAI - Backend

Este diretório concentra a API do projeto ARRUMAI para a primeira fase funcional.

## Objetivo da primeira etapa

- manter a API limpa e organizada;
- cobrir os módulos que já existem no front;
- deixar autenticação e cadastro para a segunda etapa;
- facilitar que a equipe entenda cada parte do código.

## Como rodar

1. Abra a pasta `backend`.
2. Copie `.env.example` para `.env`.
3. Instale as dependências:
   npm install
4. Inicie a API:
   npm run dev

## Endpoints principais

- GET /api/health
- GET /api/servicos
- POST /api/servicos
- GET /api/solicitacoes
- GET /api/solicitacoes/:id
- POST /api/solicitacoes
- PATCH /api/solicitacoes/:id/status
- POST /api/solicitacoes/:id/comentarios
- GET /api/solicitacoes/:id/comentarios
- GET /api/solicitacoes/:id/historico
- GET /api/solicitacoes/:id/propostas
- POST /api/solicitacoes/:id/propostas
- PATCH /api/propostas/:id/status
- GET /api/solicitacoes/:id/pagamentos
- POST /api/solicitacoes/:id/pagamentos
- PATCH /api/pagamentos/:id/status
- GET /api/solicitacoes/:id/arquivos
- POST /api/solicitacoes/:id/arquivos

## Observação importante

Neste momento, o backend usa armazenamento em memória por padrão para permitir teste local sem depender do MySQL. Quando o ambiente do banco estiver pronto, basta preencher as variáveis do `.env` e trocar a camada de dados conforme necessário.
