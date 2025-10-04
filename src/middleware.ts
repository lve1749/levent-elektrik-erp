import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Korumalı rotalar
const protectedRoutes = ['/', '/stok-analiz', '/listeler', '/siparisler', '/arsiv']
// Public rotalar
const publicRoutes = ['/login']

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')
  const pathname = request.nextUrl.pathname

  // API rotalarını kontrol etme
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Static dosyaları kontrol etme
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Korumalı rota kontrolü
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Oturum yoksa ve korumalı rotaya erişmeye çalışıyorsa login'e yönlendir
  if (!sessionToken && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Oturum varsa ve login sayfasına gitmeye çalışıyorsa stok analize yönlendir
  if (sessionToken && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/stok-analiz'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}