import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/auth/callback"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  const token = request.cookies.get("access_token")?.value

  if (!isPublicPath && !token) {
    const redirectTo = `${request.nextUrl.origin}/auth/callback`
    const loginUrl = `https://ai-search-hr-api-dfbahehtdkaxh7c2.centralus-01.azurewebsites.net/api/auth?redirect_uri=${encodeURIComponent(
      redirectTo
    )}`
    // return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
