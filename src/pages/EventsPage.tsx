import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, ChevronLeft, MapPin, Calendar, Navigation, Loader, Users, CheckCircle } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useEvents } from '../hooks/useEvents'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { getCurrentPosition, haversineKm, formatDistance, type Coords } from '../lib/geo'

const CATEGORIES = ['すべて', 'フェス', 'マルシェ']
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80'

export default function EventsPage() {
  const { events, loading } = useEvents()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('すべて')
  const [userCoords, setUserCoords] = useState<Coords | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [sortByDistance, setSortByDistance] = useState(false)

  // eventId -> 参加人数
  const [regCounts, setRegCounts] = useState<Record<string, number>>({})
  // eventId -> 自分が参加予定か
  const [myRegs, setMyRegs] = useState<Set<string>>(new Set())
  // 処理中のeventId
  const [toggling, setToggling] = useState<string | null>(null)

  // 参加情報を一括取得
  const fetchRegs = useCallback(async () => {
    const { data } = await supabase.from('event_registrations').select('event_id, user_id')
    if (!data) return
    const counts: Record<string, number> = {}
    const mine = new Set<string>()
    data.forEach((r) => {
      counts[r.event_id] = (counts[r.event_id] ?? 0) + 1
      if (user && r.user_id === user.id) mine.add(r.event_id)
    })
    setRegCounts(counts)
    setMyRegs(mine)
  }, [user])

  useEffect(() => { fetchRegs() }, [fetchRegs])

  const onToggle = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setToggling(eventId)
    if (myRegs.has(eventId)) {
      await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', user.id)
      setMyRegs((s) => { const n = new Set(s); n.delete(eventId); return n })
      setRegCounts((c) => ({ ...c, [eventId]: Math.max(0, (c[eventId] ?? 1) - 1) }))
    } else {
      await supabase.from('event_registrations').insert({ event_id: eventId, user_id: user.id })
      setMyRegs((s) => new Set(s).add(eventId))
      setRegCounts((c) => ({ ...c, [eventId]: (c[eventId] ?? 0) + 1 }))
    }
    setToggling(null)
  }

  const onGPS = async () => {
    setGpsLoading(true)
    setGpsError('')
    try {
      const coords = await getCurrentPosition()
      setUserCoords(coords)
      setSortByDistance(true)
    } catch {
      setGpsError('位置情報の取得に失敗しました')
    } finally {
      setGpsLoading(false)
    }
  }

  const eventsWithDistance = useMemo(() => {
    return events.map((e) => ({
      ...e,
      distanceKm: userCoords && e.latitude && e.longitude
        ? haversineKm(userCoords.lat, userCoords.lng, e.latitude, e.longitude)
        : undefined,
    }))
  }, [events, userCoords])

  const filtered = useMemo(() => {
    let list = eventsWithDistance.filter((e) => {
      const matchCat = cat === 'すべて' || e.category === cat
      const q = query.trim().toLowerCase()
      const matchQ = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
      return matchCat && matchQ
    })
    if (sortByDistance && userCoords) {
      list = [...list].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
    }
    return list
  }, [eventsWithDistance, query, cat, sortByDistance, userCoords])

  return (
    <AppShell>
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 px-5 pb-4 pt-5"
        style={{ background: 'rgba(248,247,245,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
            style={{ background: 'rgba(0,0,0,0.06)' }}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-black text-gray-900">イベント一覧</h1>

          <button onClick={onGPS} disabled={gpsLoading}
            className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 disabled:opacity-60"
            style={sortByDistance && userCoords
              ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white' }
              : { background: 'white', color: '#f97316', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
            }>
            {gpsLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
            {sortByDistance && userCoords ? '近い順' : '現在地から探す'}
          </button>
        </div>

        {gpsError && (
          <p className="mb-2 rounded-xl px-3 py-2 text-xs text-red-600" style={{ background: '#fef2f2' }}>{gpsError}</p>
        )}

        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Search className="h-4 w-4 text-orange-400 flex-shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="イベント名・場所で検索"
              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none" />
          </label>
          <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-gray-500"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className="flex-1 rounded-2xl py-3.5 text-sm font-black transition-all active:scale-95"
              style={cat === c
                ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }
                : { background: 'white', color: '#9ca3af', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
              }>{c}</button>
          ))}
        </div>
      </header>

      {/* イベントリスト */}
      <section className="px-5 pt-4 pb-32">
        <p className="mb-4 text-xs text-gray-400">
          {filtered.length}件のイベント
          {sortByDistance && userCoords && <span className="ml-1 text-orange-400">· 近い順</span>}
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl animate-pulse" style={{ background: '#e5e5e5' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl p-10 text-center text-sm text-gray-400"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            該当するイベントが見つかりませんでした
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => {
              const isReg = myRegs.has(e.id)
              const count = regCounts[e.id] ?? 0
              const isToggling = toggling === e.id
              return (
                <Link key={e.id} to={`/events/${e.id}`}
                  className="flex gap-0 overflow-hidden rounded-2xl transition active:scale-[0.99]"
                  style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                  {/* 左：画像 */}
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden">
                    <img src={e.image || FALLBACK_IMG} alt={e.title}
                      className="h-full w-full object-cover"
                      onError={(ev) => { (ev.target as HTMLImageElement).src = FALLBACK_IMG }} />
                    {e.distanceKm !== undefined && (
                      <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                        style={{ background: 'rgba(59,130,246,0.8)', backdropFilter: 'blur(4px)' }}>
                        <Navigation className="h-2.5 w-2.5" />{formatDistance(e.distanceKm)}
                      </span>
                    )}
                  </div>

                  {/* 右：情報 */}
                  <div className="flex flex-1 min-w-0 flex-col justify-between px-3 py-3">
                    {/* 上段：カテゴリ＋タイトル */}
                    <div>
                      <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black mb-1"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                        {e.category}
                      </span>
                      <p className="line-clamp-2 text-sm font-black leading-snug text-gray-900">{e.title}</p>
                    </div>

                    {/* 中段：日時・場所 */}
                    <div className="flex flex-col gap-0.5 my-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="h-3 w-3 flex-shrink-0 text-orange-300" />{e.date}{e.time && <span className="ml-1">{e.time}</span>}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin className="h-3 w-3 flex-shrink-0 text-orange-300" />
                        <span className="truncate">{e.location}</span>
                      </span>
                    </div>

                    {/* 下段：参加人数＋ボタン */}
                    <div className="flex items-center justify-between gap-2">
                      {count > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <Users className="h-3 w-3" />{count}人
                        </span>
                      ) : <span />}
                      {user ? (
                        <button
                          onClick={(ev) => onToggle(ev, e.id)}
                          disabled={isToggling}
                          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black transition active:scale-95 disabled:opacity-50 flex-shrink-0"
                          style={isReg
                            ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }
                            : { background: '#f3f4f6', color: '#9ca3af' }
                          }>
                          {isReg && <CheckCircle className="h-3 w-3" />}
                          {isToggling ? '...' : isReg ? '参加予定' : '+ 参加予定'}
                        </button>
                      ) : (
                        <Link to="/auth" onClick={(ev) => ev.stopPropagation()}
                          className="rounded-full px-3 py-1.5 text-[11px] font-black flex-shrink-0"
                          style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                          + 参加予定
                        </Link>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Link to="/events/new"
        className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 8px 24px rgba(249,115,22,0.4)', whiteSpace: 'nowrap' }}>
        <Plus className="h-4 w-4" />イベントを登録
      </Link>
    </AppShell>
  )
}
