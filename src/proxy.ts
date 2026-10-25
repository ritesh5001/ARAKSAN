import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "fr"];

/** Constant-time string comparison (Proxy runs without node:crypto). */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * 1. Staging: when STAGING_PASSWORD is set, the whole site sits behind HTTP
 *    Basic Auth (any username) so review links stay private.
 * 2. Locale: paths without /en or /fr are redirected, French for browsers
 *    that prefer it, English otherwise.
 */
export function proxy(request: NextRequest) {
  const stagingPassword = process.env.STAGING_PASSWORD;
  if (stagingPassword) {
    const header = request.headers.get("authorization") ?? "";
    const [scheme, encoded] = header.split(" ");
    const password = scheme === "Basic" && encoded ? atob(encoded).split(":").slice(1).join(":") : "";
    if (!safeEqual(password, stagingPassword)) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="ARAKSAN staging", charset="UTF-8"', "X-Robots-Tag": "noindex" },
      });
    }
  }

  const { pathname } = request.nextUrl;
  const skipLocale =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/_next") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    /\.[a-z0-9]+$/i.test(pathname);
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (skipLocale || hasLocale) return NextResponse.next();

  const preferred = request.headers.get("accept-language")?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  const locale = preferred === "fr" ? "fr" : "en";
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Static build assets and images are excluded (the image optimiser fetches
  // them internally, without credentials); /_next/image still needs staging auth.
  matcher: ["/((?!_next/static|images/|media/|favicon.ico|icon.svg).*)"],
};
