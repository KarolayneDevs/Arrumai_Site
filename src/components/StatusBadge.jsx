import { getStatusInfo } from '../utils/status';

/* =====================================================================
   SELO DE STATUS (ex.: "● Em andamento")
   Recebe a chave do status e escolhe texto e cor sozinho.
   Uso: <StatusBadge status="em_andamento" />
   ===================================================================== */
export default function StatusBadge({ status }) {
  const { rotulo, tom } = getStatusInfo(status);

  return (
    <span className={`selo selo--${tom}`}>
      {/* A bolinha colorida vem do CSS (::before) */}
      {rotulo}
    </span>
  );
}
