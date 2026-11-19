
import Link from "next/link";

const plans = [
  { name: "Básico", price: "200 MT", products: "50 produtos", detail: "Para começar a vender online" },
  { name: "Profissional", price: "500 MT", products: "200 produtos", detail: "Para lojas em crescimento" },
  { name: "Empresarial", price: "1.000 MT", products: "1.000 produtos", detail: "Para operações maiores" }
];

export default function Home() {
  return <main>
    <header className="topbar">
      <div className="container" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0"}}>
        <div className="brand" style={{fontSize:22}}>LOJA MZ AI</div>
        <nav style={{display:"flex",gap:10}}>
          <Link className="btn btn-light" href="/entrar">Entrar</Link>
          <Link className="btn btn-red" href="/registar">Criar loja</Link>
        </nav>
      </div>
    </header>

    <section className="container" style={{padding:"68px 0 42px"}}>
      <div style={{maxWidth:760}}>
        <p style={{color:"#c71920",fontWeight:800}}>A TUA LOJA, COM INTELIGÊNCIA ARTIFICIAL</p>
        <h1 style={{fontSize:"clamp(38px,7vw,66px)",lineHeight:1.02,margin:"12px 0 18px"}}>
          Vende melhor. Gere tudo num só lugar.
        </h1>
        <p className="muted" style={{fontSize:18,lineHeight:1.7}}>
          Cria a tua loja online, publica produtos, acompanha vendas e lucros e recebe ajuda de inteligência artificial.
        </p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:25}}>
          <Link className="btn btn-red" href="/registar">Criar a minha loja</Link>
          <Link className="btn btn-light" href="/entrar">Já tenho conta</Link>
        </div>
      </div>
    </section>

    <section className="container" style={{padding:"20px 0 70px"}}>
      <h2 style={{fontSize:30}}>Planos mensais</h2>
      <p className="muted">A ativação é confirmada manualmente pelo administrador após verificar o pagamento.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:22}}>
        {plans.map(p=>
          <article className="panel" key={p.name}>
            <h3>{p.name}</h3>
            <div style={{fontSize:30,fontWeight:900,color:"#c71920",margin:"12px 0"}}>
              {p.price}<small style={{fontSize:13,color:"#777"}}>/mês</small>
            </div>
            <b>{p.products}</b>
            <p className="muted">{p.detail}</p>
            <Link className="btn btn-red" href="/registar" style={{width:"100%"}}>
              Escolher plano
            </Link>
          </article>
        )}
      </div>
    </section>

    <footer style={{background:"#171717",color:"#fff",padding:28,textAlign:"center"}}>
      LOJA MZ AI · Plataforma de comércio online
    </footer>
  </main>;
          }
            
