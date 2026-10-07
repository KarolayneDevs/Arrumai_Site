# Alterações realizadas em 07/10/2026

Este registro resume as melhorias implementadas no frontend e no backend do ARRUMAÍ durante a sessão de 07 de outubro de 2026.

## Segurança e isolamento de solicitações

- As rotas de solicitações passaram a exigir autenticação Bearer.
- A criação de uma solicitação associa o pedido ao usuário autenticado.
- Clientes visualizam somente solicitações da própria conta.
- Administradores continuam podendo consultar todas as solicitações.
- O frontend envia automaticamente o token salvo na sessão.
- Respostas `401` limpam a sessão local e redirecionam para `/entrar`.

## Exclusão de solicitações

- Foi adicionada a exclusão pela rota `DELETE /api/solicitacoes/:id`.
- Cliente pode apagar somente solicitações próprias que ainda não tenham proposta aceita e pagamento confirmado.
- Administrador pode apagar uma solicitação em qualquer circunstância.
- A exclusão remove os dados dependentes e os arquivos associados.
- Cliente e administrador podem selecionar múltiplas solicitações para exclusão.
- A exclusão em lote pede confirmação e informa falhas parciais.
- O botão individual de apagar e o botão “Desmarcar todas” foram removidos da interface.

## Interface e responsividade

- Checkboxes permanecem à esquerda e o título da solicitação aparece ao lado.
- Botões com aparência sublinhada foram substituídos por botões arredondados coerentes com a identidade visual.
- O menu compacto é acionado em larguras de até `1000px`.
- Campos de senha usam ícones de olho para mostrar e ocultar o conteúdo.

## Datas

- Datas exibidas usam `toLocaleDateString('pt-BR')`.
- Datas com horário usam o padrão brasileiro com hora local.
- O campo “Data prevista de entrega” mantém o calendário nativo do navegador.
- O campo usa `lang="pt-BR"` e continua enviando a data no formato interno `aaaa-mm-dd`, sem perder a funcionalidade do calendário.

## Correção do armazenamento de comprovantes

- O upload de comprovantes deixou de usar a rota genérica de documentos.
- Foi criada a rota `POST /api/solicitacoes/:id/comprovantes`.
- O frontend envia o arquivo no campo multipart `comprovante`.
- Os arquivos físicos são salvos em `backend/uploads/comprovantes/`.
- O metadado recebe o tipo `COMPROVANTE` e continua vinculado ao pagamento pelo `comprovanteId`.

## Nomes dos arquivos enviados

- PDFs e demais arquivos preservam o nome original no armazenamento local.
- Caracteres inválidos para nomes de arquivos são substituídos por `_`.
- Arquivos com nomes repetidos recebem um contador, sem sobrescrever o upload anterior.
- A regra vale para documentos de solicitações e comprovantes.
- A alteração se aplica aos novos uploads; arquivos antigos já armazenados não são renomeados automaticamente.

## Limitações atuais

- Solicitações, propostas, pagamentos, comentários e metadados de arquivos ainda ficam no `memoryStore`.
- Reiniciar o backend apaga esses registros em memória.
- O cadastro e o login usam o MySQL quando configurado.
- Os arquivos físicos ficam em `backend/uploads/` e não devem conter documentos reais em ambientes sem controle de acesso adequado.

## Validação

- Build do frontend executado com sucesso.
- Diagnósticos do componente de análise administrativa sem erros.
- API e frontend foram executados localmente para validação manual.

## Recuperação de senha e e-mail

- Foi adicionado o link “Esqueci minha senha” à tela de login.
- Foram criadas as telas públicas `/esqueci-senha` e `/redefinir-senha`.
- A API passou a expor `POST /api/auth/esqueci-senha` e `POST /api/auth/redefinir-senha`.
- Os tokens expiram em uma hora, são de uso único e não armazenam a senha original.
- A senha nova é protegida com `scrypt`, seguindo o mesmo padrão do cadastro.
- Foi adicionado envio por SMTP usando Nodemailer, com suporte ao Gmail por senha de app.
- O endereço do frontend usado nos links é configurado por `FRONTEND_URL`.
- Credenciais SMTP ficam somente no `.env`, que é ignorado pelo Git.

## Execução e acesso pela rede local

- O frontend pode ser iniciado com `npm run dev -- --host 0.0.0.0`.
- Para abrir o link em um celular, o celular e o computador precisam estar na mesma rede e a porta do Vite precisa estar liberada no firewall.
- `FRONTEND_URL` deve apontar para um endereço acessível pelo dispositivo que abrirá o e-mail; `localhost` funciona somente no próprio computador.
- O endereço IP local pode mudar ao reconectar à rede Wi-Fi. Para uso fora da rede local, publique o frontend em um domínio ou use um túnel seguro.

## Limitações e próximos passos

- O envio SMTP depende de uma senha de app válida e de conectividade com o provedor.
- Tokens de recuperação ficam em memória e são perdidos quando o backend reinicia.
- Ainda é necessário configurar um domínio ou serviço de túnel/hospedagem para links acessíveis fora da rede local.
