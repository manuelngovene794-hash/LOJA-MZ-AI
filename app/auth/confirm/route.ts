import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const allowedTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  if (
    !tokenHash ||
    !type ||
    !allowedTypes.includes(type as (typeof allowedTypes)[number])
  ) {
    return NextResponse.redirect(
      new URL("/entrar?erro=link-invalido", baseUrl)
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as (typeof allowedTypes)[number],
    });

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
