import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Users, User } from 'lucide-react'
import type { ReactNode } from 'react'

const navItems = [
  { to: '/', label: 'ホーム', icon: Home },
  { to: '/shop', label: 'ショップ', icon: ShoppingBag },
  { to: '/friends', label: 'ワン友', icon: Users },
  { to: '/me', label: 'マイページ', icon: User },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col" style={{ background: '#f8f7f5' }}>
      <main className="flex-1 pb-28">{children}</main>

      <footer className="mb-24 border-t border-gray-200/60 px-5 py-4 text-xs text-gray-400">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          <li><a href="#" className="hover:underline">利用規約</a></li>
          <li><a href="#" className="hover:underline">プライバシーポリシー</a></li>
          <li><a href="#" className="hover:underline">特定商取引法に基づく表記</a></li>
        </ul>
        <p className="mt-2">© WanTier DOG</p>
      </footer>

      {/* ボトムナビ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px]"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <ul className="grid grid-cols-4 px-2 pb-safe">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <li key={to}>
                <Link
                  to={to}
                  className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-all"
                  style={{ color: active ? '#f97316' : '#9ca3af' }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-xl transition-all"
                    style={active ? { background: 'rgba(249,115,22,0.12)' } : {}}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
