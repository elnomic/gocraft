import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function OrderPage() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/order')
  }

  // Ambil semua pekerjaan aktif
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const categoryIcons: Record<string, string> = {
    'AC': '❄️',
    'Ledeng': '🔧',
    'Listrik': '⚡',
    'Bersih-bersih': '🧹'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold text-blue-600">Gocraft</h1>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2">Pilih Layanan</h2>
        <p className="text-gray-600 mb-6">Harga jelas, datang cepat, pekerja terverifikasi</p>

        {/* Daftar Pekerjaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs?.map((job: any) => (
            <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <span className="text-3xl">{categoryIcons[job.category] || '🛠️'}</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {job.category}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>⏱️ {job.estimated_time}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  Rp {job.price.toLocaleString()}
                </span>
                <Link 
                  href={`/order/${job.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Pesan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
