import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import {
  atualizarStatus,
  atualizarStatusPagamento,
  buscarSolicitacaoAdmin,
  enviarDocumentoFinal,
  enviarProposta,
  listarArquivos,
  listarComentariosAdmin,
  listarPagamentos,
  listarPropostas,
  mensagemDeErro,
  responderComentarioAdmin,
  usandoDemonstracao,
  urlArquivo,
} from '../../services/admin';
import { formatarData, formatarDataHora } from '../../utils/datas';
import { formatarMoeda } from '../../utils/formatar';
import '../../styles/admin.css';

const ROTULOS_PAGAMENTO = {
  PENDENTE: 'Aguardando conferência',
  AGUARDANDO_COMPROVANTE: 'Aguardando comprovante',
  CONFIRMADO: 'Confirmado',
  REJEITADO: 'Recusado',
};

function dataAtualParaInput() {
  const data = new Date();
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
}

/*
 * Fluxo da equipe para um pedido: revisar anexos, enviar proposta, conferir
 * comprovante, conversar com o cliente e anexar a entrega antes de concluir.
 */
export default function AnalisarSolicitacao() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [solicitacao, setSolicitacao] = useState(null);
  const [arquivos, setArquivos] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [respostaCliente, setRespostaCliente] = useState('');
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [valor, setValor] = useState('');
  const [entregaPrevista, setEntregaPrevista] = useState('');
  const [observacao, setObservacao] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [documentoFinalSelecionado, setDocumentoFinalSelecionado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const pedido = await buscarSolicitacaoAdmin(id);
      const [listaArquivos, listaPropostas, listaPagamentos, listaComentarios] = await Promise.all([
        listarArquivos(id),
        listarPropostas(id),
        listarPagamentos(id),
        listarComentariosAdmin(id),
      ]);
      setSolicitacao(pedido);
      setArquivos(listaArquivos);
      setPropostas(listaPropostas);
      setPagamentos(listaPagamentos);
      setComentarios(listaComentarios);
      setValor(pedido.valor ? String(pedido.valor) : '');
      setEntregaPrevista(String(pedido.entregaPrevista || '').slice(0, 10));
    } catch (errorCarregamento) {
      setErro(mensagemDeErro(errorCarregamento));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [id]);

  async function executar(acao) {
    setSalvando(true);
    setErro('');
    try {
      await acao();
      await carregar();
    } catch (errorAcao) {
      setErro(mensagemDeErro(errorAcao));
    } finally {
      setSalvando(false);
    }
  }

  async function enviarOrcamento(evento) {
    evento.preventDefault();
    await executar(() => enviarProposta(id, {
      valor: Number(valor),
      entregaPrevista,
      observacao,
    }));
  }

  function selecionarDocumentoFinal(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro('O documento final deve ter no máximo 5 MB.');
      return;
    }

    setErro('');
    setDocumentoFinalSelecionado(arquivo);
  }

  async function anexarDocumentoFinal() {
    if (!documentoFinalSelecionado) return;
    const arquivo = documentoFinalSelecionado;
    await executar(async () => {
      // Vincula o arquivo de entrega à solicitação antes de permitir sua conclusão.
      await enviarDocumentoFinal(id, arquivo);
      setDocumentoFinalSelecionado(null);
    });
  }

  async function enviarRespostaCliente(evento) {
    evento.preventDefault();
    const mensagem = respostaCliente.trim();
    if (!mensagem) return;

    setEnviandoResposta(true);
    setErro('');
    try {
      await responderComentarioAdmin(id, mensagem);
      setComentarios(await listarComentariosAdmin(id));
      setRespostaCliente('');
    } catch (errorResposta) {
      setErro(mensagemDeErro(errorResposta));
    } finally {
      setEnviandoResposta(false);
    }
  }

  if (carregando) return <div className="container"><p>Carregando solicitação...</p></div>;

  if (!solicitacao) {
    return (
      <div className="container pagina-estreita">
        <h1>Não foi possível abrir esta solicitação</h1>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <Botao to="/admin">Voltar ao painel</Botao>
      </div>
    );
  }

  const propostaAtual = propostas.at(-1);
  const pagamentoPendente = pagamentos.find((item) => ['PENDENTE', 'AGUARDANDO_COMPROVANTE'].includes(item.status));
  const pagamentoAtual = pagamentos.at(-1);
  const arquivoComprovante = arquivos.find((arquivo) => String(arquivo.id) === String(pagamentoAtual?.comprovanteId));
  const arquivosDoPedido = arquivos.filter(
    (arquivo) => !['COMPROVANTE', 'DOCUMENTO_FINAL'].includes(String(arquivo.tipo).toUpperCase()),
  );
  const documentoFinal = [...arquivos].reverse().find((arquivo) => String(arquivo.tipo).toUpperCase() === 'DOCUMENTO_FINAL');
  const valorPagamento = pagamentoPendente?.valor ?? pagamentoAtual?.valor ?? propostaAtual?.valor ?? solicitacao.valor;

  return (
    <div className="container">
      <p className="trilha"><Link to="/admin">Painel da equipe</Link> / {solicitacao.protocolo}</p>
      <div className="topo-pagina">
        <div>
          <h1>{solicitacao.titulo}</h1>
          <p className="lead lead--curto">{solicitacao.protocolo} · {solicitacao.servicoNome}</p>
        </div>
        <StatusBadge status={solicitacao.status} />
      </div>

      {usandoDemonstracao() && (
        <p className="aviso" role="status">
          Demonstração sem banco: as alterações ficam apenas nesta sessão.
        </p>
      )}
      {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}

      <div className="grade grade--2">
        <section className="cartao">
          <h2>Pedido do cliente</h2>
          <dl className="detalhes">
            <div><dt>Serviço</dt><dd>{solicitacao.servicoNome}</dd></div>
            <div><dt>Norma</dt><dd>{solicitacao.norma}</dd></div>
            <div><dt>Descrição</dt><dd>{solicitacao.descricao || 'Sem descrição.'}</dd></div>
          </dl>
          <h3>Arquivos enviados</h3>
          {arquivosDoPedido.length ? (
            <ul>
              {arquivosDoPedido.map((arquivo) => (
                <li key={arquivo.id}>
                  <a href={urlArquivo(arquivo.id)} target="_blank" rel="noreferrer">
                    Abrir {arquivo.nomeOriginal}
                  </a>
                </li>
              ))}
            </ul>
          ) : <p>Nenhum arquivo disponível nesta demonstração.</p>}
        </section>

        <section className="cartao">
          <h2>Próxima ação</h2>
          {['recebida', 'em_analise'].includes(solicitacao.status) && (
            <>
              <form onSubmit={enviarOrcamento}>
                <div className="campo">
                  <label htmlFor="valor">Valor da proposta (R$)</label>
                  <input id="valor" type="number" min="1" step="0.01" required value={valor} onChange={(evento) => setValor(evento.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="entregaPrevista">Data prevista de entrega</label>
                  <input id="entregaPrevista" type="date" min={dataAtualParaInput()} required value={entregaPrevista} onChange={(evento) => setEntregaPrevista(evento.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="observacao">Observação para o cliente</label>
                  <textarea id="observacao" value={observacao} onChange={(evento) => setObservacao(evento.target.value)} />
                </div>
                <Botao type="submit" disabled={salvando}>Enviar proposta</Botao>
              </form>
              <Botao variante="texto" disabled={salvando} onClick={() => executar(() => atualizarStatus(id, 'recusada', 'Solicitação recusada pela equipe.'))}>
                Recusar solicitação
              </Botao>
            </>
          )}

          {solicitacao.status === 'proposta_enviada' && (
            <div>
              <p>A proposta foi enviada e aguarda a resposta do cliente.</p>
              {propostaAtual && (
                <p><strong>{formatarMoeda(propostaAtual.valor)}</strong> · entrega prevista para {formatarData(propostaAtual.entregaPrevista || solicitacao.entregaPrevista)}</p>
              )}
            </div>
          )}

          {solicitacao.status === 'aguardando_pagamento' && (
            <div>
              <p>Valor: <strong>{formatarMoeda(valorPagamento)}</strong></p>
              {pagamentoPendente ? (
                <>
                  <p>Pagamento: {ROTULOS_PAGAMENTO[pagamentoPendente.status] || pagamentoPendente.status}</p>
                  {arquivoComprovante && (
                    <p>
                      <a href={urlArquivo(arquivoComprovante.id)} target="_blank" rel="noreferrer">
                        Abrir comprovante: {arquivoComprovante.nomeOriginal}
                      </a>
                    </p>
                  )}
                  <div className="campo">
                    <label htmlFor="motivoRecusa">Motivo da recusa (se necessário)</label>
                    <textarea id="motivoRecusa" value={motivoRecusa} onChange={(evento) => setMotivoRecusa(evento.target.value)} />
                  </div>
                  <Botao disabled={salvando} onClick={() => executar(() => atualizarStatusPagamento(pagamentoPendente.id, 'CONFIRMADO'))}>
                    Confirmar pagamento
                  </Botao>
                  <Botao variante="texto" disabled={salvando || !motivoRecusa.trim()} onClick={() => executar(() => atualizarStatusPagamento(pagamentoPendente.id, 'REJEITADO', motivoRecusa.trim()))}>
                    Recusar comprovante
                  </Botao>
                </>
              ) : pagamentoAtual?.status === 'REJEITADO' ? (
                <p>Último comprovante recusado: {pagamentoAtual.motivoRecusa || 'sem motivo informado'}. Aguardando novo envio do cliente.</p>
              ) : <p>Aguardando o comprovante do cliente.</p>}
            </div>
          )}

          {solicitacao.status === 'pagamento_confirmado' && (
            <Botao disabled={salvando} onClick={() => executar(() => atualizarStatus(id, 'em_andamento'))}>
              Iniciar serviço
            </Botao>
          )}

          {['em_andamento', 'concluida'].includes(solicitacao.status) && (
            <div>
              <h3>Documento final</h3>
              {documentoFinal ? (
                <>
                  <p>Arquivo: <small>{documentoFinal.nomeOriginal}</small></p>
                  <div className="documento-final__acoes">
                    {/* Abre a rota de visualização em outra aba; concluir só é permitido após o upload. */}
                    <a className="botao botao--secundario" href={urlArquivo(documentoFinal.id)} target="_blank" rel="noreferrer">
                      Abrir documento
                    </a>
                    {solicitacao.status === 'em_andamento' && (
                      <Botao disabled={salvando} onClick={() => executar(() => atualizarStatus(id, 'concluida'))}>
                        Marcar como concluída
                      </Botao>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="campo">
                    <label htmlFor="documentoFinal">Anexar documento pronto para o cliente</label>
                    <input
                      id="documentoFinal"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={selecionarDocumentoFinal}
                      disabled={salvando}
                    />
                    <small>PDF ou Word, até 5 MB.</small>
                  </div>
                  {documentoFinalSelecionado && (
                    <div>
                      <p>Arquivo selecionado: <strong>{documentoFinalSelecionado.name}</strong></p>
                      <Botao disabled={salvando} onClick={anexarDocumentoFinal}>
                        {salvando ? 'Enviando...' : 'Enviar documento final'}
                      </Botao>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {['concluida', 'recusada', 'cancelada'].includes(solicitacao.status) && <p>Esta solicitação já foi encerrada.</p>}
        </section>
      </div>

      <section className="cartao comentarios">
        <h2>Conversa com o cliente</h2>
        {comentarios.length === 0 && <p>Nenhuma mensagem nesta solicitação ainda.</p>}
        <ul>
          {comentarios.map((comentario, indice) => (
            <li key={comentario.id || indice} className={`comentario comentario--${comentario.autor}`}>
              <small>
                {comentario.autor === 'equipe' ? 'Equipe Arrumaí' : 'Cliente'} · {formatarDataHora(comentario.quando)}
              </small>
              <p>{comentario.texto}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={enviarRespostaCliente} className="comentarios__form">
          <label htmlFor="respostaCliente" className="so-leitor">Responder ao cliente</label>
          <input
            id="respostaCliente"
            type="text"
            placeholder="Escreva sua resposta"
            value={respostaCliente}
            onChange={(evento) => setRespostaCliente(evento.target.value)}
            required
          />
          <Botao type="submit" disabled={enviandoResposta || !respostaCliente.trim()}>
            {enviandoResposta ? 'Enviando...' : 'Enviar'}
          </Botao>
        </form>
      </section>

      <Botao variante="secundario" onClick={() => navegar('/admin')}>Voltar ao painel</Botao>
    </div>
  );
}
