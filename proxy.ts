import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const authPages = ["/login"];
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  const publicPages = ["/privacy", "/terms"];
  const isPublic = publicPages.some((page) => pathname === page);

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: baseUrl,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  if (!isAuthPage && !session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|rpc|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
