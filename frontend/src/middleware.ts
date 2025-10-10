import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Jika user sudah login dan akses /signin, redirect ke home
  if (token && pathname === "/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Daftar path yang memerlukan minimal login (token valid)
  const loginRequiredPaths = ["/", "/profile", "/user", "/machine"];
  const requiresLogin = loginRequiredPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (requiresLogin && !token) {
    // Jika akses path yang butuh login tapi token tidak ada, redirect ke signin
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Jika ada token, decode dan cek role
  if (token) {
    try {
      const decoded: any = jwt.decode(token);
      const userRole = decoded?.role;

      // Jika akses path khusus admin (/user dan /machine)
      const adminOnlyPaths = ["/user", "/machine"];
      const isAdminPath = adminOnlyPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      );

      if (isAdminPath && userRole !== "admin") {
        // Bukan admin dan akses halaman admin only, redirect error
        return NextResponse.redirect(new URL("/error", req.url));
      }

      // Jika sudah login dan akses path lain, lanjutkan
      return NextResponse.next();

    } catch (error) {
      // Token invalid, redirect signin
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // Jika tidak butuh login (misal halaman public), lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/", "/user", "/machine", "/profile"],
};
