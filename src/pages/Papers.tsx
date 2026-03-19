import { useState } from 'react'
import { usePapers } from '../hooks/useApi'
import type { Paper } from '../hooks/types'

const CATEGORIES = ['全部', 'LLM', 'Alignment', 'MoE', 'Open Source', 'Benchmark', 'RAG', 'Architecture', 'Safety', 'Multimodal', 'AI Agent']
const TAG_COLORS: Record<string, string> = {
  'LLM': 'bg-blue-500/20 text-blue-300', 'Alignment': 'bg-purple-500/20 text-purple-300',
  'MoE': 'bg-orange-500/20 text-orange-300', 'Open Source': 'bg-green-500/20 text-green-300',
  'Benchmark': 'bg-yellow-500/20 text-yellow-300', 'RAG': 'bg-cyan-500/20 text-cyan-300',
  'Architecture': 'bg-pink-500/20 text-pink-300', 'Safety': 'bg-red-500/20 text-red-300',
  'Multimodal': 'bg-indigo-500/20 text-indigo-300', 'Generation': 'bg-teal-500/20 text-teal-300',
  'AI Agent': 'bg-violet-500/20 text-violet-300', 'Reasoning': 'bg-amber-500/20 text-amber-300',
  'VLM': 'bg-violet-500/20 text-violet-300', 'Video': 'bg-purple-500/20 text-purple-300',
  'Code Generation': 'bg-lime-500/20 text-lime-300', 'Retrieval': 'bg-fuchsia-500/20 text-fuchsia-300',
  'Google': 'bg-blue-500/20 text-blue-300', 'Anthropic': 'bg-orange-500/20 text-orange-300',
  'DeepSeek': 'bg-cyan-500/20 text-cyan-300', 'DeepMind': 'bg-blue-500/20 text-blue-300',
  'SWE': 'bg-green-500/20 text-green-300', 'Stanford': 'bg-red-500/20 text-red-300',
  'MIT CSAIL': 'bg-gray-500/20 text-gray-300', 'Meta': 'bg-indigo-500/20 text-indigo-300',
  'Microsoft': 'bg-blue-500/20 text-blue-300', 'Alibaba': 'bg-orange-500/20 text-orange-300',
  'Multilingual': 'bg-teal-500/20 text-teal-300', 'Long Context': 'bg-sky-500/20 text-sky-300',
  'Vision': 'bg-pink-500/20 text-pink-300', 'Document AI': 'bg-teal-500/20 text-teal-300',
  'Training': 'bg-emerald-500/20 text-emerald-300', 'Fine-tuning': 'bg-amber-500/20 text-amber-300',
  'Efficiency': 'bg-sky-500/20 text-sky-300', 'Science': 'bg-violet-500/20 text-violet-300',
}

function PaperCard({ paper }: { paper: Paper }) {
  const [showCn, setShowCn] = useState(false)
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{paper.category}</span>
        <span className="text-xs text-gray-500">{paper.published}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-100 leading-snug mb-1">{showCn ? paper.titleCn : paper.title}</h3>
      <p className="text-xs text-gray-500 mb-3">
        {paper.authors.slice(0,3).join(', ')}
        <button className="ml-2 text-primary-light underline text-xs" onClick={() => setShowCn(!showCn)}>
          {showCn ? '🇨🇳 EN' : '🇺🇸 CN'}
        </button>
      </p>
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-4">{showCn ? paper.abstractCn : paper.abstract}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {paper.tags.map(tag => (
          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || 'bg-white/10 text-gray-400'}`}>{tag}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <a href={paper.url} target="_blank" rel="noopener noreferrer"
          className="text-xs bg-primary/20 text-primary-light px-3 py-1.5 rounded-lg hover:bg-primary/30 flex items-center gap-1">📄 arXiv</a>
        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1">📥 PDF</a>
      </div>
    </div>
  )
}

export default function Papers() {
  const { data, loading, error } = usePapers()
  const [filter, setFilter] = useState('全部')

  const filtered = !data ? [] : filter === '全部'
    ? data.papers
    : data.papers.filter((p: Paper) => p.tags.includes(filter))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📄 今日论文</h1>
        <p className="text-gray-400">每日从 arXiv 精选 AI 领域最新论文 · 中英双语</p>
        <div className="flex gap-2 mt-3">
          {data ? (
            <>
              <span className="text-xs bg-primary/20 text-primary-light px-3 py-1 rounded-full">🔄 {data.meta.updated} 更新</span>
              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">📚 {data.meta.count} 篇精选</span>
            </>
          ) : <span className="text-xs text-gray-500">加载中…</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter===cat ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {cat}
          </button>
        ))}
      </div>
      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({length:6}).map((_,i) => <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-48" />)}
      </div>}
      {error && <p className="text-red-400 text-sm">⚠ {error} — 数据服务暂不可用</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(paper => <PaperCard key={paper.id} paper={paper} />)}
        </div>
      )}
    </div>
  )
}
