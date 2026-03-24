import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlossary } from '../hooks/useApi'

export default function Glossary() {
  const { items, loading, error } = useGlossary()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(items.flatMap((g: any) => g.tags || [])))

  const filtered = items.filter((item: any) => {
    const matchSearch = !search
      || item.term.toLowerCase().includes(search.toLowerCase())
      || (item.termCn || '').includes(search)
      || (item.definitionCn || '').includes(search)
    return matchSearch && (!activeTag || (item.tags||[]).includes(activeTag))
  })

  return (
    <div>
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧠 知识库</h1>
        <p className="text-gray-400">AI 核心概念与术语详解 · 中英双语</p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">📖 {items.length} 个词条</span>
        </div>
      </div>

      {/* 搜索 */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="搜索术语、关键词…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${!activeTag ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${activeTag === tag ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-32" />
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">⚠ {error}</p>}

      {/* 词条卡片网格 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              onClick={() => navigate(`/glossary/${item.id}`)}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 hover:bg-white/[0.07] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-primary-light group-hover:text-primary">{item.term}</h3>
                  <span className="text-gray-500 text-sm">/</span>
                  <span className="text-gray-300 text-sm">{item.termCn}</span>
                </div>
                <span className="text-xs text-gray-600 shrink-0 ml-2">⏱ {item.readingTime || 3} 分钟</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4">{item.definitionCn}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {(item.tags||[]).slice(0,3).map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{tag}</span>
                  ))}
                </div>
                <span className="text-xs text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">阅读 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>未找到匹配的词条</p>
        </div>
      )}
    </div>
  )
}
