
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuração do Supabase em falta. Verifica as variáveis de ambiente."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Em componentes onde os cookies são apenas de leitura,
            // a atualização deve ser feita através do middleware.
            // Não esconder outros erros.
            if (
              process.env.NODE_ENV === "development"
            ) {
              console.error(
                "Erro ao atualizar cookies do Supabase:",
                error
              );
            }
          }
        },
      },
    }
  );
}
