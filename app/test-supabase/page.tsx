import { createClient } from '@/lib/supabase/server'

export default async function TestSupabase() {
  const supabase = createClient()
  
  // Test baca data dari tabel jobs
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .limit(5)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Test Koneksi Supabase</h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-bold">❌ Gagal Koneksi!</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4">
            <p className="font-bold">✅ Koneksi Berhasil!</p>
            <p className="text-sm">Data ditemukan: {jobs?.length || 0} pekerjaan</p>
          </div>
        )}
        
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Data Jobs:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(jobs, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
