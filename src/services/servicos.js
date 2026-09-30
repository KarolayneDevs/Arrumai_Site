/* =====================================================================
   SERVIÇOS OFERECIDOS (RF02: criação, revisão ou padronização)
   Por enquanto a lista é fixa. Quando o back-end existir, o administrador
   poderá gerenciá-la (RF16) e esta lista virá da API.
   ===================================================================== */
export const SERVICOS = [
  {
    id: 'criacao',
    nome: 'Criação',
    icone: 'documento',
    descricao: 'Você tem o conteúdo e precisa do documento montado do zero, com capa, sumário e referências.',
  },
  {
    id: 'revisao',
    nome: 'Revisão',
    icone: 'aprovacao',
    descricao: 'Seu texto já existe. Conferimos erros de norma, citações e referências antes de você entregar.',
  },
  {
    id: 'padronizacao',
    nome: 'Padronização',
    icone: 'versoes',
    descricao: 'Ajustamos margens, fontes, títulos e citações para a ABNT ou para a norma da sua instituição.',
  },
];

/** Busca um serviço pelo id. Ex.: getServico('revisao').nome -> "Revisão" */
export function getServico(id) {
  return SERVICOS.find((s) => s.id === id);
}
