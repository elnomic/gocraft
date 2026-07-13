import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createClient()
  
  // Get session dari cookie manually
  const { data: { session } } = await supabase.auth.getSession()

  // Daftar route yang membutuhkan login
  const protectedRoutes = [
    '/dashboard',
    '/order',
    '/profile',
    '/worker',
    '/become-worker'
  ]
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Jika route dilindungi dan tidak ada session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Jika sudah login dan mengakses halaman auth (login/register)
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (session && isAuthRoute) {
    // Cek apakah user adalah pekerja
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_worker')
      .eq('id', session.user.id)
      .single()

    if (profile?.is_worker) {
      return NextResponse.redirect(new URL('/worker/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Cegah user biasa mengakses worker dashboard
  if (session && request.nextUrl.pathname.startsWith('/worker')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_worker')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_worker) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/order/:path*',
    '/profile/:path*',
    '/worker/:path*',
    '/auth/:path*',
    '/become-worker'
  ],
}
