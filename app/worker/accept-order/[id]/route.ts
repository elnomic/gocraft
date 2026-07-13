import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Update status order
  const { error } = await supabase
    .from('orders')
    .update({ status: 'accepted' })
    .eq('id', params.id)

  if (error) {
    console.error('Error accepting order:', error)
  }

  return NextResponse.redirect(new URL('/worker/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
