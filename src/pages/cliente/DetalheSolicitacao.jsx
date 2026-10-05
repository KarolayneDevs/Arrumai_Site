import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import LinhaDoTempo from '../../components/LinhaDoTempo';
import {
  adicionarComentarioSolicitacao,
  criarPagamentoSolicitacao,
  fetchArquivosSolicitacao,
  fetchComentariosSolicitacao,
  fetchHistoricoSolicitacao,
  fetchPagamentosSolicitacao,
  fetchPropostasSolicitacao,
  fetchSolicitacao,
  getSolicitacao,
  responderProposta,
  SOLICITACOES,
  uploadArquivoSolicitacao,
  urlArquivoSolicitacao,
} from '../../services/solicitacoes';
import { getServico } from '../../services/servicos';
import { estaEncerrada } from '../../utils/status';
import { formatarData, formatarDataHora } from '../../utils/datas';
import { formatarMoeda } from '../../utils/formatar';

/* =====================================================================
   DETALHE DA SOLICITAÇÃO (mockup 07, "Área do cliente")
  Centraliza o acompanhamento do cliente: carrega status, proposta, pagamento,
  histórico, arquivos e conversa da API; envia aceite/recusa, comprovante e
  mensagens. Na conclusão, mostra o documento final anexado pela equipe.
   ===================================================================== */

// TODO: mover para configuração. É a chave Pix que a cliente vai usar.
const CHAVE_PIX = 'pagamentos@arrumai.com.br';

