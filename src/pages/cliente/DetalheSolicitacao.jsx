import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import LinhaDoTempo from '../../components/LinhaDoTempo';
import { getSolicitacao } from '../../services/solicitacoes';
import { getServico } from '../../services/servicos';
import { estaEncerrada } from '../../utils/status';
import { formatarMoeda } from '../../utils/formatar';

/* =====================================================================
   DETALHE DA SOLICITAÇÃO (mockup 07, "Área do cliente")
   Reúne tudo que a cliente faz depois de pedir:
   - acompanhar o status (RF04)          - aceitar/recusar proposta (RF05)
   - ver instruções de Pix (RF06)        - enviar comprovante (RF07)
   - comentar com a equipe (RF08)        - baixar o documento final (RF09)

   Os botões mudam o status só na tela (estado local) para demonstrar o
   fluxo. Com a API, cada ação deve ser salva no servidor (veja os TODO).
   ===================================================================== */

// TODO: mover para configuração. É a chave Pix que a cliente vai usar.
const CHAVE_PIX = 'pagamentos@arrumai.com.br';

export default function DetalheSolicitacao() {
  const { id } = useParams(); // pega o "0231" de /solicitacao/0231
  const original = getSolicitacao(id);

  // Estados que mudam conforme a cliente age nesta tela
  const [status, setStatus] = useState(original?.status);
  const [comprovante, setComprovante] = useState(null);   // nome do arquivo enviado
  const [comentarios, setComentarios] = useState(original?.comentarios ?? []);
  const [novoComentario, setNovoComentario] = useState('');
  const [copiado, setCopiado] = useState(false);

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
  function enviarComentario(evento) {
    evento.preventDefault();
    if (!novoComentario.trim()) return;
    // TODO: POST /solicitacoes/:id/comentarios
    setComentarios([...comentarios, { autor: 'cliente', texto: novoComentario.trim(), quando: 'agora' }]);
    setNovoComentario('');
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
            <p>Confira valor e prazo e aceite para iniciar a formatação.</p>
            <p className="proposta__valor">{formatarMoeda(original.valor)}</p>
            <div className="proposta__acoes">
              {/* TODO: PATCH /solicitacoes/:id { status } em cada botão */}
              <Botao onClick={() => setStatus('aguardando_pagamento')}>Aceitar proposta</Botao>
              <Botao variante="texto" onClick={() => setStatus('recusada')}>Recusar</Botao>
            </div>
          </>
        );

      case 'aguardando_pagamento':
        return (
          <>
            <p>Pague por Pix o valor de <strong>{formatarMoeda(original.valor)}</strong> e envie o comprovante.</p>
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
            {comprovante ? (
              <p className="aviso aviso--ok">Comprovante enviado ({comprovante}). A equipe vai conferir e confirmar o pagamento.</p>
            ) : (
              <div className="campo">
                <label htmlFor="comprovante">Enviar comprovante</label>
                <input
                  id="comprovante" type="file" accept=".pdf,.png,.jpg,.jpeg"
                  // TODO: enviar o arquivo para a API. Só o dono e a equipe podem abri-lo (RNF02).
                  onChange={(e) => e.target.files[0] && setComprovante(e.target.files[0].name)}
                />
                <small>PDF, PNG ou JPG, até 10 MB.</small>
              </div>
            )}
          </>
        );

      case 'pagamento_confirmado':
      case 'em_andamento':
        return <p>Pagamento confirmado. Nossa equipe está trabalhando no seu documento. Entrega prevista: <strong>{original.entregaPrevista}</strong>.</p>;

      case 'concluida':
        return (
          <>
            <p>Concluída! Seu trabalho está pronto para a banca.</p>
            {/* TODO: link real para o arquivo final vindo da API */}
            <Botao onClick={() => alert('O download funciona quando a API estiver conectada.')}>Baixar documento final</Botao>
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
            <div><dt>Entrega prevista</dt><dd>{original.entregaPrevista ?? 'Após a proposta'}</dd></div>
            <div><dt>Valor</dt><dd>{formatarMoeda(original.valor)}</dd></div>
            <div><dt>Pagamento</dt><dd>{original.pagamento}</dd></div>
          </dl>
        </section>

        {/* Coluna da direita: muda conforme o status */}
        <section className="cartao">
          <h2>{status === 'aguardando_pagamento' ? 'Pagamento' : 'Proposta'}</h2>
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
        {comentarios.length === 0 && <p>Nenhuma mensagem ainda. Se tiver dúvidas, escreva aqui.</p>}
        <ul>
          {comentarios.map((c, i) => (
            <li key={i} className={`comentario comentario--${c.autor}`}>
              <small>{c.autor === 'equipe' ? 'Equipe Arrumaí' : 'Você'} · {c.quando}</small>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={enviarComentario} className="comentarios__form">
          <label htmlFor="comentario" className="so-leitor">Sua mensagem</label>
          <input id="comentario" type="text" placeholder="Escreva sua dúvida" value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} />
          <Botao type="submit">Enviar</Botao>
        </form>
      </section>
    </div>
  );
}
