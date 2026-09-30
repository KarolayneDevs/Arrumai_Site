import Botao from '../components/Botao';
import Ondas from '../components/Ondas';
import { Simbolo } from '../components/Logo';
import Icone from '../components/Icone';
import { SERVICOS } from '../services/servicos';

/* =====================================================================
   PÁGINA INICIAL (mockups 05 e 06 do guia)
   Seções: destaque (hero) > números > para quem é > como funciona >
   serviços > chamada final.
   ===================================================================== */

// Público-alvo (mockup: Estudante, Pesquisador, Secretaria acadêmica).
// "cor" define a barrinha colorida no topo de cada cartão.
const PUBLICO = [
  { titulo: 'Estudante', cor: 'var(--por-do-sol)', texto: 'Fechando TCC, monografia ou dissertação? Tenha tudo nas normas sem virar especialista.' },
  { titulo: 'Pesquisador', cor: 'var(--solimoes)', texto: 'Artigo para periódico com padronização rigorosa e histórico das versões entregues.' },
  { titulo: 'Secretaria acadêmica', cor: 'var(--mata)', texto: 'Documentos institucionais em volume e relatórios simples de prazos.' },
];

// Passos do "Como funciona". Aqui a numeração faz sentido: é uma sequência real.
const PASSOS = [
  { titulo: 'Envie o arquivo', texto: 'Anexe seu trabalho e informe a norma que sua instituição exige.' },
  { titulo: 'Receba a proposta', texto: 'Prazo e valor claros em até 24 horas, sem rodeios. Se aceitar, o pagamento é por Pix.' },
  { titulo: 'Acompanhe e aprove', texto: 'Veja cada etapa, da recebida à concluída, e receba o documento pronto.' },
];

export default function Home() {
  return (
    <>
      {/* ---------- 1. DESTAQUE (hero) ---------- */}
      <section className="hero">
        <div className="container hero__interno">
          <div className="hero__texto">
            <span className="pilula">Formatação ABNT · Manaus</span>
            <h1>
              Seu trabalho, formatado do jeito <span className="destaque">que a banca espera.</span>
            </h1>
            <p className="hero__apoio">
              Envie seu arquivo, receba a proposta em até 24 horas e acompanhe cada etapa até a entrega.
            </p>
            <div className="hero__acoes">
              <Botao to="/nova-solicitacao">Pedir orçamento</Botao>
              <a href="#como-funciona" className="botao botao--secundario">Como funciona</a>
            </div>
          </div>

          {/* Ilustração: ondas + símbolo grande + dois "cartões" flutuantes */}
          <Ondas className="hero__arte">
            <Simbolo tamanho={210} className="hero__simbolo" />
            <span className="hero__flutuante hero__flutuante--topo selo selo--sucesso">Concluída</span>
            <div className="hero__flutuante hero__flutuante--base">
              <strong>Em andamento</strong>
              <small>Proposta enviada em até 24 horas</small>
            </div>
          </Ondas>
        </div>
      </section>

      {/* ---------- 2. NÚMEROS ---------- */}
      <section className="container numeros" aria-label="Em resumo">
        <p><strong>24 h</strong> para receber sua proposta</p>
        <p><strong>ABNT</strong> e demais normas da sua instituição</p>
        <p><strong>Pix</strong> pagamento simples e direto</p>
      </section>

      {/* ---------- 3. PARA QUEM É ---------- */}
      <section className="container secao">
        <h2>Para quem é</h2>
        <div className="grade grade--3">
          {PUBLICO.map((p) => (
            <article key={p.titulo} className="publico" style={{ '--cor': p.cor }}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- 4. COMO FUNCIONA (id usado pelo link do menu) ---------- */}
      <section id="como-funciona" className="faixa-escura">
        <div className="container secao">
          <h2>Como funciona</h2>
          <ol className="grade grade--3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="passo">
                <span className="passo__numero">{i + 1}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- 5. SERVIÇOS (RF02) ---------- */}
      <section id="servicos" className="container secao">
        <h2>O que fazemos</h2>
        <div className="grade grade--3">
          {SERVICOS.map((s) => (
            <article key={s.id} className="cartao servico">
              <Icone nome={s.icone} tamanho={30} />
              <h3>{s.nome}</h3>
              <p>{s.descricao}</p>
              {/* ?servico=... já deixa a opção marcada na tela de nova solicitação */}
              <Botao to={`/nova-solicitacao?servico=${s.id}`} variante="texto">Pedir {s.nome.toLowerCase()}</Botao>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
