import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

// Type untuk worker dengan profile
interface WorkerWithProfile {
  id: string
  user_id: string
  experience_years: number
  rating: number
  total_reviews: number
  is_available: boolean
  profiles: {
    full_name: string
    phone: string
    gender: string
  } | null
}

export default async function OrderDetail({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/order/' + params.id)
  }

  // Ambil detail job
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (error || !job) {
    notFound()
  }

  // Ambil pekerja yang tersedia untuk job ini
  const { data: availableWorkers } = await supabase
    .from('workers')
    .select(`
      id,
      user_id,
      experience_years,
      rating,
      total_reviews,
      is_available,
      profiles:user_id (
        full_name,
        phone,
        gender
      )
    `)
    .eq('is_available', true)
    .order('rating', { ascending: false })
    .limit(5)

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
          <Link href="/order" className="text-sm text-gray-600 hover:text-gray-900">
            ← Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{categoryIcons[job.category] || '🛠️'}</span>
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-blue-100">{job.category}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Deskripsi */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Deskripsi</h2>
              <p className="text-gray-700">{job.description}</p>
            </div>

            {/* Detail */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Estimasi Waktu</p>
                <p className="font-semibold">⏱️ {job.estimated_time}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Harga</p>
                <p className="font-bold text-xl text-blue-600">Rp {job.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Pekerja Tersedia */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                👷 Pekerja Tersedia
              </h2>
              {availableWorkers && availableWorkers.length > 0 ? (
                <div className="space-y-3">
                  {availableWorkers.map((worker: any) => (
                    <div key={worker.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{worker.profiles?.full_name || 'Pekerja'}</p>
                        <p className="text-sm text-gray-600">
                          ⭐ {worker.rating || 0} ({worker.total_reviews || 0} review)
                          {worker.experience_years > 0 && ` • ${worker.experience_years} th pengalaman`}
                        </p>
                        <p className="text-sm text-gray-500">{worker.profiles?.gender}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        ✅ Tersedia
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-4xl mb-2">😕</p>
                  <p className="text-gray-500">Belum ada pekerja tersedia untuk layanan ini</p>
                </div>
              )}
            </div>

            {/* Tombol Pesan */}
            {availableWorkers && availableWorkers.length > 0 ? (
              <Link
                href={`/order/${job.id}/book`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Pesan Sekarang - Rp {job.price.toLocaleString()}
              </Link>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                Pekerja Tidak Tersedia
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
              }
