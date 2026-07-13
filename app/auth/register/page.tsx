'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    birth_date: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Validasi umur minimal 17 tahun
      if (form.birth_date) {
        const birthDate = new Date(form.birth_date)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 17) {
          setError('Usia minimal 17 tahun')
          setLoading(false)
          return
        }
      }

      // Register ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            gender: form.gender,
            birth_date: form.birth_date,
            address: form.address
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Gagal membuat akun')
      }

      const userId = authData.user.id

      // Insert ke tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: form.full_name,
          phone: form.phone,
          gender: form.gender,
          birth_date: form.birth_date,
          address: form.address,
          is_worker: false
        }])

      if (profileError) throw profileError

      setSuccess(true)
      setForm({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        gender: '',
        birth_date: '',
        address: ''
      })

      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)

    } catch (error: any) {
      setError(error.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mb-4">
            Cek email kamu untuk verifikasi akun.
          </p>
          <p className="text-sm text-gray-500">
            Mengalihkan ke halaman login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📝</div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
          <p className="text-gray-600 text-sm">Untuk mulai pesan layanan Gocraft</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.full_name}
              onChange={(e) => setForm({...form, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. HP *
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.gender}
              onChange={(e) => setForm({...form, gender: e.target.value})}
            >
              <option value="">Pilih Gender</option>
              <option value="pria">Pria</option>
              <option value="wanita">Wanita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Lahir *
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.birth_date}
              onChange={(e) => setForm({...form, birth_date: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 17 tahun</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Masuk
          </Link>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link href="/become-worker" className="text-blue-600 hover:underline">
            Mau jadi pekerja? Daftar di sini
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/" className="hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
        }
