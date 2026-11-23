import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL("/entrar?erro=confirmacao", baseUrl)
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/entrar?erro=confirmacao", baseUrl)
      );
    }

    return NextResponse.redirect(new URL("/painel", baseUrl));
  } catch {
    return NextResponse.redirect(
      new URL("/entrar?erro=servidor", baseUrl)
    );
  }
}
