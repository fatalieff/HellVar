import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'hellvar.locale';
const DEFAULT_LOCALE = 'az';
const NON_DEFAULT_LOCALES = ['en', 'tr', 'ru'];
const ALL_LOCALES = ['az', 'en', 'tr', 'ru'];

// Login tələb edən marşrutlar
const PROTECTED = ['/dashboard', '/profile', '/provider', '/categories'];

function stripPrefix(pathname: string, prefix: string): string {
  if (pathname === `/${prefix}`) return '/';
  if (pathname.startsWith(`/${prefix}/`)) return pathname.slice(prefix.length + 1);
  return pathname;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // URL prefiksindən dili müəyyən et (/tr/about -> tr)
  let urlLocale: string | null = null;
  if (first && NON_DEFAULT_LOCALES.includes(first)) urlLocale = first;
  else if (first === 'az') urlLocale = 'az';

  const internalPath =
    urlLocale && first !== 'az'
      ? '/' + segments.slice(1).join('/')
      : pathname;
  const internal = internalPath === '' ? '/' : internalPath;

  const cookieRaw = request.cookies.get(COOKIE_NAME)?.value;
  const cookieLocale = cookieRaw && ALL_LOCALES.includes(cookieRaw) ? cookieRaw : null;

  // Auth: qorunan səhifələrdə sessiya olmasa logine yönləndir
  const hasSession = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  );
  const protectedHit = PROTECTED.some(
    (p) => internal === p || internal.startsWith(`${p}/`)
  );
  if (protectedHit && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // /az/... prefiksi olmamalıdır — prefikssiz formaya yönləndir (az defaultdur)
  if (first === 'az') {
    const url = request.nextUrl.clone();
    url.pathname = internal;
    return NextResponse.redirect(url);
  }

  // Prefiksli qeyri-default dil (/tr, /ru, /en): cookie-ni uyğunlaşdır, keçir
  if (urlLocale) {
    const headers = new Headers(request.headers);
    headers.set('x-locale', urlLocale);
    const res = NextResponse.next({ request: { headers } });
    if (cookieLocale !== urlLocale) {
      res.cookies.set(COOKIE_NAME, urlLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return res;
  }

  // Prefiks yoxdur: cookie qeyri-default dil göstərirsə prefiksli URL-yə yönləndir
  const effective = cookieLocale ?? DEFAULT_LOCALE;
  if (effective !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === '/'
        ? `/${effective}`
        : `/${effective}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Default az dili: keçir
  const headers = new Headers(request.headers);
  headers.set('x-locale', DEFAULT_LOCALE);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|logo.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
};
