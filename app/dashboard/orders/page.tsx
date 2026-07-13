import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrdersHistory() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Ambil semua order user
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      jobs:job_id (title, category, price),
      workers:worker_id (
        id,
        profiles:user_id (full_name, phone)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const statusMap: Record<string, { label: string, color: string, icon: string }> = {
    'pending': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'accepted': { label: 'Diterima', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    'on_way': { label: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800', icon: '🚗' },
    'completed': { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: '🎉' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: '❌' }
  }

  return (
