import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import { fetchSolicitacoes, SOLICITACOES } from '../../services/solicitacoes';
import { getServico } from '../../services/servicos';
import { formatarMoeda } from '../../utils/formatar';

/* =====================================================================
   MINHAS SOLICITAÇÕES (RF04 e RF09: acompanhar e ver o histórico)
   Lista todas as solicitações da cliente, cada uma com selo de status.
   ===================================================================== */
export default function MinhasSolicitacoes() {
  const [lista, setLista] = useState(SOLICITACOES);

  useEffect(() => {
    fetchSolicitacoes().then(setLista).catch(() => setLista(SOLICITACOES));
  }, []);

  return (
    <div className="container">
      <div className="topo-pagina">
        <h1>Minhas solicitações</h1>
        <Botao to="/nova-solicitacao">Nova solicitação</Botao>
      </div>

      {/* Estado vazio: convida a pessoa a agir, em vez de mostrar uma tela em branco */}
      {lista.length === 0 ? (
        <div className="cartao">
          <p>Você ainda não tem solicitações. Envie seu primeiro arquivo e receba a proposta em até 24 horas.</p>
        </div>
      ) : (
        <ul className="lista-solicitacoes">
          {lista.map((s) => (
            <li key={s.id}>
              {/* O cartão inteiro é um link para a página de detalhes */}
              <Link to={`/solicitacao/${s.id}`} className="item-solicitacao">
                <div>
                  <small>#{s.id} · {getServico(s.servico)?.nome}</small>
                  <h2>{s.titulo}</h2>
                </div>
                <dl className="item-solicitacao__dados">
                  <div><dt>Valor</dt><dd>{formatarMoeda(s.valor)}</dd></div>
                  <div><dt>Entrega</dt><dd>{s.entregaPrevista ?? '—'}</dd></div>
                </dl>
                <StatusBadge status={s.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
