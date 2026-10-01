# Fluxo do ARRUMAI

Este documento registra a sequência correta das etapas do projeto para evitar que a equipe misture a rotina do cliente com a rotina da equipe administrativa.

## 1. Solicitação do cliente

- O cliente entra no site.
- Escolhe o serviço desejado.
- Preenche o pedido e envia os arquivos.
- A solicitação nasce com o status `RECEBIDA`.

## 2. Recebimento e análise pela equipe

- A equipe/admin recebe a solicitação.
- A análise do pedido acontece antes de qualquer proposta.
- O status pode evoluir para `EM_ANALISE`.

## 3. Proposta

- A equipe cria a proposta com valor e prazo.
- A solicitação avança para `PROPOSTA_ENVIADA`.
- O cliente aceita ou recusa a proposta.

## 4. Pagamento

- Se o cliente aceitar, a solicitação entra em `AGUARDANDO_PAGAMENTO`.
- O cliente envia a confirmação do pagamento.
- O admin valida e confirma.
- Depois disso, o status vira `PAGAMENTO_CONFIRMADO`.

## 5. Execução do serviço

- A solicitação entra em `EM_ANDAMENTO`.
- A equipe realiza o trabalho solicitado.

## 6. Conclusão

- Quando o serviço termina, a solicitação chega a `CONCLUIDA`.

## 7. Encerramentos

- `RECUSADA`: a proposta foi recusada ou a solicitação foi encerrada pela equipe.
- `CANCELADA`: a solicitação foi cancelada antes de seguir o fluxo completo.

## Importante

A parte administrativa é a etapa que abre o restante do sistema. Antes disso, a versão do cliente só mostra a criação e o acompanhamento do pedido. As telas de orçamento, proposta, pagamento e confirmação devem ser validadas somente após a equipe admin receber e processar a solicitação.
