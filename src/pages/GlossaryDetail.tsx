import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

/** 简易 Markdown → HTML 渲染 */
function renderMarkdown(md: string): string {
  let html = md
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang: string, code: string) =>
      `<pre class="bg-black/40 border border-white/10 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm text-green-300">${escapeHtml(code.trim())}</code></pre>`)
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 text-pink-300 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // 标题
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold text-gray-200 mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-100 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    // 引用块
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 my-3 text-gray-400 italic">$1</blockquote>')
    // 表格
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_: string, header: string, body: string) => {
      const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th class="px-4 py-2 text-left text-xs font-medium text-gray-400 border-b border-white/10">${c.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map((row: string) =>
        '<tr>' + row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td class="px-4 py-2 text-sm text-gray-300 border-b border-white/5">${c.trim()}</td>`).join('') + '</tr>'
      ).join('')
      return `<div class="overflow-x-auto my-4"><table class="w-full text-sm">${ths}${rows}</table></div>`
    })
    // 无序列表
    .replace(/(^- .+$\n?)+/gm, (block: string) =>
      '<ul class="list-disc list-inside space-y-1 my-3 text-gray-300">' +
      block.trim().split('\n').filter(Boolean).map((l: string) => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>')
    // 粗体/斜体
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold text-white"><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-light underline hover:text-primary/80">$1</a>')
    // 段落
    .replace(/\n\n+/g, '</p><p class="text-gray-300 leading-relaxed my-4">')
    .replace(/\n/g, '<br/>')
  return `<p class="text-gray-300 leading-relaxed my-4">${html}</p>`
}

function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

interface GlossaryDetail {
  id: string; term: string; termCn: string
  definition: string; definitionCn: string
  tags: string[]; updated: string
  content?: string; author?: string; sourceUrl?: string; readingTime?: number
}

export default function GlossaryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<GlossaryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const API = import.meta.env.VITE_API_URL || ''
    fetch(`${API}/api/glossary/${id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setItem(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto">
      <div className="animate-pulse space-y-4 mt-8">
        <div className="h-6 bg-white/5 rounded w-32" />
        <div className="h-10 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2 mt-6" />
        <div className="h-64 bg-white/5 rounded mt-4" />
      </div>
    </div>
  )

  if (!item) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">😢</p>
      <p className="text-gray-500 mb-6">词条不存在</p>
      <Link to="/glossary" className="text-primary-light underline">← 返回术语表</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* 返回 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
        ← 返回
      </button>

      {/* 词条基本信息 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <h1 className="text-3xl font-bold text-white">{item.termCn}</h1>
          <span className="text-xl text-gray-400">{item.term}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          {item.author && <span>✏️ {item.author}</span>}
          <span>⏱ {item.readingTime || 3} 分钟阅读</span>
          {item.updated && <span>📅 {item.updated}</span>}
          {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary-light underline">📖 原文链接</a>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(item.tags||[]).map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary-light">{tag}</span>
          ))}
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-white/10 mb-8" />

      {/* 完整正文 */}
      {item.content ? (
        <article
          dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }}
        />
      ) : (
        /* 兜底：仅展示简版定义 */
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-primary-light mb-3">🇨🇳 中文定义</h3>
            <p className="text-gray-300 leading-relaxed">{item.definitionCn}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 mb-3">🇺🇸 English Definition</h3>
            <p className="text-gray-400 leading-relaxed">{item.definition}</p>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 mt-12 mb-8" />

      <div className="text-center">
        <Link to="/glossary" className="text-sm text-primary-light hover:text-primary/80 transition-colors">
          ← 返回术语表
        </Link>
      </div>
    </div>
  )
}
