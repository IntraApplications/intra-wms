import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options: {
            path: string;
            maxAge: number;
            sameSite: "lax" | "strict" | "none";
          }
        ) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.headers.append("Set-Cookie", req.cookies.get(name)!.toString());
        },
        remove(name: string, options: { path: string }) {
          req.cookies.delete({
            name,
            ...options,
          });
          res.headers.append("Set-Cookie", req.cookies.get(name)!.toString());
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If there's a session and the user is trying to access login/signup pages
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
