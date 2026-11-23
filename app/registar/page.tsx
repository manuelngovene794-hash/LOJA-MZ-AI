
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (storeName.trim().length < 2) {
      setError("O nome da loja deve ter pelo menos 2 caracteres.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();

      const { data, error: authError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              store_name: storeName.trim(),
            },
          },
        });

      if (authError) {
        throw authError;
      }

      if (!data.session) {
        throw new Error(
          "A conta foi criada, mas não existe sessão ativa. Verifica se a confirmação de email está desativada no Supabase."
        );
      }

      router.replace("/painel");
      router.refresh();

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
    <main
      className="container"
      style={{ maxWidth: 480, padding: "40px 0" }}
    >
      <Link className="brand" href="/">
        LOJA MZ AI
      </Link>

      <section className="panel" style={{ marginTop: 24 }}>
        <h1>Criar a tua loja</h1>

        <p className="muted">
          Regista a tua loja e começa a gerir o teu negócio.
        </p>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 16,
            marginTop: 22,
          }}
        >
          <label>
            Nome da loja
            <input
              className="field"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex.: Minha Loja MZ"
              minLength={2}
              maxLength={80}
              autoComplete="organization"
              required
            />
          </label>

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
                minLength={6}
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

          {error && (
            <p role="alert" style={{ color: "#c71920" }}>
              {error}
            </p>
          )}

          <button
            className="btn btn-red"
            disabled={busy}
            type="submit"
          >
            {busy ? "A criar conta..." : "Criar a minha loja"}
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
        
