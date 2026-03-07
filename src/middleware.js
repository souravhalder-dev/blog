
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Simple in-memory rate limiter (for demonstration; use Redis for production)
const rateLimit = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 100; // 100 requests per minute

  const record = rateLimit.get(ip) || { count: 0, startTime: now };
  
  if (now - record.startTime > windowMs) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count += 1;
  }
  
  rateLimit.set(ip, record);
  return record.count > limit;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // 1. Rate Limiting (Prevent Brute Force / DDoS)
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const response = NextResponse.next();

  // 2. Security Headers (Helmet-like protection)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent Clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; frame-src 'self' https://www.youtube.com;"
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 3. Admin Route Protection (JWT)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // Role-Based Access Control (RBAC)
      if (payload.role !== 'admin') {
          // Block non-admins from sensitive areas
          if (pathname !== '/admin/profile') {
              return NextResponse.redirect(new URL('/admin/profile', request.url));
          }
      }

      // Pass user info to downstream handlers via headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload._id);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // Token invalid/expired - Force logout
      const loginUrl = new URL('/login', request.url);
      const resp = NextResponse.redirect(loginUrl);
      resp.cookies.delete('auth_token');
      return resp;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
