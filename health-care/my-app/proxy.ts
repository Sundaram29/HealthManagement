import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = [
  "/BookAppointment",
  "/MyAppointment",
];

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const redirectTarget = `${pathname}${req.nextUrl.search}`;

  if (pathname.startsWith("/BookAppointment") && !searchParams.get("doctorId")) {
    return NextResponse.redirect(new URL("/HospitalList", req.url));
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { claims },
    error,
  } = await supabase.auth.getClaims();

  const isAuthenticated = !!claims && !error;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirectTo", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/auth") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/BookAppointment/:path*",
    "/MyAppointment/:path*",
    "/auth/:path*",
  ],
};
