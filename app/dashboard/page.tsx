import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  // Ambil profil user - PAKAI 'id' BUKAN 'user_id'
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Ambil order terakhir
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Ambil data job untuk setiap order
  let ordersWithJobs: any[] = []
  if (orders) {
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i]
      const { data: job } = await supabase
        .from('jobs')
        .select('title, category, price')
        .eq('id', order.job_id)
        .single()
      
      ordersWithJobs.push({
        ...order,
        jobs: job
      })
    }
  }

  const statusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    'accepted': { label: 'Diterima', color: 'bg-blue-100 text-blue-800' },
    'on_way': { label: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800' },
    'completed': { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold text-blue-600">Gocraft</h1>
          </div>
          <div className="flex gap-3">
            <span className="text-sm text-gray-600">Halo, {profile?.full_name || 'User'}</span>
            <form action="/auth/logout" method="POST">
              <button className="text-sm text-red-600 hover:text-red-700">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold">Selamat Datang, {profile?.full_name}! 👋</h2>
          <p className="text-blue-100 mt-1">Cari tukang langsung pesan di sini</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/order" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
            <span className="text-3xl block mb-2">🛠️</span>
            <span className="text-sm font-medium">Pesan Tukang</span>
          </Link>
          <Link href="/dashboard/orders" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
            <span className="text-3xl block mb-2">📋</span>
            <span className="text-sm font-medium">Riwayat Order</span>
          </Link>
          <Link href="/dashboard/profile" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
            <span className="text-3xl block mb-2">👤</span>
            <span className="text-sm font-medium">Profil</span>
          </Link>
          <Link href="/become-worker" className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
            <span className="text-3xl block mb-2">👷</span>
            <span className="text-sm font-medium">Jadi Pekerja</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Pesanan Terakhir</h3>
            <Link href="/dashboard/orders" className="text-blue-600 text-sm hover:underline">
              Lihat Semua →
            </Link>
          </div>

          {ordersWithJobs && ordersWithJobs.length > 0 ? (
            <div className="space-y-3">
              {ordersWithJobs.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{order.jobs?.title || 'Order'}</p>
                    <p className="text-sm text-gray-600">
                      {order.jobs?.category} • Rp {order.price_total?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusMap[order.status]?.color || 'bg-gray-100'
                  }`}>
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📭</p>
              <p>Belum ada pesanan</p>
              <Link href="/order" className="text-blue-600 hover:underline text-sm">
                Pesan sekarang →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
          }
