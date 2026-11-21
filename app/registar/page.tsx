"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setBusy(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

      if (error) throw error;

      if (data.session) {
        router.push("/painel");
        router.refresh();
      } else {
        setSuccess(
          "Conta criada! Verifica o teu email para confirmar o registo antes de entrar."
        );
      }
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
    <main className="container" style={{ maxWidth: 480, padding: "55px 0" }}>
      <Link className="brand" href="/">
        LOJA MZ AI
      </Link>

      <section className="panel" style={{ marginTop: 24 }}>
        <h1>Criar a tua loja</h1>

        <p className="muted">
          Cria a tua conta utilizando email e senha.
        </p>

        <form
          onSubmit={submit}
          style={{ display: "grid", gap: 14, marginTop: 22 }}
        >
          <label>
            Email
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@gmail.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="field"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p style={{ color: "#c71920" }}>{error}</p>}

          {success && <p style={{ color: "green" }}>{success}</p>}

          <button className="btn btn-red" disabled={busy}>
            {busy ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        <p className="muted">
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
    
