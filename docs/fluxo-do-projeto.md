## IMPORTANTE: ABRIR DOIS TERMINAIS PARA RODAR BACK-END E FRONT-END 

COMANDO PARA RODAR FRONT-END NO 1° TERMINAL:  npm run dev
COMANDO PARA RODAR BACK-END NO 2° TERMINAL: EXEMPLO COMO É NO MEU, MAS VOCÊS DEVEM 
FAZER DE ACORDO COMO É "C:" NO DE VOCÊS:

cd "C:\Users\Karol\Music\ARRUMAÍ\backend"
npm run dev

O NPM RUN DEV TEM QUE FICAR EXATAMENTE COMO ESTÁ ACIMA

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

A tela admin analisa pedidos, envia propostas, confere pagamentos, conversa com o cliente e anexa o documento final. O cliente acompanha a proposta, decide se aceita, envia comprovante e recebe a entrega.

As solicitações são protegidas por autenticação. O cliente vê somente seus próprios pedidos; o administrador vê todos os pedidos disponíveis no painel. Se a sessão expirar, o frontend remove o token local e encaminha o usuário para `/entrar`.

O cliente pode apagar uma solicitação própria antes de existir proposta aceita com pagamento confirmado. O administrador pode apagar em qualquer etapa. Também é possível selecionar várias solicitações nas telas de cliente e admin e excluí-las após confirmação.

## Anexos e visualização de documentos

- Arquivos iniciais usam o tipo `DOCUMENTO`.
- Comprovantes usam `COMPROVANTE` e aparecem junto ao pagamento, não na lista de documentos do pedido.
- A entrega final usa `DOCUMENTO_FINAL` e só deve ser marcada como concluída depois do upload.
- O conteúdo do arquivo fica em `backend/uploads/`; a API mantém metadados para associá-lo à solicitação. Os uploads locais são ignorados pelo Git.

O comprovante é enviado pela rota `POST /api/solicitacoes/:id/comprovantes`, usando o campo multipart `comprovante`. Essa rota utiliza armazenamento dedicado em `backend/uploads/comprovantes/`, evitando que o comprovante seja confundido com documentos gerais em `backend/uploads/solicitacoes/`. O nome original do upload é preservado no disco após a remoção de caracteres inválidos; em caso de duplicidade, um contador é acrescentado ao nome.

### Como o link abre o PDF

O frontend monta a URL do endpoint de visualização e abre uma nova aba. A API localiza o metadado, resolve o caminho dentro de `uploads/` e envia o arquivo com o MIME original e `Content-Disposition: inline`. O navegador exibe PDFs compatíveis; outros tipos podem ser baixados conforme o navegador.

Trecho usado para construir a URL:

```js
export function urlArquivoSolicitacao(id) {
  return apiUrl(`/arquivos/${id}/visualizar`);
}
```

Trecho usado pelo cliente para exibir a entrega final:

```jsx
<a
  className="botao botao--principal"
  href={urlArquivoSolicitacao(documentoFinal.id)}
  target="_blank"
  rel="noreferrer"
>
  Abrir/baixar documento final
</a>
```

O admin usa o mesmo endpoint para abrir anexos e comprovantes. O acesso às solicitações é protegido por autenticação e autorização; mantenha a validação de identidade e vínculo com o pedido também ao expandir as rotas de arquivos.

## Persistência atual

O schema MySQL está definido, mas os serviços de pedidos, propostas, pagamentos, comentários e metadados de arquivos ainda usam `memoryStore`. O health check do banco apenas testa a conexão; `database.ok: true` não significa que os serviços já gravam nas tabelas. Reiniciar a API apaga esses registros em memória, embora os arquivos físicos possam continuar em `uploads/` sem vínculo.

## Datas e responsividade

- Datas de listas, históricos e detalhes são formatadas com `pt-BR` (`dd/mm/aaaa` e `dd/mm/aaaa hh:mm`).
- O prazo da proposta usa o calendário nativo (`input type="date"`), com `lang="pt-BR"` para a apresentação brasileira e valor ISO (`aaaa-mm-dd`) enviado à API.
- O cabeçalho troca os links pelo botão `Menu` em larguras menores, evitando que a navegação fique comprimida.
