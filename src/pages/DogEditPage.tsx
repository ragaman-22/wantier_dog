import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, PawPrint } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { DogForm, type DogFormData } from '../components/DogForm'

export default function DogEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dog, setDog] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.from('dogs').select('*').eq('id', id).single()
      .then(({ data }) => { setDog(data); setFetching(false) })
  }, [id])

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: DogFormData) => {
    if (!user || !id) return
    setLoading(true)
    setError('')

    let photo_url = dog?.photo_url ?? null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('dog-photos').upload(path, photoFile)
      if (upErr) { setError('写真のアップロードに失敗しました'); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
      photo_url = publicUrl
    }

    const { error: dbErr } = await supabase.from('dogs').update({
      photo_url, ...data,
      weight_kg: data.weight_kg ? parseFloat(String(data.weight_kg)) : null,
    }).eq('id', id)

    if (dbErr) { setError('更新に失敗しました: ' + dbErr.message); setLoading(false); return }
    navigate(`/dogs/${id}`)
  }

  if (fetching) return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    </AppShell>
  )

  const currentPhoto = photoPreview ?? dog?.photo_url

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4"
        style={{ background: 'rgba(248,247,245,0.92)', backdropFilter: 'blur(20px)' }}>
        <Link to={`/dogs/${id}`} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-black text-gray-900">プロフィールを編集</h1>
      </header>

      <div className="px-5 pt-4 pb-12">
        {/* 写真 */}
        <div className="flex flex-col items-center py-4">
          <label className="relative cursor-pointer">
            <div className="h-28 w-28 overflow-hidden rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)', boxShadow: '0 4px 16px rgba(249,115,22,0.2)' }}>
              {currentPhoto
                ? <img src={currentPhoto} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center"><PawPrint className="h-10 w-10 text-orange-300" /></div>
              }
            </div>
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              <Camera className="h-4 w-4" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
          <p className="mt-2 text-xs text-gray-400">写真を変更</p>
        </div>

        {dog && (
          <DogForm
            initial={{
              name: dog.name ?? '',
              breed: dog.breed ?? '',
              birthday: dog.birthday ?? '',
              sex: dog.sex ?? '',
              weight_kg: dog.weight_kg ? String(dog.weight_kg) : '',
              bio: dog.bio ?? '',
              allergies: dog.allergies ?? '',
              medical_conditions: dog.medical_conditions ?? '',
              emergency_notes: dog.emergency_notes ?? '',
              prefecture: dog.prefecture ?? '',
              instagram: dog.instagram ?? '',
              website: dog.website ?? '',
              is_public: dog.is_public ?? true,
            }}
            onSubmit={onSubmit}
            loading={loading}
            error={error}
            submitLabel="保存する"
          />
        )}
      </div>
    </AppShell>
  )
}
