import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../../components/Botao';
import StatusBadge from '../../components/StatusBadge';
import { listarSolicitacoesAdmin, mensagemDeErro, usandoDemonstracao } from '../../services/admin';
import { formatarData } from '../../utils/datas';
import { formatarMoeda } from '../../utils/formatar';
import '../../styles/admin.css';

/* =====================================================================
   PAINEL DA EQUIPE (RF10)
   Lista todas as solicitações enviadas pelos clientes, separadas em abas.
   A aba inicial, "Para analisar", mostra o que está esperando uma decisão:
   aceitar (enviar proposta) ou recusar. Clicar numa solicitação abre a
   tela de análise (AnalisarSolicitacao.jsx).
   ===================================================================== */

// Cada aba tem um nome e um "teste": quais status entram nela.
const ABAS = [
  { chave: 'novas', rotulo: 'Para analisar', testa: (s) => ['recebida', 'em_analise'].includes(s.status) },
  { chave: 'cliente', rotulo: 'Aguardando cliente', testa: (s) => ['proposta_enviada', 'aguardando_pagamento'].includes(s.status) },
  { chave: 'andamento', rotulo: 'Em andamento', testa: (s) => ['pagamento_confirmado', 'em_andamento'].includes(s.status) },
  { chave: 'encerradas', rotulo: 'Finalizadas', testa: (s) => ['concluida', 'recusada', 'cancelada'].includes(s.status) },
  { chave: 'todas', rotulo: 'Todas', testa: () => true },
];

export default function PainelAdmin() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('novas');

  /** Busca as solicitações na API. Também serve para o botão "Tentar de novo". */
  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setLista(await listarSolicitacoesAdmin());
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  // Carrega uma vez, quando a página abre
  useEffect(() => {
    carregar();
  }, []);

  // Quantas solicitações existem em cada aba (aparece como número na aba).
  // useMemo evita refazer a conta a cada digitação ou clique.
  const contagens = useMemo(
    () => Object.fromEntries(ABAS.map((a) => [a.chave, lista.filter(a.testa).length])),
    [lista],
  );

  const abaAtual = ABAS.find((a) => a.chave === aba);
  const visiveis = lista.filter(abaAtual.testa);

  return (
    <div className="container">
      <div className="topo-pagina">
        <div>
          <h1>Painel da equipe</h1>
          <p className="lead lead--curto">Analise os pedidos e decida: aceitar com uma proposta ou recusar.</p>
        </div>
        <Botao variante="secundario" onClick={carregar} disabled={carregando}>
          {carregando ? 'Atualizando...' : 'Atualizar lista'}
        </Botao>
      </div>

      {usandoDemonstracao() && (
        <p className="aviso" role="status">
          Demonstração sem banco: os dados exibidos são exemplos e não ficam salvos.
        </p>
      )}

      {/* Abas de filtro */}
      <div className="abas" role="tablist" aria-label="Filtrar solicitações">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            type="button"
            role="tab"
            aria-selected={aba === a.chave}
            className={`aba ${aba === a.chave ? 'aba--ativa' : ''}`}
            onClick={() => setAba(a.chave)}
          >
            {a.rotulo}
            <span className="aba__contagem">{contagens[a.chave]}</span>
          </button>
        ))}
      </div>

      {/* Erro (ex.: backend desligado) */}
      {erro && (
        <div className="aviso aviso--erro" role="alert">
          <p>{erro}</p>
          <Botao variante="texto" onClick={carregar}>Tentar de novo</Botao>
        </div>
      )}

      {/* Lista */}
      {!erro && !carregando && visiveis.length === 0 && (
        <div className="cartao">
          <p>{aba === 'novas' ? 'Nenhuma solicitação esperando análise. Bom trabalho!' : 'Nada por aqui.'}</p>
        </div>
      )}

      <ul className="lista-solicitacoes">
        {visiveis.map((s) => (
          <li key={s.id}>
            {/* Solicitações recém-recebidas ganham uma faixa colorida para chamar atenção */}
            <Link
              to={`/admin/solicitacao/${s.id}`}
              className={`item-solicitacao ${s.status === 'recebida' ? 'item-solicitacao--nova' : ''}`}
            >
              <div>
                <small>{s.protocolo} · {s.servicoNome}</small>
                <h2>{s.titulo}</h2>
              </div>
              <dl className="item-solicitacao__dados">
                <div><dt>Recebida em</dt><dd>{formatarData(s.criadaEm)}</dd></div>
                <div><dt>Valor</dt><dd>{formatarMoeda(s.valor)}</dd></div>
              </dl>
              <StatusBadge status={s.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}