# Backend - Fase 1: fluxo de solicitações e gestão do serviço

## Objetivo

Construir a API e o banco de dados para os módulos que já existem no front, incluindo autenticação, autorização e o fluxo de solicitações, pagamentos, arquivos e comentários.

## Stack recomendada

- Front-end: React + Vite
- Back-end API: Node.js + Express
- Banco: MySQL (via XAMPP local para desenvolvimento)
- Persistência: mysql2 / sequelize ou knex
- Upload de arquivos: local ou S3 em fase posterior

> Observação: o XAMPP pode ser usado como ambiente local de desenvolvimento para o MySQL + phpMyAdmin. O back-end em si fica melhor em Node/Express para conversar com o React.

## Mapa do front para o banco

### 1) Serviços
Fonte no front:
- Home > cards de serviços
- Nova solicitação > radio buttons

Entidade:
- servicos

Campos sugeridos:
- id
- nome
- slug
- icone
- descricao
- ativo
- ordem

### 2) Solicitação do cliente
Fonte no front:
- NovaSolicitacao.jsx
- MinhasSolicitacoes.jsx
- DetalheSolicitacao.jsx

Entidade:
- solicitacoes

Campos sugeridos:
- id
- usuario_id (será preenchido depois do login)
- servico_id
- titulo
- norma
- descricao
- status_atual
- valor
- entrega_prevista
- pagamento_metodo
- created_at
- updated_at

### 3) Histórico de status
Fonte no front:
- Linha do tempo de status
- status em cada etapa: recebida, em_analise, proposta_enviada, aguardando_pagamento, pagamento_confirmado, em_andamento, concluida, recusada, cancelada

Entidade:
- solicitacao_status_historico

Campos:
- id
- solicitacao_id
- status
- observacao
- created_at

### 4) Arquivos da solicitação
Fonte no front:
- input type=file na criação da solicitação
- envio de comprovante de pagamento
- download do documento final

Entidade:
- solicitacao_arquivos

Campos:
- id
- solicitacao_id
- tipo (documento, comprovante, final)
- nome_original
- nome_armazenado
- caminho
- mime_type
- tamanho
- created_at

Os uploads são separados por finalidade:

- documentos da solicitação e entregas finais: `backend/uploads/solicitacoes/`;
- comprovantes de pagamento: `backend/uploads/comprovantes/`.

Comprovantes são enviados pela rota multipart `POST /api/solicitacoes/:id/comprovantes`, usando o campo `comprovante`, e ficam vinculados ao pagamento pelo campo `comprovante_id`.

O nome original é usado no arquivo armazenado, com caracteres inválidos substituídos por `_`. Quando o nome já existe no diretório de destino, o sistema acrescenta um contador antes da extensão para preservar todos os uploads.

### 5) Proposta
Fonte no front:
- proposta enviada com valor e prazo
- aceite ou recusa da proposta

Entidade:
- propostas

Campos:
- id
- solicitacao_id
- valor
- prazo_entrega
- observacoes
- status (pendente, aceita, recusada)
- created_at
- updated_at

### 6) Pagamento
Fonte no front:
- Pix e comprovante do pagamento

Entidade:
- pagamentos

Campos:
- id
- solicitacao_id
- chave_pix
- valor
- metodo
- comprovante_id
- status (pendente, confirmado, rejeitado)
- created_at

### 7) Comentários / conversa
Fonte no front:
- conversa com a equipe dentro da solicitação

Entidade:
- solicitacao_comentarios

Campos:
- id
- solicitacao_id
- usuario_id
- autor_tipo (cliente, equipe, admin)
- mensagem
- created_at

## Fluxo principal do sistema

1. Cliente entra na tela de nova solicitação
2. Escolhe um serviço
3. Preenche título, norma e descrição
4. Envia arquivos
5. Sistema salva a solicitação com status recebida
6. Equipe analisa e cria proposta
7. Sistema registra proposta e altera status para proposta_enviada
8. Cliente aceita a proposta
9. Cliente paga por Pix e envia comprovante
10. Sistema confirma pagamento
11. Equipe executa o serviço e marca como em_andamento
12. Documento final é anexado e status vira concluida

## Estrutura sugerida do backend

```text
backend/
  src/
    app.js
    server.js
    config/
      database.js
    routes/
      servicos.routes.js
      solicitacoes.routes.js
      propostas.routes.js
      pagamentos.routes.js
      comentarios.routes.js
    controllers/
      servicosController.js
      solicitacoesController.js
      propostasController.js
      pagamentosController.js
      comentariosController.js
    services/
      servicosService.js
      solicitacoesService.js
      propostasService.js
      pagamentosService.js
      comentariosService.js
    models/
      Servico.js
      Solicitacao.js
      Proposta.js
      Pagamento.js
      Comentario.js
      Arquivo.js
    middlewares/
      auth.js
      validarCampos.js
    utils/
      erros.js
      status.js
```

## Regras de negócio que devem entrar no backend

- Validar tipo e tamanho de arquivos
- Restringir upload somente para formatos aceitos
- Não permitir proposta sem solicitação válida
- Só aceitar pagamento depois da proposta
- Só atualizar status por transições válidas
- Registrar histórico de status em cada alteração
- Permitir comentários apenas por usuários autorizados

## Ordem de implementação

1. Banco de dados e migrations
2. CRUD de serviços
3. CRUD de solicitações
4. Histórico de status
5. Arquivos
6. Propostas
7. Pagamento e comprovante
8. Comentários
9. Testes básicos da API
10. Integração com o front

## Estado atual

O fluxo principal já está integrado ao frontend. As rotas de solicitações exigem autenticação Bearer, clientes visualizam apenas os próprios pedidos e administradores podem consultar todos. O armazenamento de negócio ainda usa `memoryStore` até a integração completa com as tabelas MySQL.
