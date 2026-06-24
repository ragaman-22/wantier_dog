import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, ImageIcon } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['フェス', 'マルシェ']

export default function EventNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    address: '',
    description: '',
    accepts_vendors: false,
    instagram: '',
    website: '',
    is_paid: false,
    price: '',
    capacity: '',
  })

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.title.trim()) { setError('イベント名を入力してください'); return }
    if (!form.category) { setError('ジャンルを選択してください'); return }
    if (!form.date) { setError('開催日を入力してください'); return }
    if (!form.location.trim()) { setError('開催場所を入力してください'); return }

    setLoading(true)
    setError('')

    let image: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `events/${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('dog-photos').upload(path, photoFile)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
        image = publicUrl
      }
    }

    const time = [form.start_time, form.end_time].filter(Boolean).join('〜') || null

    const { data, error: dbErr } = await supabase.from('events').insert({
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      end_date: form.end_date || null,
      time,
      location: form.location.trim(),
      description: form.description || null,
      instagram: form.instagram || null,
      website: form.website || null,
      price: form.is_paid ? (form.price ? parseInt(form.price) : 0) : 0,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      image,
      is_public: true,
      owner_id: user.id,
    }).select().single()

    if (dbErr) {
      setError('登録に失敗しました: ' + dbErr.message)
      setLoading(false)
      return
    }

    navigate(`/events/${data.id}`)
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4"
        style={{ background: 'rgba(248,247,245,0.92)', backdropFilter: 'blur(20px)' }}>
        <Link to="/events" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-black text-gray-900">イベントを登録</h1>
      </header>

      <form onSubmit={onSubmit} className="pb-20">

        {/* 写真 */}
        <div className="px-5 pt-6">
          <label className="cursor-pointer block">
            {photoPreview ? (
              <div className="relative aspect-[5/3] w-full overflow-hidden rounded-3xl">
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl"
                  style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Camera className="h-7 w-7" />
                    <p className="text-sm font-bold">タップして変更</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[5/3] w-full flex-col items-center justify-center gap-5 rounded-3xl"
                style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '2px dashed #e5e7eb' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl"
                  style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <ImageIcon className="h-8 w-8 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-500">イベント写真を追加</p>
                  <p className="text-sm text-gray-300 mt-1">タップしてアップロード</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
        </div>

        {/* 基本情報 */}
        <Block title="基本情報" desc="イベントの名前とジャンルを設定してください">
          <Label text="イベント名" required />
          <input value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="例：代々木わんこフェスティバル" className={iCls} />

          <div className="pt-2" />
          <Label text="ジャンル" required />
          <div className="flex gap-4">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => set('category', c)}
                className="flex-1 rounded-2xl py-5 text-base font-black transition active:scale-95"
                style={form.category === c
                  ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }>{c}</button>
            ))}
          </div>
        </Block>

        {/* 開催日時 */}
        <Block title="開催日時" desc="開催日と時間帯を入力してください">
          <Label text="開催日" required />
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={iCls} />

          <div className="pt-2" />
          <Label text="終了日（複数日開催の場合）" />
          <input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} className={iCls} />

          <div className="pt-2" />
          <Label text="開始時間" />
          <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className={iCls} />

          <div className="pt-2" />
          <Label text="終了時間" />
          <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className={iCls} />
        </Block>

        {/* 開催場所 */}
        <Block title="開催場所" desc="イベントが開催される場所を入力してください">
          <Label text="会場名" required />
          <input value={form.location} onChange={(e) => set('location', e.target.value)}
            placeholder="例：代々木公園 イベント広場" className={iCls} />

          <div className="pt-2" />
          <Label text="住所" />
          <input value={form.address} onChange={(e) => set('address', e.target.value)}
            placeholder="例：東京都渋谷区代々木神園町2-1" className={iCls} />
        </Block>

        {/* イベント紹介 */}
        <Block title="イベント紹介" desc="参加者に伝えたい内容を自由に書いてください">
          <Label text="紹介文" />
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder={'イベントの詳細、見どころ、持ち物、注意事項など'}
            rows={6} className={`${iCls} resize-none leading-relaxed`} />

          <div className="pt-2" />
          <Label text="定員（人数）" />
          <input type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
            placeholder="例：100（入力なしは制限なし）" className={iCls} />
        </Block>

        {/* 出展募集 */}
        <Block title="出展募集" desc="ブース・キッチンカーなどの出展者を募集する場合はオンにしてください">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-base font-black text-gray-800">出展者を募集する</p>
              <p className="text-sm text-gray-400 mt-1">出展ブース・キッチンカーなど</p>
            </div>
            <Toggle value={form.accepts_vendors} onChange={(v) => set('accepts_vendors', v)} />
          </div>
        </Block>

        {/* SNS・リンク */}
        <Block title="SNS・リンク" desc="公式アカウントやウェブサイトがあれば追加しましょう">
          <Label text="Instagram（アカウント名）" />
          <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)}
            placeholder="例：wantier_dog（@は不要）" className={iCls} />

          <div className="pt-2" />
          <Label text="ホームページ・URL" />
          <input value={form.website} onChange={(e) => set('website', e.target.value)}
            placeholder="例：https://wantier.jp" className={iCls} />
        </Block>

        {/* 参加費 */}
        <Block title="参加費" desc="イベントへの参加費を設定してください">
          <div className="flex gap-4 py-2">
            {[{ value: false, label: '無料' }, { value: true, label: '有料' }].map(({ value, label }) => (
              <button key={label} type="button" onClick={() => set('is_paid', value)}
                className="flex-1 rounded-2xl py-7 text-lg font-black transition active:scale-95"
                style={form.is_paid === value
                  ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }>{label}</button>
            ))}
          </div>

          {form.is_paid && (
            <div className="pt-4 space-y-4">
              <Label text="参加費（円）" />
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)}
                placeholder="例：1000" className={iCls} />
              <div className="rounded-2xl p-5" style={{ background: 'rgba(249,115,22,0.06)' }}>
                <p className="text-sm font-black text-orange-500 mb-2">オンライン決済について</p>
                <p className="text-sm text-gray-500 leading-relaxed">オンライン決済機能は近日対応予定です。現在は現地払いまたは振込でご対応ください。</p>
              </div>
            </div>
          )}
        </Block>

        {/* 送信 */}
        <div className="mt-14 px-5 pb-20 space-y-6">
          {error && (
            <p className="rounded-2xl px-5 py-4 text-sm text-red-600" style={{ background: '#fef2f2' }}>{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full rounded-2xl py-7 text-xl font-black text-white transition active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 8px 28px rgba(249,115,22,0.4)' }}>
            {loading ? '登録中...' : 'イベントを登録する'}
          </button>
          <p className="text-center text-sm text-gray-400 pb-4">登録後に内容を編集することができます</p>
        </div>
      </form>
    </AppShell>
  )
}

function Block({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 px-5">
      <h2 className="text-xl font-black mb-1"
        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {title}
      </h2>
      <p className="text-sm text-gray-400 mb-5">{desc}</p>
      <div className="rounded-3xl p-6 space-y-3"
        style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {children}
      </div>
    </div>
  )
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-sm font-black text-gray-700 mb-2">
      {text}
      {required && <span className="ml-1 text-orange-400">*</span>}
    </p>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="relative h-8 w-14 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#f97316' : '#d1d5db' }}>
      <span className="absolute top-1.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: value ? '30px' : '6px' }} />
    </button>
  )
}

const iCls = 'w-full rounded-2xl bg-gray-50 px-5 py-4 text-base text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-300'
