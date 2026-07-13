import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-bold text-blue-600">Gocraft</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Masuk
            </Link>
            <Link href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            Tukang Jelas Harga, <br />
            <span className="text-blue-600">Datang Cepat</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Solusi instan untuk anak kos di kota besar
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/order" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Pesan Sekarang
            </Link>
            <Link href="/become-worker" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
              Jadi Pekerja
            </Link>
            {/* Tombol test tambahan */}
            <Link href="/test-supabase" className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50">
              🧪 Test Supabase
            </Link>
          </div>
        </div>

        {/* Fitur Cepat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <span className="text-3xl block mb-2">❄️</span>
            <span className="text-sm font-medium">Service AC</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <span className="text-3xl block mb-2">🔧</span>
            <span className="text-sm font-medium">Ledeng</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <span className="text-3xl block mb-2">⚡</span>
            <span className="text-sm font-medium">Listrik</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <span className="text-3xl block mb-2">🧹</span>
            <span className="text-sm font-medium">Bersih-bersih</span>
          </div>
        </div>
      </main>
    </div>
  )
}
