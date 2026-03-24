import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

const CATEGORY_LABELS: Record<string, string> = {
  '技术解析': '🔬 技术解析',
  '论文笔记': '📄 论文笔记',
  '工程实践': '⚙️ 工程实践',
  '行业观察': '🌐 行业观察',
  '术语表': '📖 术语表',
}
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:    'bg-green-500/20 text-green-300',
  intermediate:'bg-yellow-500/20 text-yellow-300',
  advanced:    'bg-red-500/20 text-red-300',
}
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner:    '入门',
  intermediate:'进阶',
  advanced:    '高级',
}

function FeaturedCard({ item }: { item: any }) {
  return (
    <div
      onClick={() => window.location.href = `/article/${item.id}`}
      className="relative rounded-2xl overflow-hidden cursor-pointer group h-64"
    >
      {item.coverImage ? (
        <img src={item.coverImage} alt={item.titleCn || item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">⭐ 精选</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">{CATEGORY_LABELS[item.category] || item.category}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
          {item.titleCn || item.title}
        </h2>
        <p className="text-sm text-gray-300 line-clamp-2">{item.excerpt}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {item.author && <span>✏️ {item.author}</span>}
          <span>⏱ {item.readingTime} 分钟</span>
        </div>
      </div>
    </div>
  )
}

function ArticleCard({ item }: { item: any }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/article/${item.id}`)}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary/40 hover:bg-white/[0.06] transition-all cursor-pointer group flex flex-col"
    >
      {item.coverImage && (
        <div className="h-36 overflow-hidden">
          <img src={item.coverImage} alt={item.titleCn || item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{CATEGORY_LABELS[item.category] || item.category}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS.intermediate}`}>
            {DIFFICULTY_LABELS[item.difficulty] || '进阶'}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-100 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
          {item.titleCn || item.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">{item.excerpt}</p>
        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          {(item.tags||[]).slice(0,3).map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-600">{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>⏱ {item.readingTime} 分钟</span>
          <span className="text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">阅读 →</span>
        </div>
      </div>
    </div>
  )
}

interface CategoryItem { category: string; count: number }

export default function Knowledge() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/articles`).then(r => r.json()),
      fetch(`${API}/api/categories`).then(r => r.json()),
    ]).then(([articlesData, cats]) => {
      setItems(articlesData.items || [])
      setCategories(cats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const featured = items.filter((a: any) => a.featured)
  const filtered = items.filter((a: any) => {
    if (activeCategory && a.category !== activeCategory) return false
    if (activeDifficulty && a.difficulty !== activeDifficulty) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(a.title||'').toLowerCase().includes(q) &&
          !(a.titleCn||'').includes(search) &&
          !(a.excerpt||'').toLowerCase().includes(q) &&
          !(a.tags||[]).some((t: string) => t.toLowerCase().includes(q))) return false
    }
    return true
  })

  const regular = filtered.filter((a: any) => !a.featured)

  return (
    <div>
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧠 技术博客</h1>
        <p className="text-gray-400">深度技术解析 · 论文笔记 · 工程实践</p>
      </div>

      {/* 搜索 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索文章标题、内容、标签…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* 分类导航 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-white/10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-4 py-2 rounded-full transition-colors ${!activeCategory ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            全部 ({items.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
              className={`text-xs px-4 py-2 rounded-full transition-colors ${activeCategory === cat.category ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {CATEGORY_LABELS[cat.category] || cat.category} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* 加载态 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl animate-pulse h-56" />
          ))}
        </div>
      )}

      {/* 精选文章 */}
      {!loading && featured.length > 0 && !activeCategory && !search && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">⭐ 精选文章</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map(item => <FeaturedCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* 全部文章 */}
      {!loading && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {activeCategory ? (CATEGORY_LABELS[activeCategory] || activeCategory) : '📚 全部文章'}
            </h2>
            <span className="text-xs text-gray-600">({filtered.length})</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-4">🔍</p>
              <p>没有找到匹配的文章</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regular.map(item => <ArticleCard key={item.id} item={item} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
