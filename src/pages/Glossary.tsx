import { useState } from 'react'
import { useGlossary } from '../hooks/useApi'
import type { GlossaryItem } from '../hooks/types'

function GlossaryCard({ item }: { item: GlossaryItem }) {
  const [lang, setLang] = useState<'cn' | 'en'>('cn')
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-primary-light">{item.term}</h3>
          <span className="text-gray-500 text-sm">/</span>
          <span className="text-gray-300 text-sm">{item.termCn}</span>
        </div>
        <span className="text-gray-600 text-xs shrink-0 ml-2">{item.updated}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{lang === 'cn' ? item.definitionCn : item.definition}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setLang('cn')} className={"text-xs px-2 py-1 rounded transition-colors " + (lang==='cn' ? 'bg-primary/20 text-primary-light' : 'bg-white/5 text-gray-500')}>中文</button>
          <button onClick={() => setLang('en')} className={"text-xs px-2 py-1 rounded transition-colors " + (lang==='en' ? 'bg-primary/20 text-primary-light' : 'bg-white/5 text-gray-500')}>EN</button>
        </div>
      </div>
    </div>
  )
}

export default function Glossary() {
  const { items, loading, error } = useGlossary()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const allTags = Array.from(new Set(items.flatMap(g => g.tags)))
  const filtered = items.filter(item => {
    const matchSearch = !search || item.term.toLowerCase().includes(search.toLowerCase()) || item.termCn.includes(search) || item.definition.toLowerCase().includes(search.toLowerCase()) || item.definitionCn.includes(search)
    return matchSearch && (!activeTag || item.tags.includes(activeTag))
  })
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧠 AI 知识库</h1>
        <p className="text-gray-400">AI 核心概念与术语详解 · 中英双语 · 持续更新</p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">📖 {items.length} 个词条</span>
          <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">✏️ 手动添加中</span>
        </div>
      </div>
      <div className="mb-5">
        <input type="text" placeholder="搜索术语、关键词..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveTag(null)} className={"text-xs px-3 py-1.5 rounded-full transition-colors " + (!activeTag ? 'bg-primary text-white' : 'bg-white/5 text-gray-400')}>全部</button>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setActiveTag(activeTag===tag ? null : tag)}
            className={"text-xs px-3 py-1.5 rounded-full transition-colors " + (activeTag===tag ? 'bg-primary text-white' : 'bg-white/5 text-gray-400')}>{tag}</button>
        ))}
      </div>
      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({length:4}).map((_,i) => <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-32" />)}
      </div>}
      {error && <p className="text-red-400 text-sm">⚠ {error} — 数据服务暂不可用</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => <GlossaryCard key={item.id} item={item} />)}
        </div>
      )}
      {!loading && filtered.length === 0 && <div className="text-center py-12 text-gray-500"><p className="text-4xl mb-3">🔍</p><p>未找到匹配的词条</p></div>}
    </div>
  )
}
