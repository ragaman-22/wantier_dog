import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Calendar, MapPin, Clock, Share2, Globe, Users, Navigation, CheckCircle } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useEventById } from '../hooks/useEvents'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { haversineKm, formatDistance, getCurrentPosition } from '../lib/geo'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&q=80'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { event, loading } = useEventById(id ?? '')
  const { user } = useAuth()
  const [registered, setRegistered] = useState(false)
  const [regCount, setRegCount] = useState(0)
  const [regLoading, setRegLoading] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [dogs, setDogs] = useState<{ id: string; name: string }[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>('')
  const [showDogSelect, setShowDogSelect] = useState(false)

  // 参加登録状況・人数取得
  useEffect(() => {
    if (!id) return
    supabase.from('event_registrations').select('id', { count: 'exact' }).eq('event_id', id)
      .then(({ count }) => setRegCount(count ?? 0))
    if (user) {
      supabase.from('event_registrations').select('id').eq('event_id', id).eq('user_id', user.id).maybeSingle()
        .then(({ data }) => setRegistered(!!data))
    }
  }, [id, user])

  // 愛犬一覧取得
  useEffect(() => {
    if (!user) return
    supabase.from('dogs').select('id, name').eq('owner_id', user.id)
      .then(({ data }) => setDogs(data ?? []))
  }, [user])

  // 距離計算
  const onGetDistance = async () => {
    if (!event?.latitude || !event?.longitude) return
    setGpsLoading(true)
    try {
      const coords = await getCurrentPosition()
      const km = haversineKm(coords.lat, coords.lng, event.latitude, event.longitude)
      setDistance(km)
    } catch {}
    setGpsLoading(false)
  }

  const onShare = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: event?.title, url }) } catch {} }
    else { await navigator.clipboard.writeText(url) }
  }

  const onRegister = async () => {
    if (!user || !id) return
    if (dogs.length > 0 && !showDogSelect) { setShowDogSelect(true); return }
    setRegLoading(true)
    if (registered) {
      await supabase.from('event_registrations').delete().eq('event_id', id).eq('user_id', user.id)
      setRegistered(false)
      setRegCount((n) => Math.max(0, n - 1))
    } else {
      await supabase.from('event_registrations').insert({
        event_id: id, user_id: user.id, dog_id: selectedDogId || null
      })
      setRegistered(true)
      setRegCount((n) => n + 1)
      setShowDogSelect(false)
    }
    setRegLoading(false)
  }

  if (loading) return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    </AppShell>
  )

  if (!event) return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-4xl">🐾</p>
        <p className="text-sm text-gray-400">イベントが見つかりませんでした</p>
        <Link to="/events" className="rounded-full px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
          イベント一覧へ
        </Link>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      {/* ヒーロー画像 */}
      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <img src={event.image || FALLBACK_IMG} alt={event.title}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)' }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-5">
          <Link to="/events" className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <button onClick={onShare} className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        {/* 参加人数バッジ */}
        {regCount > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <Users className="h-3.5 w-3.5" />{regCount}人が参加予定
          </div>
        )}
      </div>

      <div className="px-5 pt-5 pb-32 space-y-4">
        {/* カテゴリ・タイトル */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
              {event.category}
            </span>
            {registered && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                <CheckCircle className="h-3 w-3" />参加予定
              </span>
            )}
          </div>
          <h1 className="text-xl font-black leading-snug text-gray-900">{event.title}</h1>
        </div>

        {/* 基本情報カード */}
        <div className="rounded-3xl p-5 space-y-4" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <InfoRow icon={<Calendar className="h-4 w-4 text-orange-400" />} label="開催日">
            {event.date}{event.end_date ? ` 〜 ${event.end_date}` : ''}
          </InfoRow>
          {event.time && (
            <InfoRow icon={<Clock className="h-4 w-4 text-orange-400" />} label="時間">
              {event.time}
            </InfoRow>
          )}
          <InfoRow icon={<MapPin className="h-4 w-4 text-orange-400" />} label="場所">
            <span>{event.location}</span>
            {event.latitude && event.longitude && (
              <button onClick={onGetDistance} disabled={gpsLoading}
                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Navigation className="h-2.5 w-2.5" />
                {gpsLoading ? '取得中...' : distance !== null ? formatDistance(distance) : '距離を確認'}
              </button>
            )}
          </InfoRow>
          {event.capacity && (
            <InfoRow icon={<Users className="h-4 w-4 text-orange-400" />} label="定員">
              {event.capacity}名{regCount > 0 && <span className="ml-2 text-orange-500 font-bold">（参加予定：{regCount}名）</span>}
            </InfoRow>
          )}
          {event.price !== undefined && event.price !== null && (
            <InfoRow icon={<span className="text-orange-400 font-bold text-sm w-4 text-center">¥</span>} label="参加費">
              {event.price === 0
                ? <span className="text-green-500 font-bold">無料</span>
                : `¥${event.price.toLocaleString()}`
              }
            </InfoRow>
          )}
        </div>

        {/* 説明 */}
        {event.description && (
          <div className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">イベント詳細</h2>
            <p className="text-sm leading-loose text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* SNS・リンク */}
        {(event.instagram || event.website) && (
          <div className="rounded-3xl p-5 space-y-3" style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">リンク</h2>
            {event.instagram && (
              <a href={`https://instagram.com/${event.instagram.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-pink-500"
                style={{ background: 'rgba(236,72,153,0.06)' }}>
                <span className="text-base font-black">@</span>
                {event.instagram.replace(/^@/, '')}
              </a>
            )}
            {event.website && (
              <a href={event.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-blue-500"
                style={{ background: 'rgba(59,130,246,0.06)' }}>
                <Globe className="h-4 w-4" />公式サイト
              </a>
            )}
          </div>
        )}
      </div>

      {/* 参加ボタン（固定） */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 z-40">
        {showDogSelect && !registered && (
          <div className="mb-3 rounded-2xl p-4 space-y-2" style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <p className="text-sm font-black text-gray-800">参加する愛犬を選んでください</p>
            <div className="space-y-1.5">
              <button onClick={() => setSelectedDogId('')}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-left transition"
                style={selectedDogId === '' ? { background: 'rgba(249,115,22,0.1)', color: '#f97316' } : { background: '#f8f7f5', color: '#374151' }}>
                愛犬なしで参加
              </button>
              {dogs.map((d) => (
                <button key={d.id} onClick={() => setSelectedDogId(d.id)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-left transition"
                  style={selectedDogId === d.id ? { background: 'rgba(249,115,22,0.1)', color: '#f97316' } : { background: '#f8f7f5', color: '#374151' }}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {user ? (
          <button onClick={onRegister} disabled={regLoading}
            className="w-full rounded-2xl py-4 text-base font-black text-white transition active:scale-95 disabled:opacity-60"
            style={registered
              ? { background: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' }
              : { background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }
            }>
            {regLoading ? '処理中...' : registered ? '参加をキャンセルする' : showDogSelect ? 'この内容で参加する' : 'このイベントに参加する'}
          </button>
        ) : (
          <Link to="/auth" className="block w-full rounded-2xl py-4 text-base font-black text-white text-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}>
            ログインして参加する
          </Link>
        )}
      </div>
    </AppShell>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 flex items-center flex-wrap gap-1">{children}</p>
      </div>
    </div>
  )
}
