# Configuração de e-mail para recuperação de senha

## Gmail em desenvolvimento

O backend envia os links de recuperação usando SMTP. Para Gmail, a conta
remetente precisa ter a verificação em duas etapas ativada e uma senha de app.
A senha de app é diferente da senha normal da conta Google.

1. Acesse [Segurança da Conta Google](https://myaccount.google.com/security).
2. Ative a verificação em duas etapas.
3. Acesse [Senhas de app](https://myaccount.google.com/apppasswords).
4. Crie uma senha de app com o nome `Arrumai`.
5. Copie `.env.example` para `.env` dentro de `backend/`.
6. Preencha as variáveis abaixo sem versionar o arquivo `.env`:

```env
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=Arrumai <seu-email@gmail.com>
```

Reinicie o backend depois de alterar o `.env`:

```powershell
cd backend
npm run dev
```

## Links abertos em celular

`FRONTEND_URL` é usado para montar o link enviado no e-mail. `localhost` só
funciona no computador que está executando o Vite. Para um celular na mesma
rede Wi-Fi, use o IPv4 do computador, por exemplo:

```env
FRONTEND_URL=http://192.168.1.17:5173
```

Inicie o Vite aceitando conexões externas:

```powershell
npm run dev -- --host 0.0.0.0
```

O celular precisa estar na mesma rede do computador e a porta `5173` precisa
estar liberada no firewall. O IP pode mudar; gere um novo link depois de
alterar `FRONTEND_URL`.

## Produção

Para links que funcionem fora da rede local, use um domínio público com HTTPS
ou um túnel seguro. Não envie links com `localhost` ou IP privado para
usuários externos. Nunca versione `.env`, senhas de app, tokens ou senhas
normais de e-mail.
