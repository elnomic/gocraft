'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const supabase = createClient()
      
      // Hitung umur
      const birthDate = new Date(form.birth_date)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 17) {
        setMessageType('error')
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
      
      if (authError) {
        if (authError.message.includes('rate limit')) {
          setMessageType('error')
          setMessage('❌ Terlalu banyak percobaan. Tunggu 5-10 menit atau pakai email lain.')
          setLoading(false)
          return
        }
        throw authError
      }
      
      if (!authData.user) {
        setMessageType('error')
        setMessage('❌ Gagal membuat akun. Coba lagi.')
        setLoading(false)
        return
      }
      
      const userId = authData.user.id
      
      // 2. Insert ke profiles - PAKAI 'id' BUKAN 'user_id'
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
      
      if (profileError) {
        console.error('Profile error:', profileError)
        setMessageType('error')
        setMessage('❌ Gagal menyimpan data profil: ' + profileError.message)
        setLoading(false)
        return
      }
      
      // 3. Insert ke workers
      const { error: workerError } = await supabase
        .from('workers')
        .insert([{
          user_id: userId,
          job_id: form.job_id || null,
          experience_years: parseInt(form.experience_years) || 0,
          is_available: true
        }])
      
      if (workerError) {
        console.error('Worker error:', workerError)
        setMessageType('error')
        setMessage('❌ Gagal menyimpan data pekerja: ' + workerError.message)
        setLoading(false)
        return
      }
      
      setMessageType('success')
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
      console.error('Error:', error)
      setMessageType('error')
      setMessage(`❌ ${error.message || 'Terjadi kesalahan. Coba lagi.'}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ←
          </Link>
          <div>
            <span className="text-3xl">👷</span>
            <h1 className="text-2xl font-bold text-gray-900 inline-block ml-2">Daftar Jadi Pekerja</h1>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Min. usia 17 tahun • Pria & Wanita • Bisa pilih bidang
        </p>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
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
              placeholder="Nama lengkap"
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
              placeholder="email@domain.com"
            />
            <p className="text-xs text-gray-500 mt-1">Gunakan email yang belum pernah didaftarkan</p>
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
              placeholder="Minimal 6 karakter"
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
              placeholder="08123456789"
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
            <p className="text-xs text-gray-500 mt-1">Minimal 17 tahun</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              placeholder="Alamat lengkap"
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
              placeholder="0"
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
          Sudah punya akun? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
    }
