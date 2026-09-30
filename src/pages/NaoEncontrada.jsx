import Botao from '../components/Botao';

/* Página mostrada quando o endereço digitado não existe (erro 404). */
export default function NaoEncontrada() {
  return (
    <div className="container pagina-estreita">
      <h1>Página não encontrada</h1>
      <p className="lead">O endereço que você abriu não existe. Volte para o início e siga daí.</p>
      <Botao to="/">Ir para o início</Botao>
    </div>
  );
}
