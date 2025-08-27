// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// const PUBLIC_PATHS = ["/auth/callback"]

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl

//   const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
//   const token = request.cookies.get("access_token")?.value

//   if (!isPublicPath && !token) {
//     const redirectTo = `${request.nextUrl.origin}/auth/callback`
//     const loginUrl = `https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/auth/login?redirect_uri=${encodeURIComponent(
//       redirectTo
//     )}`
//     return NextResponse.redirect(loginUrl)
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// }

// -------------------------------------

// middleware.ts (Next.js 13/15)
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; // set in .env.local
// const PUBLIC_PATHS = ["/auth/callback", "/health"]; // add any other public paths

// export async function middleware(req: NextRequest) {
//   const { pathname, origin, search } = req.nextUrl;
//   const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
//   if (isPublic) return NextResponse.next();

//   // simple loop-guard cookie
//   const already = req.cookies.get("auth_redirected")?.value === "1";

//   // ask the API if we are logged in
//   try {
//     const me = await fetch(`${API_BASE}/auth/me`, {
//       method: "GET",
//       headers: { "X-Requested-With": "Middleware" },
//       // don't include credentials; the browser will include the cookie for the API domain automatically on fetch from client pages
//       // (this is middleware — a server fetch — so no browser cookie here)
//       cache: "no-store",
//     });

//     if (me.ok) return NextResponse.next();
//   } catch {
//     // ignore and fall through to redirect
//   }

//   if (!already) {
//     const login = new URL("/auth/login", API_BASE);
//     login.searchParams.set("next", origin + pathname + search); // where to return after login

//     const res = NextResponse.redirect(login);
//     // loop guard (5 min)
//     res.cookies.set("auth_redirected", "1", { path: "/", maxAge: 300, httpOnly: false });
//     return res;
//   }

//   // if we somehow get back here again, let it through to avoid infinite loop
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };




import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!; // set in .env.local
const PUBLIC_PATHS = ["/auth/callback", "/health"]; // add any other public paths

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // simple loop-guard cookie
  const already = req.cookies.get("auth_redirected")?.value === "1";

  // get access token from cookies
  const token = req.cookies.get("access_token")?.value;

  // ask the API if we are logged in
  try {
    const headers: HeadersInit = { "X-Requested-With": "Middleware" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const me = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (me.ok) return NextResponse.next();
  } catch {
    // ignore and fall through to redirect
  }

  if (!already) {
    const login = new URL("/auth/login", API_BASE);
    login.searchParams.set("next", origin + pathname + search); // where to return after login

    const res = NextResponse.redirect(login);
    // loop guard (5 min)
    res.cookies.set("auth_redirected", "1", { path: "/", maxAge: 28800, httpOnly: false });
    return res;
  }

  // if we get back here again, let it through to avoid infinite loop
  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};