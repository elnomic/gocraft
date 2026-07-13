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
    .update({ status: 'completed' })
    .eq('id', params.id)

  if (error) {
    console.error('Error completing order:', error)
  }

  // Set worker available again
  const { data: order } = await supabase
    .from('orders')
    .select('worker_id')
    .eq('id', params.id)
    .single()

  if (order) {
    await supabase
      .from('workers')
      .update({ is_available: true })
      .eq('id', order.worker_id)
  }

  return NextResponse.redirect(new URL('/worker/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
