import { useState } from 'react'
import { PawPrint, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setDone(true)
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setDone(true)
      }
    } catch (err: any) {
      const msg = err.message || 'エラーが発生しました'
      if (msg.includes('Invalid login credentials')) setError('メールアドレスまたはパスワードが正しくありません')
      else if (msg.includes('Email not confirmed')) setError('メール認証が完了していません。受信箱を確認してください')
      else if (msg.includes('User already registered')) setError('このメールアドレスはすでに登録されています')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#f8f7f5' }}>

      {/* ヘッダー */}
      <div className="px-5 pt-12 pb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fb923c, #ec4899)' }}
        >
          <PawPrint className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">WanTier DOG</h1>
        <p className="mt-1 text-sm text-gray-400">愛犬家のためのコミュニティ</p>
      </div>

      {/* カード */}
      <div className="mx-auto w-full max-w-sm px-5">
        <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

          {/* 完了メッセージ */}
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl">
                ✅
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'signup' ? '確認メールを送信しました' : 'リセットメールを送信しました'}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {email} に送信したメールのリンクをクリックしてください
              </p>
              <button
                onClick={() => { setMode('login'); setDone(false) }}
                className="mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
              >
                ログイン画面に戻る
              </button>
            </div>
          ) : (
            <>
              {/* タブ（ログイン・登録） */}
              {mode !== 'reset' && (
                <div className="mb-6 flex rounded-2xl p-1" style={{ background: '#f8f7f5' }}>
                  {(['login', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setError('') }}
                      className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
                      style={mode === m
                        ? { background: 'white', color: '#f97316', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                        : { color: '#9ca3af' }
                      }
                    >
                      {m === 'login' ? 'ログイン' : '新規登録'}
                    </button>
                  ))}
                </div>
              )}

              {/* パスワードリセットタイトル */}
              {mode === 'reset' && (
                <div className="mb-6">
                  <button onClick={() => { setMode('login'); setError('') }}
                    className="mb-4 flex items-center gap-1 text-sm text-gray-400"
                  >
                    <ArrowLeft className="h-4 w-4" />戻る
                  </button>
                  <h2 className="text-lg font-black text-gray-900">パスワードをリセット</h2>
                  <p className="mt-1 text-xs text-gray-400">登録メールアドレスにリセットリンクを送ります</p>
                </div>
              )}

              {/* フォーム */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* メール */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-600">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full rounded-2xl border-0 py-3.5 pl-10 pr-4 text-sm outline-none transition"
                      style={{ background: '#f8f7f5', color: '#111' }}
                    />
                  </div>
                </div>

                {/* パスワード */}
                {mode !== 'reset' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">パスワード</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? '8文字以上' : 'パスワード'}
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                        className="w-full rounded-2xl border-0 py-3.5 pl-10 pr-12 text-sm outline-none transition"
                        style={{ background: '#f8f7f5', color: '#111' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* エラー */}
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-500">
                    {error}
                  </div>
                )}

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-4 text-sm font-black text-white transition active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  {loading ? '処理中...' : mode === 'login' ? 'ログイン' : mode === 'signup' ? '無料で登録する' : 'リセットメールを送る'}
                </button>

                {/* パスワードリセットリンク */}
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError('') }}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
                  >
                    パスワードを忘れた方はこちら
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          登録することで<a href="#" className="underline">利用規約</a>・<a href="#" className="underline">プライバシーポリシー</a>に同意します
        </p>
      </div>
    </div>
  )
}
