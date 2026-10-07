# ARRUMAÍ

> Plataforma web de serviços de documentação técnica.

---

##  Tema

O **ARRUMAÍ** é uma plataforma web que conecta pessoas e empresas que têm dificuldade para **criar, organizar, revisar ou atualizar documentos técnicos** a uma equipe que realiza esse trabalho por elas.

O usuário acessa o site, explica o que precisa e envia os arquivos ou informações do projeto. A equipe analisa a solicitação e pode oferecer serviços como:

-  **Criação** de documentação de sistemas e projetos;
-  **Correção e revisão** de documentos existentes;
-  **Padronização** de documentos.

---

## Objetivos

### Objetivo geral

Desenvolver uma plataforma web onde clientes possam solicitar, de forma simples, serviços de criação, revisão e padronização de documentação técnica de sistemas e projetos.

### Objetivos específicos

-  Permitir que o cliente descreva sua necessidade e envie arquivos ou informações do projeto pelo site.
-  Organizar as solicitações para que a equipe consiga analisá-las e responder com clareza.
-  Oferecer três serviços principais: criação de documentação, correção e revisão de documentos existentes e padronização de documentos.
-  Acompanhar cada solicitação do envio até a entrega final.
-  Ajudar a reduzir retrabalho e falhas de comunicação causadas por documentação incompleta ou desatualizada.

---

## Fluxo da aplicação

A sequência correta do projeto é importante para não misturar etapas de cliente, equipe e pagamento.

### Fluxo principal

1. Cliente entra no site e cria a solicitação.
2. Solicitação fica com status `RECEBIDA`.
3. A equipe/admin analisa o pedido.
4. A equipe envia a proposta e a solicitação avança para `PROPOSTA_ENVIADA`.
5. Cliente aceita ou recusa a proposta.
6. Se aceita, entra em `AGUARDANDO_PAGAMENTO`.
7. Cliente envia o comprovante de pagamento.
8. O admin confirma e a solicitação avança para `PAGAMENTO_CONFIRMADO`.
9. O trabalho entra em `EM_ANDAMENTO`.
10. O projeto é concluído com `CONCLUIDA`.

### Status finais

- `RECUSADA`
- `CANCELADA`

Esses status encerram a solicitação sem seguir o fluxo normal.

### Importante

A equipe administra os pedidos pelo painel e cada cliente acompanha somente as próprias solicitações. As rotas de solicitações exigem autenticação por token; administradores podem consultar todos os pedidos, enquanto clientes não conseguem acessar pedidos de outras contas.

O cliente pode excluir as próprias solicitações enquanto elas não tiverem proposta aceita e pagamento confirmado. A equipe administrativa pode excluir solicitações em qualquer etapa. A exclusão remove também os dados relacionados e os arquivos associados.

O frontend possui seleção múltipla nas telas de cliente e administração, com confirmação antes da exclusão. A sessão expirada limpa os dados locais e redireciona para a tela de login.

Datas exibidas no sistema usam o padrão brasileiro. O campo de prazo da proposta mantém o calendário nativo do navegador, com `lang="pt-BR"`, e envia o valor no formato interno `aaaa-mm-dd`.

### Arquivos e documento final

Documentos de trabalho e entregas finais são salvos localmente em `backend/uploads/solicitacoes/`. Comprovantes de pagamento usam armazenamento dedicado em `backend/uploads/comprovantes/`. Em novos uploads, o nome original é preservado após a sanitização de caracteres inválidos; nomes repetidos recebem um contador para evitar sobrescrita. Essas pastas estão fora do Git por conter arquivos privados. O banco deve guardar somente os metadados e o vínculo com a solicitação. O funcionamento do link de visualização e a sequência completa estão descritos em [docs/fluxo-do-projeto.md](docs/fluxo-do-projeto.md).

##  Equipe

| Nome | GitHub |
|------|--------|
| ALICE QUELY TEIXEIRA SOMBRA - back | [@quely78](https://github.com/quely78) |
| KAROLAYNE DINIZ - banco de dados | [@KarolayneDevs](https://github.com/KarolayneDevs) |
| MARIA LUANA PINHEIRO MARAES - front | 
| MARIA HELENA MOTA CAMPOS - front | [@mariahelenamotta](https://github.com/mariahelenamotta) |
