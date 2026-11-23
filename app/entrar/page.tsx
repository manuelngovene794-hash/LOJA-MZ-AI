
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) throw loginError;

      if (!data.session) {
        throw new Error("Não foi possível iniciar a sessão.");
      }

      router.replace("/painel");
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Verifica os teus dados."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="container"
      style={{ maxWidth: 480, padding: "55px 0" }}
    >
      <Link className="brand" href="/">
        LOJA MZ AI
      </Link>

      <section className="panel" style={{ marginTop: 24 }}>
        <h1>Entrar na tua loja</h1>

        <p className="muted">
          Utiliza o teu email e a tua senha.
        </p>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 14,
            marginTop: 22,
          }}
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
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShow((v) => !v)}
              >
                {show ? "Esconder" : "Mostrar"}
              </button>
            </div>
          </label>

          {error && (
            <p role="alert" style={{ color: "#c71920" }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-red"
            type="submit"
            disabled={busy}
          >
            {busy ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p className="muted">
          Ainda não tens loja?{" "}
          <Link
            href="/registar"
            style={{ color: "#c71920", fontWeight: 700 }}
          >
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
                  }
