
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("+258");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plan, setPlan] = useState("basic");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!storeName.trim()) {
      setError("Introduz o nome da tua loja.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        phone: phone.trim(),
        password,
        options: {
          data: {
            store_name: storeName.trim(),
            requested_plan: plan
          }
        }
      });

      if (error) throw error;

      setSuccess(
        "Registo enviado com sucesso. Se a confirmação por telefone estiver ativa, segue as instruções recebidas."
      );

      setTimeout(() => {
        router.push("/entrar");
      }, 2500);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a conta."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 480, padding: "45px 0" }}>
      <Link className="brand" href="/">LOJA MZ AI</Link>

      <section className="panel" style={{ marginTop: 24 }}>
        <h1>Criar a tua loja</h1>
        <p className="muted">
          Regista-te para começares a gerir a tua loja online.
        </p>

        <form
          onSubmit={submit}
          style={{ display: "grid", gap: 14, marginTop: 22 }}
        >
          <label>
            Nome da loja
            <input
              className="field"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Ex.: Minha Loja"
              required
            />
          </label>

          <label>
            Número de telefone
            <input
              className="field"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+258 8XXXXXXXX"
              autoComplete="tel"
              required
            />
          </label>

          <label>
            Plano da loja
            <select
              className="field"
              value={plan}
              onChange={e => setPlan(e.target.value)}
            >
              <option value="basic">Básico — 200 MT/mês</option>
              <option value="pro">Profissional — 500 MT/mês</option>
              <option value="business">Empresarial — 1.000 MT/mês</option>
            </select>
          </label>

          <label>
            Senha
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="field"
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShow(!show)}
              >
                {show ? "Esconder" : "Mostrar"}
              </button>
            </div>
          </label>

          <label>
            Confirmar senha
            <input
              className="field"
              type={show ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error && (
            <p style={{ color: "#c71920" }}>{error}</p>
          )}

          {success && (
            <p style={{ color: "#16803c" }}>{success}</p>
          )}

          <button className="btn btn-red" disabled={busy}>
            {busy ? "A criar conta..." : "Criar conta e loja"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 20 }}>
          Já tens conta?{" "}
          <Link
            href="/entrar"
            style={{ color: "#c71920", fontWeight: 700 }}
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
