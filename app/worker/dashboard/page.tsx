import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WorkerDashboard() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Ambil profil user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Cek apakah user adalah pekerja
  if (!profile?.is_worker) {
    redirect('/dashboard')
  }

  // Ambil data pekerja
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // Ambil job yang dikerjakan
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      jobs:job_id (title, category, price),
      profiles:user_id (full_name, phone)
    `)
    .eq('worker_id', worker?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const statusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    'accepted': { label: 'Diterima', color: 'bg-blue-100 text-blue-800' },
    'on_way': { label: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800' },
    'completed': { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
  }

  const allOrders = orders as any[] || []
  
  // Hitung statistik
  const totalOrders = allOrders.length
  const completedOrders = allOrders.filter((o: any) => o.status === 'completed').length
  const pendingOrders = allOrders.filter((o: any) => o.status === 'pending' || o.status === 'accepted').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold text-blue-600">Gocraft - Pekerja</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Halo, {profile?.full_name}</span>
            <span className={`text-xs px-3 py-1 rounded-full ${
              worker?.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {worker?.is_available ? '✅ Tersedia' : '❌ Tidak Tersedia'}
            </span>
            <form action="/auth/logout" method="POST">
              <button className="text-sm text-red-600 hover:text-red-700">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
            <p className="text-sm text-gray-600">Total Pesanan</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
            <p className="text-sm text-gray-600">Selesai</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
            <p className="text-sm text-gray-600">Proses</p>
          </div>
        </div>

        {/* Toggle Availability */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex justify-between items-center">
          <span className="font-medium">Status Ketersediaan</span>
          <form action="/worker/toggle-availability" method="POST">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                worker?.is_available ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {worker?.is_available ? 'Tutup' : 'Buka'} Layanan
            </button>
          </form>
        </div>

        {/* Daftar Pesanan */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">📋 Pesanan</h2>
          
          {allOrders.length > 0 ? (
            <div className="space-y-4">
              {allOrders.map((order: any) => {
                const userProfile = order.profiles || {}
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{order.jobs?.title}</p>
                        <p className="text-sm text-gray-600">
                          {order.jobs?.category} • Rp {order.price_total?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          👤 {userProfile.full_name || 'User'} • 📞 {userProfile.phone || '-'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {order.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusMap[order.status]?.color || 'bg-gray-100'
                        }`}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tombol Aksi */}
                    {order.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <form action={`/worker/accept-order/${order.id}`} method="POST">
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            Terima
                          </button>
                        </form>
                        <form action={`/worker/reject-order/${order.id}`} method="POST">
                          <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            Tolak
                          </button>
                        </form>
                      </div>
                    )}
                    
                    {order.status === 'accepted' && (
                      <div className="mt-3 flex gap-2">
                        <form action={`/worker/start-order/${order.id}`} method="POST">
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Dalam Perjalanan
                          </button>
                        </form>
                      </div>
                    )}
                    
                    {order.status === 'on_way' && (
                      <div className="mt-3 flex gap-2">
                        <form action={`/worker/complete-order/${order.id}`} method="POST">
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            Selesai
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p>Belum ada pesanan</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
