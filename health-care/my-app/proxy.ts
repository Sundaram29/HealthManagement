import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "health_auth_session";

function buildLoginRedirect(req: NextRequest, pathname: string) {
  const redirectTarget = `${pathname}${req.nextUrl.search}`;

  if (pathname.startsWith("/hospital/dashboard")) {
    return new URL("/hospital/login", req.url);
  }

  if (pathname.startsWith("/doctor/dashboard")) {
    return new URL("/doctor/login", req.url);
  }

  if (pathname.startsWith("/blood-bank/dashboard")) {
    return new URL("/blood-bank/login", req.url);
  }

  const loginUrl = new URL("/auth/login", req.url);
  loginUrl.searchParams.set("redirectTo", redirectTarget);
  return loginUrl;
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname.startsWith("/BookAppointment") && !searchParams.get("doctorId")) {
    return NextResponse.redirect(new URL("/HospitalList", req.url));
  }

  const hasSession = Boolean(req.cookies.get(AUTH_COOKIE_NAME)?.value);
  const protectedRoutes = [
    "/BookAppointment",
    "/MyAppointment",
    "/ai-chatbot",
    "/user/dashboard",
    "/hospital/dashboard",
    "/doctor/dashboard",
    "/blood-bank/dashboard",
  ];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(buildLoginRedirect(req, pathname));
  }

  if (pathname.startsWith("/auth") && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/BookAppointment/:path*",
    "/MyAppointment/:path*",
    "/ai-chatbot/:path*",
    "/user/dashboard/:path*",
    "/hospital/dashboard/:path*",
    "/doctor/dashboard/:path*",
    "/blood-bank/dashboard/:path*",
    "/auth/:path*",
  ],
};
