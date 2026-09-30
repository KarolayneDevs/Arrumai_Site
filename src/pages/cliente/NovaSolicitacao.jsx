import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Botao from '../../components/Botao';
import Icone from '../../components/Icone';
import { SERVICOS } from '../../services/servicos';
import { formatarTamanho } from '../../utils/formatar';

/* =====================================================================
   NOVA SOLICITAÇÃO (RF02 e RF03)
   1) Escolher o tipo de serviço  2) Descrever a necessidade
   3) Enviar os arquivos do projeto
   Regras de upload (RNF05): tipos e tamanho definidos e explicados na tela.
   ===================================================================== */

const TIPOS_ACEITOS = ['pdf', 'doc', 'docx', 'odt', 'txt']; // extensões permitidas
const LIMITE_MB = 10;                                       // tamanho máximo por arquivo
const NORMAS = ['ABNT NBR 14724 (trabalhos acadêmicos)', 'ABNT NBR 6022 (artigo científico)', 'Outra norma da minha instituição'];

export default function NovaSolicitacao() {
  // Lê "?servico=revisao" da URL (vindo dos botões da página inicial)
  const [params] = useSearchParams();
  const servicoInicial = SERVICOS.some((s) => s.id === params.get('servico')) ? params.get('servico') : '';

  const [servico, setServico] = useState(servicoInicial);
  const [titulo, setTitulo] = useState('');
  const [norma, setNorma] = useState(NORMAS[0]);
  const [descricao, setDescricao] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [erros, setErros] = useState({});
  const [enviada, setEnviada] = useState(false);

  /** Confere cada arquivo escolhido e separa os aceitos dos recusados. */
  function aoEscolherArquivos(evento) {
    const novos = Array.from(evento.target.files);
    const aceitos = [];
    const problemas = [];

    novos.forEach((arq) => {
      const extensao = arq.name.split('.').pop().toLowerCase();
      if (!TIPOS_ACEITOS.includes(extensao)) {
        problemas.push(`"${arq.name}" não é um tipo aceito.`);
      } else if (arq.size > LIMITE_MB * 1024 * 1024) {
        problemas.push(`"${arq.name}" passa de ${LIMITE_MB} MB.`);
      } else {
        aceitos.push(arq);
      }
    });

    setArquivos([...arquivos, ...aceitos]);
    setErros({ ...erros, arquivos: problemas.join(' ') });
    evento.target.value = ''; // permite escolher o mesmo arquivo de novo depois
  }

  const removerArquivo = (indice) => setArquivos(arquivos.filter((_, i) => i !== indice));

  function aoEnviar(evento) {
    evento.preventDefault();
    const e = {};
    if (!servico) e.servico = 'Escolha o tipo de serviço.';
    if (titulo.trim().length < 3) e.titulo = 'Dê um nome curto para o trabalho, como "TCC · Enfermagem".';
    if (descricao.trim().length < 10) e.descricao = 'Conte um pouco do que você precisa.';
    if (arquivos.length === 0) e.arquivos = 'Anexe pelo menos um arquivo do seu trabalho.';
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // TODO: enviar para a API com FormData (campos + arquivos), ex.:
    // const corpo = new FormData(); corpo.append('titulo', titulo); arquivos.forEach(a => corpo.append('arquivos', a));
    // await fetch('/api/solicitacoes', { method: 'POST', body: corpo });
    setEnviada(true);
  }

  // ----- Tela de confirmação, depois de enviar -----
  if (enviada) {
    return (
      <div className="container pagina-estreita">
        <div className="cartao confirmacao">
          <Icone nome="aprovacao" tamanho={40} />
          <h1>Recebemos sua solicitação</h1>
          <p>Status: <strong>recebida</strong>. Você recebe a proposta com prazo e valor em até 24 horas.</p>
          <Botao to="/minhas-solicitacoes">Acompanhar minhas solicitações</Botao>
        </div>
      </div>
    );
  }

  return (
    <div className="container pagina-estreita">
      <h1>Pedir orçamento</h1>
      <p className="lead">Conte o que você precisa. Em até 24 horas você recebe a proposta.</p>

      <form onSubmit={aoEnviar} noValidate>
        {/* --- 1. Tipo de serviço --- */}
        <fieldset className={`campo ${erros.servico ? 'campo--erro' : ''}`}>
          <legend>1. O que você precisa?</legend>
          <div className="opcoes">
            {SERVICOS.map((s) => (
              <label key={s.id} className={`opcao ${servico === s.id ? 'opcao--marcada' : ''}`}>
                <input type="radio" name="servico" value={s.id} checked={servico === s.id} onChange={() => setServico(s.id)} />
                <Icone nome={s.icone} />
                <strong>{s.nome}</strong>
                <small>{s.descricao}</small>
              </label>
            ))}
          </div>
          {erros.servico && <span className="erro">{erros.servico}</span>}
        </fieldset>

        {/* --- 2. Descrição --- */}
        <div className={`campo ${erros.titulo ? 'campo--erro' : ''}`}>
          <label htmlFor="titulo">2. Nome do trabalho</label>
          <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          {erros.titulo && <span className="erro">{erros.titulo}</span>}
        </div>

        <div className="campo">
          <label htmlFor="norma">Norma exigida</label>
          <select id="norma" value={norma} onChange={(e) => setNorma(e.target.value)}>
            {NORMAS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>

        <div className={`campo ${erros.descricao ? 'campo--erro' : ''}`}>
          <label htmlFor="descricao">O que precisa ser feito?</label>
          <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <small>Prazo de entrega, capítulos que preocupam, manual da instituição... tudo ajuda.</small>
          {erros.descricao && <span className="erro">{erros.descricao}</span>}
        </div>

        {/* --- 3. Arquivos --- */}
        <div className={`campo ${erros.arquivos ? 'campo--erro' : ''}`}>
          <label htmlFor="arquivos">3. Arquivos do projeto</label>
          <input id="arquivos" type="file" multiple accept={TIPOS_ACEITOS.map((t) => `.${t}`).join(',')} onChange={aoEscolherArquivos} />
          <small>Aceitamos {TIPOS_ACEITOS.join(', ').toUpperCase()}, até {LIMITE_MB} MB por arquivo.</small>
          {erros.arquivos && <span className="erro">{erros.arquivos}</span>}
        </div>

        {arquivos.length > 0 && (
          <ul className="lista-arquivos">
            {arquivos.map((arq, i) => (
              <li key={`${arq.name}-${i}`}>
                <span>{arq.name} <small>({formatarTamanho(arq.size)})</small></span>
                <button type="button" className="botao botao--texto" onClick={() => removerArquivo(i)}>Remover</button>
              </li>
            ))}
          </ul>
        )}

        <Botao type="submit" className="botao--cheio">Enviar solicitação</Botao>
      </form>
    </div>
  );
}
