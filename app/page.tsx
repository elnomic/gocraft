export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-blue-600">⚡ Gocraft</h1>
          <div className="flex gap-3">
            <a href="/auth/login" className="px-4 py-2 text-gray-600">Masuk</a>
            <a href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Daftar</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            Tukang Jelas Harga, <br />
            <span className="text-blue-600">Datang Cepat</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Solusi instan untuk anak kos di kota besar
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/order" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
              Pesan Sekarang
            </a>
            <a href="/become-worker" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold">
              Jadi Pekerja
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
