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

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    const nomeOriginal = String(file.originalname || '').toLowerCase();
    const destino = nomeOriginal.includes('comprovante') || file.fieldname === 'comprovante'
      ? 'comprovantes'
      : 'solicitacoes';

    callback(null, path.join(uploadRoot, destino));
  },
  filename: (_req, file, callback) => {
    const extensao = path.extname(file.originalname || '');
    const nomeBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${nomeBase}${extensao}`);
  },
});

export const upload = multer({
  storage,
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
});
