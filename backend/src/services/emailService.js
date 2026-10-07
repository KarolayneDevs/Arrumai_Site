import nodemailer from 'nodemailer';

const smtpConfigurado = Boolean(
  process.env.SMTP_USER
  && process.env.SMTP_PASS
);

const transporter = smtpConfigurado
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  : null;

export function emailRecuperacaoConfigurado() {
  return smtpConfigurado;
}

export async function enviarEmailRecuperacao(destinatario, link) {
  if (!transporter) {
    throw new Error('O envio de e-mail não está configurado no backend.');
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: destinatario,
    subject: 'Redefinição de senha | Arrumaí',
    text: [
      'Olá!',
      '',
      'Recebemos uma solicitação para redefinir a senha da sua conta Arrumaí.',
      `Acesse este link para criar uma nova senha: ${link}`,
      '',
      'O link expira em 1 hora e só pode ser usado uma vez.',
      'Se você não solicitou a redefinição, ignore este e-mail.',
    ].join('\n'),
    html: `
      <p>Olá!</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta Arrumaí.</p>
      <p><a href="${link}">Criar nova senha</a></p>
      <p>O link expira em 1 hora e só pode ser usado uma vez.</p>
      <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
    `,
  });
}
