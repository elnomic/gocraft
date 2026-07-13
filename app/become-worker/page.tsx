'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BecomeWorker() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    birth_date: '',
    address: '',
    job_id: '',
    experience_years: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const supabase = createClient()
      
      // Hitung umur dari birth_date
      const birthDate = new Date(form.birth_date)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      // Validasi umur minimal 17 tahun
      if (age < 17) {
        setMessage('❌ Usia minimal 17 tahun')
        setLoading(false)
        return
      }
      
      // 1. Register ke Supabase Auth
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
      
      // 2. Insert ke tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: form.full_name,
          phone: form.phone,
          gender: form.gender,
          birth_date: form.birth_date,
          address: form.address,
          is_worker: true
        }])
      
      if (profileError) throw profileError
      
      // 3. Insert ke tabel workers
      const { error: workerError } = await supabase
        .from('workers')
        .insert([{
          user_id: userId,
          job_id: form.job_id || null,
          experience_years: parseInt(form.experience_years) || 0,
          is_available: true
        }])
      
      if (workerError) throw workerError
      
      setMessage('✅ Registrasi berhasil! Silakan cek email untuk verifikasi.')
      setForm({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        gender: '',
        birth_date: '',
        address: '',
        job_id: '',
        experience_years: ''
      })
      
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">👷</span>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Jadi Pekerja</h1>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Min. usia 17 tahun • Pria & Wanita • Bisa pilih bidang
        </p>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.full_name}
              onChange={(e) => setForm({...form, full_name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">No. HP *</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.gender}
              onChange={(e) => setForm({...form, gender: e.target.value})}
            >
              <option value="">Pilih Gender</option>
              <option value="pria">Pria</option>
              <option value="wanita">Wanita</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Lahir *</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.birth_date}
              onChange={(e) => setForm({...form, birth_date: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Pengalaman Kerja (tahun)</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.experience_years}
              onChange={(e) => setForm({...form, experience_years: e.target.value})}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Mendaftar...' : 'Daftar Jadi Pekerja'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Sudah punya akun? <a href="/auth/login" className="text-blue-600 hover:underline">Login</a>
        </p>
        
        <p className="text-center text-sm text-gray-600 mt-2">
          <a href="/" className="text-blue-600 hover:underline">← Kembali ke Beranda</a>
        </p>
      </div>
    </div>
  )
            }
