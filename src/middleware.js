import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|icons|images|api|admin|maintenance).*)',
  ],
};

export async function middleware(request) {
  try {
    const res = await fetch(new URL('/api/settings/maintenance', request.url), {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.maintenance) {
      const maintenanceUrl = new URL('/maintenance', request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  } catch {}
  return NextResponse.next();
}

