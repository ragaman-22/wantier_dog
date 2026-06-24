import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, PawPrint } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { DogForm, type DogFormData } from '../components/DogForm'

export default function DogNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: DogFormData) => {
    if (!user) return
    setLoading(true)
    setError('')

    let photo_url: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('dog-photos').upload(path, photoFile)
      if (upErr) { setError('写真のアップロードに失敗しました'); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
      photo_url = publicUrl
    }

    const { error: dbErr } = await supabase.from('dogs').insert({
      owner_id: user.id, photo_url, ...data,
      weight_kg: data.weight_kg ? parseFloat(String(data.weight_kg)) : null,
    })

    if (dbErr) { setError('登録に失敗しました: ' + dbErr.message); setLoading(false); return }
    navigate('/dogs')
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4"
        style={{ background: 'rgba(248,247,245,0.92)', backdropFilter: 'blur(20px)' }}>
        <Link to="/dogs" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-black text-gray-900">愛犬を登録</h1>
      </header>

      <div className="px-5 pt-4 pb-12">
        {/* 写真 */}
        <div className="flex flex-col items-center py-4">
          <label className="relative cursor-pointer">
            <div className="h-28 w-28 overflow-hidden rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)', boxShadow: '0 4px 16px rgba(249,115,22,0.2)' }}>
              {photoPreview
                ? <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center"><PawPrint className="h-10 w-10 text-orange-300" /></div>
              }
            </div>
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              <Camera className="h-4 w-4" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
          <p className="mt-2 text-xs text-gray-400">写真を追加</p>
        </div>

        <DogForm onSubmit={onSubmit} loading={loading} error={error} submitLabel="登録する" />
      </div>
    </AppShell>
  )
}