export default function DetalheSolicitacao() {
  const { id } = useParams();
  const [original, setOriginal] = useState(getSolicitacao(id) || null);

  useEffect(() => {
    fetchSolicitacao(id)
      .then((solicitacao) => setOriginal(solicitacao))
      .catch(() => setOriginal(SOLICITACOES.find((s) => s.id === String(id)) || null));
  }, [id]);

  const [status, setStatus] = useState(original?.status);
  const [propostas, setPropostas] = useState([]);
  const [carregandoProposta, setCarregandoProposta] = useState(false);
  const [salvandoResposta, setSalvandoResposta] = useState(false);
  const [erroProposta, setErroProposta] = useState('');
  const [pagamentos, setPagamentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [enviandoComprovante, setEnviandoComprovante] = useState(false);
  const [erroPagamento, setErroPagamento] = useState('');
  const [comprovante, setComprovante] = useState(null);
  const [arquivoComprovanteSelecionado, setArquivoComprovanteSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState(original?.comentarios ?? []);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [erroComentario, setErroComentario] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setStatus(original?.status);
  }, [original]);

  useEffect(() => {
    let ativo = true;
    setCarregandoProposta(true);
    setErroProposta('');

    fetchPropostasSolicitacao(id)
      .then((lista) => {
        if (ativo) setPropostas(lista);
      })
      .catch((error) => {
        if (ativo) setErroProposta(error.message || 'Não foi possível carregar a proposta.');
      })
      .finally(() => {
        if (ativo) setCarregandoProposta(false);
      });

    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    let ativo = true;
    fetchComentariosSolicitacao(id)
      .then((lista) => {
        if (ativo) setComentarios(lista);
      })
      .catch((error) => {
        if (ativo) setErroComentario(error.message || 'Não foi possível carregar as mensagens.');
      });

    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    let ativo = true;
    fetchArquivosSolicitacao(id)
      .then((lista) => {
        if (ativo) setArquivos(lista);
      })
      .catch(() => {
        if (ativo) setArquivos([]);
      });

    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    let ativo = true;
    fetchHistoricoSolicitacao(id)
      .then((lista) => {
        if (ativo) setHistorico(lista);
      })
      .catch(() => {
        if (ativo) setHistorico([]);
      });

    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    let ativo = true;
    fetchPagamentosSolicitacao(id)
      .then((lista) => {
        if (ativo) setPagamentos(lista);
      })
      .catch((error) => {
        if (ativo) setErroPagamento(error.message || 'Não foi possível carregar o pagamento.');
      });

    return () => { ativo = false; };
  }, [id]);

  // Número inexistente na URL: avisa e oferece o caminho de volta
  if (!original) {
    return (
      <div className="container pagina-estreita">
        <h1>Solicitação não encontrada</h1>
        <p className="lead">Confira o número ou volte para a lista.</p>
        <Botao to="/minhas-solicitacoes">Ver minhas solicitações</Botao>
      </div>
    );
  }

  const encerrada = estaEncerrada(status);
  const propostaAtual = [...propostas].reverse().find((proposta) => proposta.status === 'ENVIADA')
    || propostas.at(-1);
  const valorProposta = propostaAtual?.valor ?? original.valor;
  const pagamentoAtual = pagamentos.at(-1);
  const documentoFinal = [...arquivos].reverse().find(
    (arquivo) => String(arquivo.tipo).toUpperCase() === 'DOCUMENTO_FINAL',
  );
  const inicioExecucao = [...historico].reverse().find(
    (item) => String(item.statusNovo).toUpperCase() === 'EM_ANDAMENTO',
  )?.dataHora;
  let entregaCalculada = null;

  if (inicioExecucao && propostaAtual?.prazoDias) {
    const dataInicio = new Date(inicioExecucao);
    if (!Number.isNaN(dataInicio.getTime())) {
      dataInicio.setDate(dataInicio.getDate() + Number(propostaAtual.prazoDias));
      entregaCalculada = formatarData(dataInicio.toISOString());
    }
  }

  const entregaPrevista = original.entregaPrevista
    ? formatarData(original.entregaPrevista)
    : propostaAtual?.entregaPrevista
      ? formatarData(propostaAtual.entregaPrevista)
      : entregaCalculada || (propostaAtual?.prazoDias ? `${propostaAtual.prazoDias} dias após o início` : 'Prazo não informado');

  async function responderAProposta(novoStatus) {
    if (!propostaAtual) return;

    setSalvandoResposta(true);
    setErroProposta('');
    try {
      await responderProposta(propostaAtual.id, novoStatus);
      const [solicitacaoAtualizada, propostasAtualizadas] = await Promise.all([
        fetchSolicitacao(id),
        fetchPropostasSolicitacao(id),
      ]);
      setOriginal(solicitacaoAtualizada);
      setPropostas(propostasAtualizadas);
    } catch (error) {
      setErroProposta(error.message || 'Não foi possível registrar sua resposta.');
    } finally {
      setSalvandoResposta(false);
    }
  }

  function selecionarComprovante(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;

    if (arquivo.size > 5 * 1024 * 1024) {
      setArquivoComprovanteSelecionado(null);
      setErroPagamento('O comprovante deve ter no máximo 5 MB.');
      return;
    }

    setErroPagamento('');
    setArquivoComprovanteSelecionado(arquivo);
  }

  async function confirmarEnvioComprovante() {
    if (!arquivoComprovanteSelecionado) return;

    setEnviandoComprovante(true);
    setErroPagamento('');
    try {
      // O arquivo é salvo no disco e seu ID vincula o comprovante ao pagamento.
      const respostaArquivo = await uploadArquivoSolicitacao(id, arquivoComprovanteSelecionado, 'COMPROVANTE');
      const arquivoSalvo = respostaArquivo.data || respostaArquivo;
      const pagamento = await criarPagamentoSolicitacao(id, {
        valor: valorProposta,
        chavePix: CHAVE_PIX,
        metodo: 'PIX',
        comprovanteId: arquivoSalvo.id,
      });
      setComprovante(arquivoComprovanteSelecionado.name);
      setArquivoComprovanteSelecionado(null);
      setPagamentos((atuais) => [...atuais, pagamento]);
    } catch (error) {
      setErroPagamento(error.message || 'Não foi possível enviar o comprovante.');
    } finally {
      setEnviandoComprovante(false);
    }
  }

  function campoEnvioComprovante(rotulo = 'Enviar comprovante') {
    return (
      <>
        <div className="campo">
          <label htmlFor="comprovante">{rotulo}</label>
          <input
            id="comprovante"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={selecionarComprovante}
            disabled={enviandoComprovante}
          />
          <small>PDF, PNG ou JPG, até 5 MB.</small>
        </div>
        {arquivoComprovanteSelecionado && (
          <div>
            <p>Arquivo selecionado: <strong>{arquivoComprovanteSelecionado.name}</strong></p>
            <Botao disabled={enviandoComprovante} onClick={confirmarEnvioComprovante}>
              {enviandoComprovante ? 'Enviando...' : 'Confirmar envio'}
            </Botao>
          </div>
        )}
        {enviandoComprovante && <p role="status">Enviando comprovante...</p>}
      </>
    );
  }

  /** Copia a chave Pix para a área de transferência. */
  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500); // some o aviso depois de 2,5 s
    } catch {
      setCopiado(false); // navegador bloqueou: a chave continua visível para copiar à mão
    }
  }

  /** Adiciona o comentário na conversa (RF08). */
  async function enviarComentario(evento) {
    evento.preventDefault();
    const mensagem = novoComentario.trim();
    if (!mensagem) return;

    setEnviandoComentario(true);
    setErroComentario('');
    try {
      await adicionarComentarioSolicitacao(id, mensagem, 'CLIENTE');
      setComentarios(await fetchComentariosSolicitacao(id));
      setNovoComentario('');
    } catch (error) {
      setErroComentario(error.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviandoComentario(false);
    }
  }

  // Cada bloco abaixo é o que aparece no cartão de "Proposta" para cada status
  function painelDaProposta() {
    switch (status) {
      case 'recebida':
      case 'em_analise':
        return <p>Estamos analisando seu arquivo. A proposta com prazo e valor chega em até 24 horas.</p>;

      case 'proposta_enviada':
        return (
          <>
            {carregandoProposta ? <p>Carregando proposta...</p> : propostaAtual ? (
              <>
                <p>Confira as condições enviadas pela equipe antes de responder.</p>
                <p className="proposta__valor">{formatarMoeda(propostaAtual.valor)}</p>
                <p><strong>Entrega prevista:</strong> {formatarData(propostaAtual.entregaPrevista) !== '—'
                  ? formatarData(propostaAtual.entregaPrevista)
                  : `${propostaAtual.prazoDias} dias`}</p>
                {propostaAtual.observacao && <p><strong>Observação:</strong> {propostaAtual.observacao}</p>}
                <div className="proposta__acoes">
                  <Botao disabled={salvandoResposta} onClick={() => responderAProposta('ACEITA')}>
                    {salvandoResposta ? 'Salvando...' : 'Aceitar proposta'}
                  </Botao>
                  <Botao variante="texto" disabled={salvandoResposta} onClick={() => responderAProposta('RECUSADA')}>
                    Recusar
                  </Botao>
                </div>
              </>
            ) : <p>A proposta ainda não está disponível. Atualize a página ou fale com a equipe.</p>}
          </>
        );

      case 'aguardando_pagamento':
        return (
          <>
            <p>Pague por Pix o valor de <strong>{formatarMoeda(valorProposta)}</strong> e envie o comprovante.</p>
            {erroPagamento && <p className="erro" role="alert">{erroPagamento}</p>}
            {/* No lugar do QR Code real, um espaço reservado (RF06) */}
            <div className="pix">
              <div className="pix__qr" role="img" aria-label="Espaço do QR Code do Pix">QR Code</div>
              <div>
                <small>Chave Pix</small>
                <p className="pix__chave">{CHAVE_PIX}</p>
                <Botao variante="secundario" onClick={copiarPix}>{copiado ? 'Chave copiada' : 'Copiar chave'}</Botao>
              </div>
            </div>

            {/* RF07: comprovante. Aceita PDF ou imagem. */}
            {pagamentoAtual?.status === 'PENDENTE' ? (
              <p className="aviso aviso--ok">
                Comprovante enviado{comprovante ? ` (${comprovante})` : ''}. Aguardando conferência da equipe.
              </p>
            ) : pagamentoAtual?.status === 'REJEITADO' ? (
              <>
                <p className="aviso aviso--erro">
                  Comprovante recusado{pagamentoAtual.motivoRecusa ? `: ${pagamentoAtual.motivoRecusa}` : '.'} Envie outro arquivo após corrigir.
                </p>
                {campoEnvioComprovante('Enviar novo comprovante')}
              </>
            ) : campoEnvioComprovante()}
          </>
        );

      case 'pagamento_confirmado':
        return <p>Pagamento confirmado. A equipe vai iniciar o serviço em breve.</p>;

      case 'em_andamento':
        return <p>O serviço está em andamento. Entrega prevista: <strong>{entregaPrevista}</strong>.</p>;

      case 'concluida':
        return (
          <>
            <p>Concluída! Seu trabalho está pronto para a banca.</p>
            {documentoFinal ? (
              <>
                <p>Clique no botão para abrir ou baixar o arquivo final:</p>
                {/* A API envia o arquivo em nova aba com o MIME original para o navegador exibi-lo quando possível. */}
                <a
                  className="botao botao--principal"
                  href={urlArquivoSolicitacao(documentoFinal.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir/baixar documento final
                </a>
                <p><small>Arquivo: {documentoFinal.nomeOriginal}</small></p>
              </>
            ) : <p>O documento final ainda não foi anexado pela equipe.</p>}
          </>
        );

      default: // recusada ou cancelada
        return <p>Esta solicitação foi encerrada. Se mudar de ideia, é só fazer um novo pedido.</p>;
    }
  }

  return (
    <div className="container">
      {/* Trilha de navegação: mostra onde a pessoa está */}
      <p className="trilha"><Link to="/minhas-solicitacoes">Minhas solicitações</Link> / #{original.id}</p>

      <div className="topo-pagina">
        <h1>{original.titulo}</h1>
        <StatusBadge status={status} />
      </div>

      {/* Linha do tempo. Se foi encerrada, mostramos um aviso no lugar. */}
      <section className="cartao" aria-label="Andamento">
        {encerrada ? (
          <p className="aviso">Solicitação {status === 'recusada' ? 'recusada' : 'cancelada'}.</p>
        ) : (
          <LinhaDoTempo status={status} datas={original.datas} />
        )}
      </section>

      <div className="grade grade--2 detalhe__grade">
        {/* Coluna da esquerda: dados fixos do serviço */}
        <section className="cartao">
          <h2>Detalhes do serviço</h2>
          <dl className="detalhes">
            <div><dt>Serviço</dt><dd>{getServico(original.servico)?.nome}</dd></div>
            <div><dt>Norma</dt><dd>{original.norma}</dd></div>
            <div><dt>Entrega prevista</dt><dd>{entregaPrevista}</dd></div>
            <div><dt>Valor</dt><dd>{formatarMoeda(valorProposta)}</dd></div>
            <div><dt>Pagamento</dt><dd>{original.pagamento}</dd></div>
          </dl>
        </section>

        {/* Coluna da direita: muda conforme o status */}
        <section className="cartao">
          <h2>{status === 'aguardando_pagamento' ? 'Pagamento' : 'Proposta'}</h2>
          {erroProposta && <p className="erro" role="alert">{erroProposta}</p>}
          {painelDaProposta()}
          {/* Cancelar só faz sentido antes de o trabalho começar */}
          {['recebida', 'em_analise'].includes(status) && (
            <Botao variante="texto" onClick={() => setStatus('cancelada')}>Cancelar solicitação</Botao>
          )}
        </section>
      </div>

      {/* RF08: conversa com a equipe (no lugar de um chat em tempo real) */}
      <section className="cartao comentarios">
        <h2>Conversa com a equipe</h2>
        {erroComentario && <p className="erro" role="alert">{erroComentario}</p>}
        {comentarios.length === 0 && <p>Nenhuma mensagem ainda. Se tiver dúvidas, escreva aqui.</p>}
        <ul>
          {comentarios.map((c, i) => (
            <li key={i} className={`comentario comentario--${c.autor}`}>
              <small>{c.autor === 'equipe' ? 'Equipe Arrumaí' : 'Você'} · {formatarDataHora(c.quando)}</small>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={enviarComentario} className="comentarios__form">
          <label htmlFor="comentario" className="so-leitor">Sua mensagem</label>
          <input id="comentario" type="text" placeholder="Escreva sua dúvida" value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} />
          <Botao type="submit" disabled={enviandoComentario || !novoComentario.trim()}>
            {enviandoComentario ? 'Enviando...' : 'Enviar'}
          </Botao>
        </form>
      </section>
    </div>
  );
}
