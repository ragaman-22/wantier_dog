import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import {
  Bell, Search, Sparkles, Flame, Navigation, MapPin, Crown,
  ChevronRight, PawPrint, LogOut, Plus, CalendarDays, Users, Store,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURED_IMG = 'https://images.unsplash.com/photo-1580230273693-c83dfa2b9bac?w=800&q=80'

const MOCK_EVENTS = [
  { id: '1', title: 'わんわんフェスタ 2024 夏', date: '2024年7月20日', location: '東京・代々木公園', img: 'https://images.unsplash.com/photo-1580230273708-4e7b8f6d63c0?w=400&q=80' },
  { id: '2', title: '柴犬まつり in 大阪', date: '2024年7月27日', location: '大阪・服部緑地', img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&q=80' },
  { id: '3', title: 'ドッグラン交流会', date: '2024年8月3日', location: '神奈川・横浜', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80' },
  { id: '4', title: 'わんこ写真撮影会', date: '2024年8月10日', location: '埼玉・さいたま市', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80' },
]

export default function Dashboard() {
  const { signOut } = useAuth()

  return (
    <AppShell>

      {/* ヘッダー */}
      <header className="sticky top-0 z-30 px-5 pb-4 pt-5"
        style={{ background: 'rgba(248,247,245,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #fb923c, #ec4899)' }}>
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-black tracking-wide text-gray-900">WanTier DOG</p>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-orange-400">ワンティエドッグ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={signOut}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500"
              style={{ background: 'rgba(0,0,0,0.05)' }}>
              <LogOut className="h-4 w-4" />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500"
              style={{ background: 'rgba(0,0,0,0.05)' }}>
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ブランドカード */}
      <section className="px-5 pt-5">
        <div className="overflow-hidden rounded-3xl p-7 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(236,72,153,0.08) 100%)',
            border: '1px solid rgba(251,146,60,0.2)',
          }}>
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest text-orange-500">
            <PawPrint className="h-3.5 w-3.5" />犬と人、人と人をつなぐコミュニティ
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-gray-900">WanTier DOG</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            犬との出会い、人との出会いをもっと身近に。<br />
            愛犬家がつながる、日本最大級の犬コミュニティへ。
          </p>
        </div>
      </section>

      {/* 検索バー */}
      <section className="px-5 pt-5">
        <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left transition"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Search className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <span className="text-sm text-gray-400">イベントを検索（地域・カテゴリ）</span>
        </button>
      </section>

      {/* クイックアクション */}
      <section className="px-5 pt-6">
        <p className="text-xs font-black text-gray-400 mb-4 tracking-widest">メニュー</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { to: '/events', icon: CalendarDays, label: 'イベントを探す', grad: 'linear-gradient(135deg, #fb923c, #ec4899)' },
            { to: '/dogs', icon: PawPrint, label: '愛犬プロフィール', grad: 'linear-gradient(135deg, #f97316, #ea580c)' },
            { to: '/shops', icon: Store, label: '店舗', grad: 'linear-gradient(135deg, #fb923c88, #ec489988)' },
          ].map(({ to, icon: Icon, label, grad }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-3 rounded-3xl py-5 px-2 text-center transition active:scale-95"
              style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                style={{ background: grad, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-black leading-tight text-gray-800">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 広告バナー枠（将来の企業バナー用） */}
      <section className="px-5 pt-8">
        <div className="overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #f3f4f6, #e9eaec)', minHeight: '100px' }}>
          <div className="flex h-24 items-center justify-center">
            <p className="text-xs font-bold text-gray-400 tracking-widest">AD</p>
          </div>
        </div>
      </section>

      {/* 今週のおすすめ */}
      <section className="mt-10 px-5">
        <div className="mb-5 flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-black text-gray-900">今週のおすすめ</h2>
        </div>
        <Link to="/events/1" className="block overflow-hidden rounded-3xl transition active:scale-[0.98]"
          style={{ boxShadow: '0 8px 32px rgba(249,115,22,0.2)' }}>
          <div className="relative">
            <img src={FEATURED_IMG} alt={MOCK_EVENTS[0].title} className="h-56 w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
            <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-black tracking-wider text-orange-500"
              style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
              FEATURED · 今週のPICK
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-lg font-black text-white">{MOCK_EVENTS[0].title}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/75">
                <span>{MOCK_EVENTS[0].date}</span>
                <span className="opacity-40">·</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{MOCK_EVENTS[0].location}</span>
              </p>
            </div>
          </div>
          <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
            <p className="text-sm font-bold text-white/90">詳細を見る →</p>
          </div>
        </Link>
      </section>

      {/* 近くのイベント */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between px-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
            <Navigation className="h-5 w-5 text-orange-500" />近くのイベント
          </h3>
          <Link to="/events" className="flex items-center gap-0.5 text-sm font-bold text-orange-500">
            すべて見る<ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_EVENTS.map((e) => (
            <Link key={e.id} to={`/events/${e.id}`}
              className="w-48 flex-shrink-0 overflow-hidden rounded-3xl transition active:scale-95"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}>
              <div className="relative">
                <img src={e.img} alt={e.title} className="h-32 w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-black leading-snug text-gray-800">{e.title}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-orange-300" />{e.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 広告バナー枠2 */}
      <section className="px-5 pt-8">
        <div className="overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #f3f4f6, #e9eaec)', minHeight: '100px' }}>
          <div className="flex h-24 items-center justify-center">
            <p className="text-xs font-bold text-gray-400 tracking-widest">AD</p>
          </div>
        </div>
      </section>

      {/* 人気イベント */}
      <section className="mt-10 px-5">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-gray-900">
          <Flame className="h-5 w-5 text-orange-500" />人気イベント
        </h3>
        <div className="space-y-4">
          {MOCK_EVENTS.slice(1).map((e) => (
            <Link key={e.id} to={`/events/${e.id}`}
              className="flex gap-4 overflow-hidden rounded-2xl transition active:scale-[0.99]"
              style={{ background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <img src={e.img} alt={e.title} className="h-24 w-24 flex-shrink-0 object-cover" />
              <div className="flex flex-col justify-center py-3 pr-4">
                <p className="line-clamp-2 text-sm font-black leading-snug text-gray-800">{e.title}</p>
                <p className="mt-2 text-xs text-gray-400">{e.date}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-orange-300" />{e.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ブランドフッター */}
      <section className="mt-12 px-5 pb-10">
        <div className="rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,146,60,0.1), rgba(236,72,153,0.06))',
            border: '1px solid rgba(251,146,60,0.15)',
          }}>
          <Sparkles className="mx-auto h-5 w-5 text-orange-400" />
          <p className="mt-3 text-base font-black text-gray-900">愛犬家がつながる、日本最大級の犬コミュニティへ。</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            イベント・愛犬プロフィール・QRコード・ワン友検索で<br />
            全国の愛犬家をつなぐ。それが WanTier DOG のミッションです。
          </p>
        </div>
      </section>

      {/* フローティングCTA */}
      <Link to="/events/new"
        className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          whiteSpace: 'nowrap',
        }}>
        <Plus className="h-4 w-4" />イベントを登録
      </Link>

    </AppShell>
  )
}
