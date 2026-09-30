import { FLUXO, indiceNoFluxo } from '../utils/status';
import Icone from './Icone';

/* =====================================================================
   LINHA DO TEMPO DA SOLICITAÇÃO (RF04: acompanhar o status)
   Mostra todas as etapas do fluxo e marca:
   - feita:  círculo escuro com check
   - atual:  círculo Pôr do sol com miolo branco
   - futura: círculo vazio
   No computador fica na horizontal; no celular, na vertical (CSS).

   Props:
   - status: chave do status atual (ex.: "em_andamento")
   - datas:  objeto { chave_da_etapa: "12/10" } com a data de cada etapa
   ===================================================================== */
export default function LinhaDoTempo({ status, datas = {} }) {
  const atual = indiceNoFluxo(status);
  const concluida = status === 'concluida';

  return (
    <ol className="fluxo" aria-label="Etapas da solicitação">
      {FLUXO.map((etapa, i) => {
        // Uma etapa está "feita" se vem antes da atual.
        // Na última etapa (Concluída), quando o trabalho termina, ela também vira "feita".
        let estado = 'futura';
        if (i < atual || (concluida && i === atual)) estado = 'feita';
        else if (i === atual) estado = 'atual';

        return (
          <li
            key={etapa.chave}
            className={`fluxo__etapa fluxo__etapa--${estado}`}
            // Avisa leitores de tela qual é a etapa em que estamos
            aria-current={estado === 'atual' ? 'step' : undefined}
          >
            <span className="fluxo__marcador">
              {estado === 'feita' && <Icone nome="check" tamanho={14} />}
            </span>
            <span className="fluxo__texto">
              <strong>{etapa.rotulo}</strong>
              {/* Se a etapa ainda não tem data, o campo fica vazio */}
              <small>{datas[etapa.chave] ?? ''}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
