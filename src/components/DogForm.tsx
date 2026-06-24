import { useState } from 'react'
import { Globe } from 'lucide-react'

export type DogFormData = {
  name: string
  breed: string
  birthday: string
  sex: string
  weight_kg: string
  bio: string
  allergies: string
  medical_conditions: string
  emergency_notes: string
  prefecture: string
  instagram: string
  website: string
  is_public: boolean
}

const BREEDS = [
  'トイプードル', '柴犬', 'チワワ', 'ポメラニアン', 'ダックスフンド',
  'ゴールデンレトリバー', 'ラブラドールレトリバー', 'フレンチブルドッグ',
  'ビーグル', 'マルチーズ', 'ヨークシャーテリア', 'ボーダーコリー',
  'シベリアンハスキー', 'ウェルシュコーギー', 'ミニチュアシュナウザー', 'その他',
]

const PREFS = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

type Props = {
  initial?: Partial<DogFormData>
  onSubmit: (data: DogFormData) => void
  loading: boolean
  error: string
  submitLabel: string
}

export function DogForm({ initial, onSubmit, loading, error, submitLabel }: Props) {
  const [form, setForm] = useState<DogFormData>({
    name: initial?.name ?? '',
    breed: initial?.breed ?? '',
    birthday: initial?.birthday ?? '',
    sex: initial?.sex ?? '',
    weight_kg: initial?.weight_kg ?? '',
    bio: initial?.bio ?? '',
    allergies: initial?.allergies ?? '',
    medical_conditions: initial?.medical_conditions ?? '',
    emergency_notes: initial?.emergency_notes ?? '',
    prefecture: initial?.prefecture ?? '',
    instagram: initial?.instagram ?? '',
    website: initial?.website ?? '',
    is_public: initial?.is_public ?? true,
  })

  const set = (key: keyof DogFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 基本情報 */}
      <Section title="基本情報">
        <Field label="名前 *">
          <input required value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="例：ぽち" className={inputCls} />
        </Field>
        <Field label="犬種">
          <select value={form.breed} onChange={(e) => set('breed', e.target.value)} className={inputCls}>
            <option value="">選択してください</option>
            {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="生年月日">
          <input type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)} className={inputCls} />
        </Field>
        <Field label="性別">
          <div className="flex gap-3">
            {[{ value: 'male', label: 'オス' }, { value: 'female', label: 'メス' }].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set('sex', value)}
                className="flex-1 rounded-xl py-3 text-sm font-bold transition"
                style={form.sex === value
                  ? { background: 'linear-gradient(135deg, #f97316, #ec4899)', color: 'white' }
                  : { background: '#f3f4f6', color: '#9ca3af' }
                }>{label}</button>
            ))}
          </div>
        </Field>
        <Field label="体重 (kg)">
          <input type="number" step="0.1" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)}
            placeholder="例：5.2" className={inputCls} />
        </Field>
        <Field label="所在地">
          <select value={form.prefecture} onChange={(e) => set('prefecture', e.target.value)} className={inputCls}>
            <option value="">選択してください</option>
            {PREFS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="自己紹介">
          <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)}
            placeholder="愛犬の性格や好きなことを書いてみよう" rows={3}
            className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      {/* 健康情報 */}
      <Section title="健康情報">
        <Field label="アレルギー">
          <input value={form.allergies} onChange={(e) => set('allergies', e.target.value)}
            placeholder="例：鶏肉、小麦（なければ空欄）" className={inputCls} />
        </Field>
        <Field label="持病">
          <input value={form.medical_conditions} onChange={(e) => set('medical_conditions', e.target.value)}
            placeholder="例：てんかん、心臓病（なければ空欄）" className={inputCls} />
        </Field>
        <Field label="緊急時注意事項">
          <textarea value={form.emergency_notes} onChange={(e) => set('emergency_notes', e.target.value)}
            placeholder="緊急時に知っておいてほしいこと" rows={2}
            className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      {/* リンク */}
      <Section title="SNS・リンク">
        <Field label="Instagram">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
            <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)}
              placeholder="アカウント名" className={`${inputCls} pl-8`} />
          </div>
        </Field>
        <Field label="外部リンク">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={form.website} onChange={(e) => set('website', e.target.value)}
              placeholder="https://..." className={`${inputCls} pl-10`} />
          </div>
        </Field>
      </Section>

      {/* 公開設定 */}
      <Section title="公開設定">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800">プロフィールを公開する</p>
            <p className="text-xs text-gray-400">オフにすると自分以外には表示されません</p>
          </div>
          <button type="button" onClick={() => set('is_public', !form.is_public)}
            className="relative h-7 w-12 rounded-full transition-colors"
            style={{ background: form.is_public ? '#f97316' : '#d1d5db' }}>
            <span className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ left: form.is_public ? '24px' : '4px' }} />
          </button>
        </div>
      </Section>

      {error && (
        <p className="rounded-xl px-4 py-3 text-sm text-red-600" style={{ background: '#fef2f2' }}>{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full rounded-2xl py-4 text-base font-black text-white transition active:scale-95 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
        {loading ? '保存中...' : submitLabel}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-gray-500">{label}</p>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300'
