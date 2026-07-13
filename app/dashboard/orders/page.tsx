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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl font-bold text-blue-600">Gocraft</h1>
            </Link>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">📋 Riwayat Pesanan</h1>
        <p className="text-gray-600 mb-6">Semua pesanan layanan kamu</p>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.jobs?.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        statusMap[order.status]?.color || 'bg-gray-100'
                      }`}>
                        <span>{statusMap[order.status]?.icon || '📌'}</span>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Kategori:</span> {order.jobs?.category}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Harga:</span> Rp {order.price_total?.toLocaleString()}
                      </p>
                      <p className="text-gray-600 col-span-2">
                        <span className="font-medium">Alamat:</span> {order.address}
                      </p>
                      {order.workers?.profiles && (
                        <p className="text-gray-600 col-span-2">
                          <span className="font-medium">Pekerja:</span> {order.workers.profiles.full_name} 
                          {order.workers.profiles.phone && ` (${order.workers.profiles.phone})`}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-gray-600 col-span-2">
                          <span className="font-medium">Catatan:</span> {order.notes}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs col-span-2">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-500 mb-4">Mulai pesan layanan pertama kamu sekarang</p>
            <Link href="/order" className="btn-primary inline-block">
              Pesan Sekarang
            </Link>
          </div>
        )}
      </main>
    </div>
  )
                }
