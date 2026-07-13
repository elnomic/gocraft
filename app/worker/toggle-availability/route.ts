import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Ambil data worker
  const { data: worker } = await supabase
    .from('workers')
    .select('id, is_available')
    .eq('user_id', session.user.id)
    .single()

  if (!worker) {
    return NextResponse.json({ error: 'Data pekerja tidak ditemukan' }, { status: 404 })
  }

  // Toggle status
  const { error } = await supabase
    .from('workers')
    .update({ is_available: !worker.is_available })
    .eq('id', worker.id)

  if (error) {
    console.error('Error toggling availability:', error)
  }

  return NextResponse.redirect(new URL('/worker/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
