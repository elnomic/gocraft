'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default function BookOrder({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [job, setJob] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    address: '',
    notes: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('address')
          .eq('id', user.id)
          .single()
        
        if (profile?.address) {
          setForm(prev => ({ ...prev, address: profile.address }))
        }
      }
      
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (jobData) {
        setJob(jobData)
      }
    }
    
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      if (!form.address) {
        setError('Alamat harus diisi')
        setLoading(false)
        return
      }

      // Cari pekerja tersedia
      const { data: availableWorker } = await supabase
        .from('workers')
        .select('id')
        .eq('is_available', true)
        .order('rating', { ascending: false })
        .limit(1)

      if (!availableWorker || availableWorker.length === 0) {
        setError('Maaf, belum ada pekerja yang tersedia')
        setLoading(false)
        return
      }

      // Buat order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          worker_id: availableWorker[0].id,
          job_id: params.id,
          status: 'pending',
          price_total: job.price,
          address: form.address,
          notes: form.notes || ''
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Update status pekerja
      await supabase
        .from('workers')
        .update({ is_available: false })
        .eq('id', availableWorker[0].id)

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error: any) {
      setError(error.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">⏳</p>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h2>
          <p className="text-gray-600 mb-4">Pekerja akan segera menghubungi kamu.</p>
          <p className="text-sm text-gray-500">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/order" className="text-gray-500 hover:text-gray-700">
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Konfirmasi Pesanan</h1>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Layanan</p>
              <p className="font-semibold">{job.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Harga</p>
              <p className="font-bold text-lg text-blue-600">Rp {job.price.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">⏱️ {job.estimated_time}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat *
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan alamat lengkap kos/kontrakan"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Pintu belakang, bawa alat sendiri, dll"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
          </button>
        </form>
      </div>
    </div>
  )
            }
