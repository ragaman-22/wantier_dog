import { Calendar, MapPin, ShoppingBag, Users, ArrowRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// 犬メインの写真のみ使用
const HERO_IMG = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=85'

const FEATURE_IMGS = [
  // フェス：公園で犬が集まっている
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
  // ドッグラン：芝生を走る犬
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&q=80',
  // プロフィール：かわいい犬のアップ
  'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800&q=80',
  // コミュニティ：複数の犬
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
]

const STORY_IMGS = [
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80',
  'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=200&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80',
]

const REVIEW_DOG_IMGS = [
  'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=100&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80',
  'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=100&q=80',
]

// CTA：子供がハスキー犬を抱きしめている温かいシーン
const CTA_IMG = 'https://images.unsplash.com/photo-1540411003967-af56b79be677?w=1600&q=80'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="w-full max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">WanTier</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">ログイン</button>
            <button onClick={() => navigate('/auth')} className="text-sm font-semibold px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition">
              無料登録
            </button>
          </div>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="かわいい柴犬" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-8 py-32">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-white text-sm font-medium">愛犬家コミュニティ No.1</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              愛犬との<br />
              <span className="text-orange-400">特別な毎日</span>を<br />
              シェアしよう
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              イベント・ドッグラン・ショップ情報が集まる<br />
              愛犬家のためのプラットフォーム
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/auth')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 transition shadow-xl shadow-orange-500/30">
                無料で始める <ArrowRight size={18} />
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium text-base hover:bg-white/20 transition">
                詳しく見る
              </button>
            </div>

            {/* 犬の写真アバター */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-3">
                {STORY_IMGS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">12,000+ 頭のわんこが参加中</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-orange-400 fill-orange-400" />)}
                  <span className="text-white/60 text-xs ml-1">4.9 / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 統計 */}
      <section className="py-12 px-8 bg-gray-950 text-white">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: '12,000+', label: '登録ユーザー' },
            { num: '3,500+', label: 'イベント掲載数' },
            { num: '800+', label: 'スポット情報' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-orange-400">{s.num}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 機能 */}
      <section className="py-20 px-8">
        <div className="w-full max-w-6xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold text-center mb-2 tracking-widest uppercase">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 tracking-tight">すべてが、ここに。</h2>
          <p className="text-gray-400 text-sm text-center mb-12">愛犬との毎日をサポートする機能が揃っています</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Calendar, label: 'イベント', color: 'bg-orange-500', accent: 'text-orange-400', title: '近くのドッグイベントを発見', sub: '週末の予定を愛犬と一緒に' },
              { icon: MapPin, label: 'ドッグラン', color: 'bg-green-500', accent: 'text-green-400', title: '口コミ付きスポット情報', sub: '安心して愛犬を走らせよう' },
              { icon: ShoppingBag, label: 'ショップ', color: 'bg-blue-500', accent: 'text-blue-400', title: 'ペット用品・病院を検索', sub: '信頼できるお店がすぐ見つかる' },
              { icon: Users, label: 'コミュニティ', color: 'bg-purple-500', accent: 'text-purple-400', title: '同じ犬種の仲間と交流', sub: '全国の愛犬家とつながろう' },
            ].map((f, i) => (
              <div key={i} className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
                <img
                  src={FEATURE_IMGS[i]}
                  alt={f.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center`}>
                      <f.icon size={16} className="text-white" />
                    </div>
                    <span className={`${f.accent} text-sm font-semibold`}>{f.label}</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">{f.title}</h3>
                  <p className="text-white/60 text-sm mt-1">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 口コミ */}
      <section className="py-20 px-8 bg-orange-50">
        <div className="w-full max-w-6xl mx-auto">
          <p className="text-orange-500 text-sm font-semibold text-center mb-2 tracking-widest uppercase">Reviews</p>
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">みんなの声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'しば子ママ', dog: '柴犬 2歳', text: '近所のドッグランをすぐ見つけられて最高！口コミが参考になります。毎週末の定番になりました。', img: REVIEW_DOG_IMGS[0] },
              { name: 'もちパパ', dog: 'トイプードル 4歳', text: 'イベント情報が充実していて、毎週末が楽しみになりました。同じ犬種の友達もできました！', img: REVIEW_DOG_IMGS[1] },
              { name: 'こむぎちゃん家', dog: 'ゴールデン 1歳', text: 'コミュニティで情報交換できるのが助かります。病院やショップ情報も充実していて安心。', img: REVIEW_DOG_IMGS[2] },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <img src={r.img} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-orange-200" />
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-gray-400 text-xs">{r.dog}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => <Star key={j} size={13} className="text-orange-400 fill-orange-400" />)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={CTA_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-950/75" />
        </div>
        <div className="relative w-full max-w-6xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">今すぐ愛犬と始めよう</h2>
          <p className="text-gray-400 mb-10 text-base">登録は無料、1分で完了します</p>
          <button onClick={() => navigate('/auth')} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-10 py-4 rounded-2xl transition shadow-xl shadow-orange-500/30">
            無料で登録する <ArrowRight size={18} />
          </button>
          <p className="text-gray-500 text-xs mt-4">クレジットカード不要</p>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 px-8 bg-gray-950 text-center">
        <p className="text-gray-600 text-sm mb-3">© 2024 WanTier DOG</p>
        <div className="flex justify-center gap-6 text-xs text-gray-600">
          <a href="#" className="hover:text-gray-400">利用規約</a>
          <a href="#" className="hover:text-gray-400">プライバシー</a>
          <a href="#" className="hover:text-gray-400">お問い合わせ</a>
        </div>
      </footer>

    </div>
  )
}
