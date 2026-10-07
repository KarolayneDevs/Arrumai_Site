import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { getDatabasePool, memoryStore } from '../config/database.js';

// -----------------------------------------------------------------------------
// AUTENTICACAO
// -----------------------------------------------------------------------------
// Este service concentra cadastro, login e validacao de senha. A senha nunca
// e salva em texto puro: guardamos apenas um hash scrypt com salt aleatorio.
// Em desenvolvimento sem .env, o fallback em memoria permite testar a API;
// com XAMPP, configure o .env para persistir os usuarios no MySQL.
// -----------------------------------------------------------------------------

const scrypt = promisify(crypto.scrypt);
const sessoes = new Map();

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function gerarHash(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivada = await scrypt(senha, salt, 64);
  return `${salt}:${derivada.toString('hex')}`;
}

async function conferirSenha(senha, armazenada) {
  const [salt, hashHex] = String(armazenada).split(':');
  if (!salt || !hashHex) return false;

  const atual = await scrypt(senha, salt, 64);
  const esperado = Buffer.from(hashHex, 'hex');
  return esperado.length === atual.length && crypto.timingSafeEqual(esperado, atual);
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    tipo: usuario.tipo,
  };
}

function validarCadastro(dados) {
  const nome = String(dados.nome || '').trim();
  const email = normalizarEmail(dados.email);
  const senha = String(dados.senha || '');
  const tipo = dados.tipo === 'empresa' ? 'empresa' : 'pessoa';

  if (nome.length < 3) throw new Error('Informe um nome com pelo menos 3 caracteres.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Informe um e-mail válido.');
  if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    throw new Error('A senha precisa ter 8 caracteres, letras e números.');
  }
  if (dados.aceite !== true) throw new Error('O aceite da LGPD é obrigatório.');
  if (tipo === 'empresa' && dados.cnpj && String(dados.cnpj).replace(/\D/g, '').length !== 14) {
    throw new Error('O CNPJ deve ter 14 números.');
  }

  return { nome, email, senha, tipo };
}

export async function cadastrar(dados) {
  const novo = validarCadastro(dados);
  const pool = await getDatabasePool();

  if (pool) {
    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [novo.email]);
    if (existentes.length) throw new Error('Este e-mail já está cadastrado.');

    const senhaHash = await gerarHash(novo.senha);
    const [resultado] = await pool.query(
      `INSERT INTO usuarios (tipo, nome, email, telefone, cnpj, senha_hash, aceite_lgpd)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [novo.tipo, novo.nome, novo.email, dados.telefone || null, dados.cnpj || null, senhaHash, true],
    );
    return usuarioPublico({ ...novo, id: resultado.insertId, papel: 'cliente' });
  }

  if (memoryStore.usuarios.some((usuario) => usuario.email === novo.email)) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  const usuario = {
    ...novo,
    id: memoryStore.usuarios.length + 1,
    telefone: dados.telefone || null,
    cnpj: dados.cnpj || null,
    senhaHash: await gerarHash(novo.senha),
    papel: 'cliente',
  };
  memoryStore.usuarios.push(usuario);
  return usuarioPublico(usuario);
}

export async function entrar(emailInformado, senha) {
  const email = normalizarEmail(emailInformado);
  const pool = await getDatabasePool();
  let usuario;

  if (pool) {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
    usuario = usuarios[0];
  } else {
    usuario = memoryStore.usuarios.find((item) => item.email === email);
  }

  const senhaHash = usuario?.senha_hash || usuario?.senhaHash;
  if (!usuario || !(await conferirSenha(String(senha || ''), senhaHash))) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessoes.set(token, { id: usuario.id, papel: usuario.papel });
  return { token, usuario: usuarioPublico(usuario) };
}

export async function garantirAdministradorInicial() {
  const email = normalizarEmail(process.env.ADMIN_EMAIL || 'admin@arrumai.com');
  const senha = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const senhaHash = await gerarHash(senha);
  const pool = await getDatabasePool();

  if (pool) {
    await pool.query(
      `INSERT INTO usuarios
        (tipo, nome, email, senha_hash, papel, aceite_lgpd)
       VALUES ('pessoa', 'Administrador ARRUMAI', ?, ?, 'admin', TRUE)
       ON DUPLICATE KEY UPDATE
         nome = VALUES(nome),
         senha_hash = VALUES(senha_hash),
         papel = 'admin',
         aceite_lgpd = TRUE`,
      [email, senhaHash],
    );
    return;
  }

  const existente = memoryStore.usuarios.find((usuario) => usuario.email === email);
  if (existente) {
    existente.nome = 'Administrador ARRUMAI';
    existente.senhaHash = senhaHash;
    existente.papel = 'admin';
    existente.aceite = true;
    return;
  }

  memoryStore.usuarios.push({
    id: memoryStore.usuarios.length + 1,
    nome: 'Administrador ARRUMAI',
    email,
    senhaHash,
    papel: 'admin',
    tipo: 'pessoa',
    aceite: true,
  });
}

export function obterSessao(token) {
  return sessoes.get(token) || null;
}