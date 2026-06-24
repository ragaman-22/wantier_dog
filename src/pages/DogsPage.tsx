import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, Plus, ChevronRight, Search } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type Dog = {
  id: string
  name: string
  breed?: string
  birthday?: string
  sex?: string
  photo_url?: string
}

function calcAge(birthday?: string) {
  if (!birthday) return '年齢不明'
  const birth = new Date(birthday)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months
  if (totalMonths < 12) return `${totalMonths}ヶ月`
  return `${Math.floor(totalMonths / 12)}歳`
}

export default function DogsPage() {
  const { user } = useAuth()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDogs(data ?? [])
        setLoading(false)
      })
  }, [user])

  return (
    <AppShell>
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 px-5 pb-3 pt-5"
        style={{ background: 'rgba(248,247,245,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-orange-500" />
          <h1 className="text-lg font-black text-gray-900">愛犬プロフィール</h1>
        </div>
        <p className="mt-0.5 text-[11px] text-gray-400">WanTier DOG パスポート</p>
      </header>

      <section className="px-5 pt-4 pb-32">
        {/* 検索ショートカット */}
        <Link to="/dogs/search"
          className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Search className="h-4 w-4 text-orange-400" />
          ワン友の愛犬を探す
          <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
        </Link>

        {/* 愛犬リスト */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#e5e5e5' }} />
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl py-16 text-center"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)' }}
            >
              <PawPrint className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-sm font-bold text-gray-800">まだ愛犬が登録されていません</p>
            <p className="mt-1 text-xs text-gray-400">最初の愛犬プロフィールを作成しましょう</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {dogs.map((dog) => (
              <li key={dog.id}>
                <Link to={`/dogs/${dog.id}`}
                  className="flex items-center gap-3 rounded-2xl p-3 transition active:scale-[0.99]"
                  style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl"
                    style={{ background: 'rgba(249,115,22,0.1)' }}
                  >
                    {dog.photo_url ? (
                      <img src={dog.photo_url} alt={dog.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PawPrint className="h-7 w-7 text-orange-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900">{dog.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {dog.breed || '犬種未設定'} · {calcAge(dog.birthday)}
                      {dog.sex ? ` · ${dog.sex === 'male' ? 'オス' : 'メス'}` : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* フローティング登録ボタン */}
      <Link to="/dogs/new"
        className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
          whiteSpace: 'nowrap',
        }}
      >
        <Plus className="h-4 w-4" />愛犬を登録
      </Link>
    </AppShell>
  )
}
