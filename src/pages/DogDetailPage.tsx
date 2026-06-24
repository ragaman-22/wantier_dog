import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, PawPrint, Share2, Pencil, Trash2, QrCode, Plus, ShieldCheck, AlertTriangle, X, Globe, Camera, ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type Dog = {
  id: string
  owner_id: string
  name: string
  breed?: string
  birthday?: string
  sex?: string
  weight_kg?: number
  bio?: string
  photo_url?: string
  allergies?: string
  medical_conditions?: string
  emergency_notes?: string
  prefecture?: string
  instagram?: string
  website?: string
  is_public?: boolean
}

type Vaccination = {
  id: string
  vaccine_name: string
  vaccinated_at: string
  next_due_at?: string
  memo?: string
  photo_url?: string
}

function calcAge(birthday?: string) {
  if (!birthday) return '年齢不明'
  const birth = new Date(birthday)
  const now = new Date()
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (totalMonths < 12) return `${totalMonths}ヶ月`
  return `${Math.floor(totalMonths / 12)}歳`
}

export default function DogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dog, setDog] = useState<Dog | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showVaccine, setShowVaccine] = useState(false)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [showVaccineForm, setShowVaccineForm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  type VaccineRow = { vaccine_name: string; vaccinated_at: string; next_due_at: string; memo: string; photo: File | null; preview: string | null }
  const emptyRow = (): VaccineRow => ({ vaccine_name: '', vaccinated_at: '', next_due_at: '', memo: '', photo: null, preview: null })
  const [vaccineRows, setVaccineRows] = useState<VaccineRow[]>([emptyRow(), emptyRow(), emptyRow()])
  const [vaccineLoading, setVaccineLoading] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase.from('dogs').select('*').eq('id', id).single()
      .then(({ data }) => { setDog(data); setLoading(false) })
  }, [id])

  const isOwner = !!user && dog?.owner_id === user.id

  useEffect(() => {
    if (!isOwner || !id || !showVaccine) return
    supabase.from('dog_vaccinations').select('*').eq('dog_id', id).order('vaccinated_at', { ascending: false })
      .then(({ data }) => setVaccinations(data ?? []))
  }, [isOwner, id, showVaccine])

  const onShare = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: dog?.name, url }) } catch {} }
    else { await navigator.clipboard.writeText(url) }
  }

  const onDelete = async () => {
    if (!dog || !confirm(`${dog.name}を削除しますか？`)) return
    setDeleting(true)
    await supabase.from('dogs').delete().eq('id', dog.id)
    navigate('/dogs')
  }

  const updateRow = (i: number, key: keyof VaccineRow, value: string | File | null) =>
    setVaccineRows((rows) => rows.map((r, idx) => idx === i ? { ...r, [key]: value } : r))

  const onRowPhoto = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    updateRow(i, 'photo', file)
    updateRow(i, 'preview', URL.createObjectURL(file))
  }

  const onAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return
    const filled = vaccineRows.filter((r) => r.vaccine_name.trim() && r.vaccinated_at)
    if (filled.length === 0) return
    setVaccineLoading(true)

    const inserted: Vaccination[] = []
    for (const row of filled) {
      let photo_url: string | null = null
      if (row.photo) {
        const ext = row.photo.name.split('.').pop()
        const path = `${user.id}/vaccines/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('dog-photos').upload(path, row.photo)
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(path)
          photo_url = publicUrl
        }
      }
      const { data } = await supabase.from('dog_vaccinations').insert({
        dog_id: id, owner_id: user.id,
        vaccine_name: row.vaccine_name.trim(),
        vaccinated_at: row.vaccinated_at,
        next_due_at: row.next_due_at || null,
        memo: row.memo || null,
        photo_url,
      }).select().single()
      if (data) inserted.push(data)
    }

    setVaccinations((prev) => [...inserted.reverse(), ...prev])
    setVaccineRows([emptyRow(), emptyRow(), emptyRow()])
    setShowVaccineForm(false)
    setVaccineLoading(false)
  }

  const onDeleteVaccine = async (vid: string) => {
    await supabase.from('dog_vaccinations').delete().eq('id', vid)
    setVaccinations((prev) => prev.filter((v) => v.id !== vid))
  }

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/dogs/${id}` : ''

  if (loading) return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    </AppShell>
  )

  if (!dog) return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <PawPrint className="h-12 w-12 text-orange-300" />
        <p className="text-sm text-gray-400">愛犬が見つかりませんでした</p>
        <Link to="/dogs" className="rounded-full px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>一覧へ戻る</Link>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      {/* ヒーロー画像 - 大きめに */}
      <div className="relative">
        <div className="h-72 w-full overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.15))' }}>
          {dog.photo_url
            ? <img src={dog.photo_url} alt={dog.name} className="h-full w-full object-cover" />
            : <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                <PawPrint className="h-24 w-24 text-orange-200" />
                <p className="text-sm text-orange-300">写真を追加してみよう</p>
              </div>
          }
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 45%,rgba(0,0,0,0.2) 100%)' }} />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-5">
          <Link to="/dogs" className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
          {!dog.is_public && (
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: 'rgba(0,0,0,0.4)' }}>非公開</span>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-5 pb-16 space-y-5">

        {/* 名前カード */}
        <div className="rounded-3xl p-6 text-center -mt-6 relative z-10"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{dog.name}</h1>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            {[dog.breed, dog.prefecture].filter(Boolean).join(' · ') || '犬種未設定'}
          </p>
          {(dog.birthday || dog.sex || dog.weight_kg) && (
            <div className="mt-5 flex justify-center gap-3 pt-5 border-t border-gray-100">
              {dog.birthday && <StatCard label="年齢" value={calcAge(dog.birthday)} color="#fff7ed" accent="#f97316" />}
              {dog.sex && <StatCard label="性別" value={dog.sex === 'male' ? 'オス' : 'メス'} color="#fdf2f8" accent="#ec4899" />}
              {dog.weight_kg && <StatCard label="体重" value={`${dog.weight_kg}kg`} color="#f0fdf4" accent="#22c55e" />}
            </div>
          )}
        </div>

        {/* 自己紹介 */}
        {dog.bio && (
          <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">自己紹介</p>
            <p className="text-sm leading-loose text-gray-700">{dog.bio}</p>
          </div>
        )}

        {/* 健康情報 */}
        {(dog.allergies || dog.medical_conditions || dog.emergency_notes) && (
          <div className="rounded-3xl p-6 space-y-5"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 text-amber-400" />健康情報
            </p>
            {dog.allergies && <InfoRow label="アレルギー" value={dog.allergies} />}
            {dog.medical_conditions && <InfoRow label="持病" value={dog.medical_conditions} />}
            {dog.emergency_notes && <InfoRow label="緊急時注意事項" value={dog.emergency_notes} />}
          </div>
        )}

        {/* SNS・リンク */}
        {(dog.instagram || dog.website) && (
          <div className="rounded-3xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">SNS・リンク</p>
            {dog.instagram && (
              <a href={`https://instagram.com/${dog.instagram.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-pink-500 transition active:scale-95"
                style={{ background: 'rgba(236,72,153,0.06)' }}>
                <span className="text-lg font-black">@</span>
                {dog.instagram.replace(/^@/, '')}
              </a>
            )}
            {dog.website && (
              <a href={dog.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-blue-500 transition active:scale-95"
                style={{ background: 'rgba(59,130,246,0.06)' }}>
                <Globe className="h-4 w-4" />公式サイト
              </a>
            )}
          </div>
        )}

        {/* アクションアイコン（オーナーのみ） */}
        {isOwner && (
          <div className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div className="flex justify-around items-center">
              <IconBtn icon={<QrCode className="h-5 w-5" />} label="QRコード" color="#f97316" bg="#fff7ed" onClick={() => setShowQR(true)} />
              <IconBtn icon={<Share2 className="h-5 w-5" />} label="共有" color="#3b82f6" bg="#eff6ff" onClick={onShare} />
              <Link to={`/dogs/${dog.id}/edit`} className="flex flex-col items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-90"
                  style={{ background: '#f3f4f6', color: '#6b7280' }}>
                  <Pencil className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold text-gray-400">編集</span>
              </Link>
              <IconBtn icon={<ShieldCheck className="h-5 w-5" />} label="ワクチン" color="#22c55e" bg="#f0fdf4" onClick={() => setShowVaccine(true)} />
              <IconBtn icon={<Trash2 className="h-5 w-5" />} label="削除" color="#ef4444" bg="#fef2f2" onClick={onDelete} disabled={deleting} />
            </div>
          </div>
        )}
      </div>

      {/* QRモーダル */}
      {showQR && (
        <Modal onClose={() => setShowQR(false)}>
          <div className="mb-1 flex h-12 w-12 mx-auto items-center justify-center rounded-full"
            style={{ background: 'rgba(249,115,22,0.1)' }}>
            <QrCode className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="text-base font-black text-gray-900 mb-0.5">{dog.name}</h2>
          <p className="text-xs text-gray-400 mb-4">愛犬QRコード</p>
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl p-3" style={{ background: '#f8f7f5' }}>
              <QRCodeSVG value={qrUrl} size={180} fgColor="#1f2937" bgColor="#f8f7f5" level="M" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mb-4">イベント参加時にこのQRコードを提示してください</p>
          <button onClick={() => setShowQR(false)} className="w-full rounded-2xl py-3 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>閉じる</button>
        </Modal>
      )}

      {/* 写真フルスクリーン */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setViewingPhoto(null)}>
          <button className="absolute top-5 right-5 text-white" onClick={() => setViewingPhoto(null)}>
            <X className="h-6 w-6" />
          </button>
          <img src={viewingPhoto} alt="接種証明" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
        </div>
      )}

      {/* ワクチン管理モーダル（オーナーのみ） */}
      {showVaccine && isOwner && (
        <Modal onClose={() => { setShowVaccine(false); setShowVaccineForm(false) }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-gray-900">ワクチン記録</h2>
            <button onClick={() => { setShowVaccine(false); setShowVaccineForm(false) }}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
            {vaccinations.length === 0 && !showVaccineForm && (
              <p className="text-center text-sm text-gray-400 py-4">記録がありません</p>
            )}
            {vaccinations.map((v) => (
              <div key={v.id} className="rounded-xl p-3 space-y-2" style={{ background: '#f8f7f5' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{v.vaccine_name}</p>
                    <p className="text-xs text-gray-400">接種日：{v.vaccinated_at}</p>
                    {v.next_due_at && <p className="text-xs text-orange-500">次回：{v.next_due_at}</p>}
                    {v.memo && <p className="text-xs text-gray-500 mt-0.5">{v.memo}</p>}
                  </div>
                  <button onClick={() => onDeleteVaccine(v.id)} className="text-gray-300 hover:text-red-400 ml-2 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {v.photo_url && (
                  <button onClick={() => setViewingPhoto(v.photo_url!)} className="w-full">
                    <img src={v.photo_url} alt="接種証明" className="w-full h-32 object-cover rounded-lg" />
                    <p className="text-[10px] text-gray-400 mt-1 text-left">接種証明書（タップで拡大）</p>
                  </button>
                )}
              </div>
            ))}
          </div>

          {showVaccineForm ? (
            <form onSubmit={onAddVaccine} className="space-y-3">
              <p className="text-xs text-gray-400">入力した項目をまとめて保存します</p>
              {vaccineRows.map((row, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: '#f8f7f5' }}>
                  <p className="text-xs font-black text-gray-500">ワクチン {i + 1}</p>
                  <input value={row.vaccine_name}
                    onChange={(e) => updateRow(i, 'vaccine_name', e.target.value)}
                    placeholder="ワクチン名（例：狂犬病）" className={iCls} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">接種日</p>
                      <input type="date" value={row.vaccinated_at}
                        onChange={(e) => updateRow(i, 'vaccinated_at', e.target.value)} className={iCls} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">次回予定日</p>
                      <input type="date" value={row.next_due_at}
                        onChange={(e) => updateRow(i, 'next_due_at', e.target.value)} className={iCls} />
                    </div>
                  </div>
                  <input value={row.memo} onChange={(e) => updateRow(i, 'memo', e.target.value)}
                    placeholder="メモ（任意）" className={iCls} />
                  <label className="cursor-pointer block">
                    {row.preview ? (
                      <div className="relative">
                        <img src={row.preview} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg"
                          style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <p className="text-white text-xs font-bold">タップして変更</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-lg py-3"
                        style={{ border: '2px dashed #d1d5db' }}>
                        <Camera className="h-4 w-4 text-gray-400" />
                        <p className="text-xs text-gray-400">接種証明書の写真（任意）</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onRowPhoto(i, e)} />
                  </label>
                </div>
              ))}

              <button type="button"
                onClick={() => setVaccineRows((r) => [...r, emptyRow()])}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-orange-500"
                style={{ border: '2px dashed rgba(249,115,22,0.3)' }}>
                <Plus className="h-3.5 w-3.5" />項目を追加
              </button>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowVaccineForm(false); setVaccineRows([emptyRow(), emptyRow(), emptyRow()]) }}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-gray-500" style={{ background: '#f3f4f6' }}>
                  キャンセル
                </button>
                <button type="submit" disabled={vaccineLoading}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
                  {vaccineLoading ? '保存中...' : 'まとめて保存'}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowVaccineForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-orange-500"
              style={{ background: 'rgba(249,115,22,0.08)' }}>
              <Plus className="h-4 w-4" />記録を追加
            </button>
          )}
        </Modal>
      )}
    </AppShell>
  )
}

function StatCard({ label, value, color, accent }: { label: string; value: string; color: string; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl px-4 py-3 min-w-[72px]"
      style={{ background: color, border: `1.5px solid ${accent}22` }}>
      <p className="text-base font-black" style={{ color: accent }}>{value}</p>
      <p className="text-[11px] font-bold text-gray-400">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm leading-relaxed text-gray-700">{value}</p>
    </div>
  )
}

function IconBtn({ icon, label, color, bg, onClick, disabled }: {
  icon: React.ReactNode; label: string; color: string; bg: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex flex-col items-center gap-2 disabled:opacity-40">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-90"
        style={{ background: bg, color }}>
        {icon}
      </span>
      <span className="text-[11px] font-bold text-gray-400">{label}</span>
    </button>
  )
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-6"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center"
        style={{ background: 'white' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const iCls = 'w-full rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300'
