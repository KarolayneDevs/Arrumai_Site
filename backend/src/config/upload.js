import fs from 'fs';
import path from 'path';
import multer from 'multer';

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DE UPLOAD
// -----------------------------------------------------------------------------
// O projeto salva arquivos locais para não sobrecarregar o banco de dados com
// binários grandes. O MySQL fica responsável pelos metadados e pelo caminho do
// arquivo, enquanto o arquivo real é guardado em disco.
// -----------------------------------------------------------------------------

const uploadRoot = path.resolve(process.cwd(), 'uploads');
const folders = ['solicitacoes', 'comprovantes'];

folders.forEach((folder) => {
  const dir = path.join(uploadRoot, folder);
  fs.mkdirSync(dir, { recursive: true });
});

function criarStorage(destinoFixo = null) {
  return multer.diskStorage({
    destination: (_req, file, callback) => {
      callback(null, obterDiretorioDestino(file, destinoFixo));
    },
    filename: (_req, file, callback) => {
      const diretorio = obterDiretorioDestino(file, destinoFixo);
      const nomeOriginal = limparNomeArquivo(file.originalname);
      const extensao = path.extname(nomeOriginal);
      const base = path.basename(nomeOriginal, extensao) || 'arquivo';
      let nome = nomeOriginal || `arquivo${extensao}`;
      let contador = 1;

      while (fs.existsSync(path.join(diretorio, nome))) {
        nome = `${base} (${contador})${extensao}`;
        contador += 1;
      }

      callback(null, nome);
    },
  });
}

function obterDiretorioDestino(file, destinoFixo) {
  const nomeOriginal = String(file.originalname || '').toLowerCase();
  const destino = destinoFixo || (nomeOriginal.includes('comprovante') || file.fieldname === 'comprovante'
    ? 'comprovantes'
    : 'solicitacoes');

  return path.join(uploadRoot, destino);
}

function limparNomeArquivo(nomeOriginal) {
  return path.basename(String(nomeOriginal || ''))
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .trim();
}

const opcoesUpload = {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const tiposAceitos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/zip',
    ];

    if (tiposAceitos.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error('Tipo de arquivo não permitido.')); 
  },
};

export const upload = multer({
  ...opcoesUpload,
  storage: criarStorage(),
});

export const uploadComprovante = multer({
  ...opcoesUpload,
  storage: criarStorage('comprovantes'),
});
