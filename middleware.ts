import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  // Route yang butuh login
  const protectedRoutes = ['/dashboard', '/order', '/profile', '/worker']
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Route auth (login/register) - redirect ke dashboard jika sudah login
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuth = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (session && isAuth) {
    // Cek role
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/order/:path*', '/profile/:path*', '/worker/:path*', '/auth/:path*']
}
