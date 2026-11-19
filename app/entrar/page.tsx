
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [phone,setPhone] = useState("");
  const [password,setPassword] = useState("");
  const [show,setShow] = useState(false);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ phone: phone.trim(), password });
      if (error) throw error;
      router.push("/painel"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
    finally { setBusy(false); }
  }

  return <main className="container" style={{maxWidth:480,padding:"55px 0"}}>
    <Link className="brand" href="/">LOJA MZ AI</Link>
    <section className="panel" style={{marginTop:24}}>
      <h1>Entrar na tua loja</h1>
      <p className="muted">Utiliza o número de telefone e a tua senha.</p>
      <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:22}}>
        <label>Número de telefone
          <input className="field" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+258 8XXXXXXXX" autoComplete="tel" required />
        </label>
        <label>Senha
          <div style={{display:"flex",gap:8}}>
            <input className="field" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/>
            <button type="button" className="btn btn-light" onClick={()=>setShow(!show)}>{show?"Esconder":"Mostrar"}</button>
          </div>
        </label>
        {error && <p style={{color:"#c71920"}}>{error}</p>}
        <button className="btn btn-red" disabled={busy}>{busy?"A entrar...":"Entrar"}</button>
      </form>
      <p className="muted">Ainda não tens loja? <Link href="/registar" style={{color:"#c71920",fontWeight:700}}>Criar conta</Link></p>
      <p className="muted" style={{fontSize:12}}>A recuperação de senha será disponibilizada através de recuperação segura por telefone ou assistência administrativa, após configurar o serviço de autenticação.</p>
    </section>
  </main>;
  }
        
