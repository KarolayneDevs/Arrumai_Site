import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import { excluirSolicitacao, fetchSolicitacoes } from '../../services/solicitacoes';
import { getServico } from '../../services/servicos';
import { formatarMoeda } from '../../utils/formatar';

/* =====================================================================
   MINHAS SOLICITAÇÕES (RF04 e RF09: acompanhar e ver o histórico)
   Lista todas as solicitações da cliente, cada uma com selo de status.
   ===================================================================== */
export default function MinhasSolicitacoes() {
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]);

  useEffect(() => {
    fetchSolicitacoes().then(setLista).catch((error) => {
      setLista([]);
      setErro(error.message);
    });
  }, []);

  function alternarSelecao(id) {
    setSelecionadas((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);
  }

  function selecionarTodas() {
    setSelecionadas(lista.map((item) => item.id));
  }

  async function apagarSelecionadas() {
    const itens = lista.filter((item) => selecionadas.includes(item.id));
    if (!itens.length || !window.confirm(`Apagar ${itens.length} solicitação(ões)? Esta ação não pode ser desfeita.`)) return;
    const resultados = await Promise.allSettled(itens.map((item) => excluirSolicitacao(item.id)));
    const removidas = itens.filter((_item, indice) => resultados[indice].status === 'fulfilled');
    const falhas = resultados.filter((resultado) => resultado.status === 'rejected');
    setLista((atual) => atual.filter((item) => !removidas.some((removida) => removida.id === item.id)));
    setSelecionadas((atual) => atual.filter((id) => !removidas.some((removida) => removida.id === id)));
    if (falhas.length) setErro('Não foi possível apagar uma ou mais solicitações.');
  }

  return (
    <div className="container">
      <div className="topo-pagina">
        <h1>Minhas solicitações</h1>
        <div className="topo-pagina__acoes">
          <Botao to="/nova-solicitacao">Nova solicitação</Botao>
          <Botao variante="secundario" onClick={() => { setModoSelecao(!modoSelecao); setSelecionadas([]); }}>
            {modoSelecao ? 'Cancelar seleção' : 'Selecionar'}
          </Botao>
        </div>
      </div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      {modoSelecao && lista.length > 0 && (
        <div className="selecao-acoes">
          <button type="button" className="botao botao--texto" onClick={selecionarTodas}>
            Selecionar todas
          </button>
          <button type="button" className="botao botao--texto botao--perigo" disabled={!selecionadas.length} onClick={apagarSelecionadas}>
            Apagar selecionadas ({selecionadas.length})
          </button>
        </div>
      )}

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
              <div className="item-solicitacao">
                {modoSelecao && (
                  <input
                    className="selecao-checkbox"
                    type="checkbox"
                    aria-label={`Selecionar ${s.titulo}`}
                    checked={selecionadas.includes(s.id)}
                    onChange={() => alternarSelecao(s.id)}
                  />
                )}
                <Link to={`/solicitacao/${s.id}`} className="item-solicitacao__link">
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
