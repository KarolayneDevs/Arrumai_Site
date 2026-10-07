# ARRUMAI - Backend

Este diretório concentra a API do projeto ARRUMAI para a primeira fase funcional.

## Objetivo da primeira etapa

- manter a API limpa e organizada;
- cobrir os módulos que já existem no front;
- oferecer cadastro e login de clientes;
- facilitar que a equipe entenda cada parte do código.

## Como a API está organizada

- `src/app.js`: inicializa o Express e monta as rotas públicas.
- `src/routes/`: lista as rotas por módulo: serviços, solicitações, propostas, pagamentos e arquivos.
- `src/controllers/`: recebe requisições HTTP e delega a lógica.
- `src/services/`: guarda a regra de negócio principal.
- `src/config/`: centraliza banco, upload local e variáveis de ambiente.
- `src/middleware/auth.js`: valida o token Bearer e disponibiliza o usuário autenticado em `req.usuario`.
- `src/services/authService.js`: valida cadastro, cria hash da senha e inicia sessões.
- `src/controllers/authController.js`: responde às requisições HTTP de autenticação.
- `src/routes/auth.routes.js`: expõe cadastro e login.
- `src/utils/status.js`: define a ordem correta dos status da solicitação.
- `sql/schema.sql`: estrutura do banco para a primeira etapa.
- `uploads/`: pasta local para arquivos de solicitação e comprovantes.

## Fluxo principal do sistema

A sequência principal da solicitação segue esta ordem:

1. RECEBIDA
2. EM_ANALISE
3. PROPOSTA_ENVIADA
4. AGUARDANDO_PAGAMENTO
5. PAGAMENTO_CONFIRMADO
6. EM_ANDAMENTO
7. CONCLUIDA

Status finais também existem:

- RECUSADA
- CANCELADA

Isso impede que o time avance etapas sem obedecer à regra do negócio.

### Ordem real do processo

- Cliente cria a solicitação.
- Equipe/admin recebe e analisa.
- Admin envia proposta.
- Cliente aceita ou recusa.
- Cliente paga.
- Admin confirma o pagamento.
- O serviço entra em andamento.
- A solicitação é concluída.

Essa ordem deve ser seguida para que o fluxo do sistema fique consistente e os status não sejam quebrados.

## Como rodar

1. Inicie o Apache e o MySQL no XAMPP.
2. Abra o phpMyAdmin em `http://localhost/phpmyadmin`.
3. Execute todo o arquivo `sql/schema.sql` para criar o banco `arrumai` e a tabela `usuarios`.
4. Abra a pasta `backend` e copie `.env.example` para `.env`.
5. Confira no `.env` o usuário, senha e porta do MySQL do XAMPP.
6. Instale as dependências:
   npm install
7. Inicie a API:
   npm run dev
8. Verifique a saúde da API em:
   GET /api/health

## Endpoints principais

- GET /api/health
- POST /api/auth/cadastro
- POST /api/auth/login
- GET /api/servicos
- POST /api/servicos
- GET /api/solicitacoes
- GET /api/solicitacoes/:id
- POST /api/solicitacoes
- DELETE /api/solicitacoes/:id
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
- POST /api/solicitacoes/:id/comprovantes
- GET /api/arquivos/:id/visualizar

As rotas de solicitações exigem o cabeçalho `Authorization: Bearer <token>`. Clientes visualizam e alteram somente as próprias solicitações; administradores podem consultar e excluir solicitações de qualquer cliente.

## Regras de exclusão

- O cliente pode excluir somente solicitações da própria conta.
- O cliente não pode excluir uma solicitação que tenha proposta `ACEITA` e pagamento `CONFIRMADO`.
- O administrador pode excluir solicitações em qualquer circunstância.
- A exclusão remove comentários, histórico, propostas, pagamentos, metadados e arquivos relacionados.

O comprovante de pagamento usa uma rota multipart específica, `POST /api/solicitacoes/:id/comprovantes`, com o campo `comprovante`. O arquivo físico é salvo em `uploads/comprovantes/` com o nome original sanitizado; se já existir um arquivo com o mesmo nome, um contador é acrescentado. Seu metadado é registrado como `COMPROVANTE` e o `comprovanteId` do pagamento aponta para esse registro.

## Observação importante

Neste momento, os serviços de negócio usam `memoryStore`, inclusive quando as variáveis do MySQL estão configuradas. `GET /api/health` testa a conexão, mas não comprova persistência dos pedidos. Reiniciar a API apaga pedidos, propostas, pagamentos, comentários e metadados mantidos em memória. A integração dos serviços com as tabelas ainda precisa ser feita.

O cadastro e o login já usam a tabela `usuarios` quando o `.env` está configurado. As senhas são protegidas com `scrypt` do próprio Node.js e nunca são retornadas pela API. O token de sessão desta primeira fase fica em memória no backend e é perdido quando a API reinicia; antes de colocar o sistema em produção, ele deve ser substituído por uma estratégia persistente, como JWT com expiração ou sessões armazenadas no banco.

Arquivos reais ficam em `uploads/`; o serviço atualmente mantém seus metadados em memória, não no MySQL. A pasta é ignorada pelo Git para evitar publicar documentos privados. Consulte `../docs/fluxo-do-projeto.md` para o fluxo de anexos e o trecho que monta o link de visualização.

O servidor de desenvolvimento usa `node --watch`; alterações em arquivos de `backend/src/` reiniciam a API e limpam o `memoryStore`. Não edite/reinicie o backend durante testes que precisem manter dados até a persistência no banco estar pronta.
