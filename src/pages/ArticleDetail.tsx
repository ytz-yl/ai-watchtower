import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

function buildImageUrl(src: string, apiBase: string): string {
  if (!src) return ''
  if (src.startsWith('http')) return src
  if (src.startsWith('/uploads/')) return `${apiBase}${src}`
  return `${apiBase}/uploads/${src}`
}

function renderMarkdown(md: string, apiBase: string): string {
  if (!md) return ''
  let html = md

  // 图片：替换本地路径为完整URL
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => `![${alt}](${buildImageUrl(src, apiBase)})`)

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g,
    (_: string, lang: string, code: string) =>
      `<pre class="bg-black/40 border border-white/10 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm text-green-300">${esc(code.trim())}</code></pre>`)

  // 行内代码
  html = html.replace(/`([^`]+)`/g,
    '<code class="bg-black/30 text-pink-300 px-1.5 py-0.5 rounded text-sm">$1</code>')

  // 标题
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold text-gray-200 mt-8 mb-2">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-100 mt-8 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')

  // 引用块
  html = html.replace(/^> (.+)$/gm,
    '<blockquote class="border-l-4 border-primary/50 pl-4 my-4 text-gray-400 italic">$1</blockquote>')

  // 表格
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g,
    (_: string, header: string, body: string) => {
      const ths = header.split('|').filter(c => c.trim()).map(c =>
        `<th class="px-4 py-2 text-left text-xs font-medium text-gray-400 border-b border-white/10">${c.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map((row: string) =>
        '<tr>' + row.split('|').filter((c: string) => c.trim()).map((c: string) =>
          `<td class="px-4 py-2 text-sm text-gray-300 border-b border-white/5">${c.trim()}</td>`).join('') + '</tr>'
      ).join('')
      return `<div class="overflow-x-auto my-4"><table class="w-full text-sm">${ths}${rows}</table></div>`
    })

  // 无序列表
  html = html.replace(/(^- .+$\n?)+/gm,
    (block: string) => '<ul class="list-disc list-inside space-y-1 my-3 text-gray-300">' +
      block.trim().split('\n').filter(Boolean).map((l: string) => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>')

  // 粗体/斜体
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold text-white"><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-light underline hover:text-primary/80">$1</a>')

  // 分割线
  html = html.replace(/^---+$/gm, '<hr class="border-white/10 my-8" />')

  // 段落
  html = html.replace(/\n\n+/g, '</p><p class="text-gray-300 leading-relaxed my-4">')
  html = html.replace(/\n/g, '<br/>')

  return `<p class="text-gray-300 leading-relaxed my-4">${html}</p>`
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/api/articles/${id}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setArticle(d); setLoading(false) })
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

  if (!article) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">😢</p>
      <p className="text-gray-500 mb-6">文章不存在</p>
      <Link to="/knowledge" className="text-primary-light underline">← 返回博客</Link>
    </div>
  )

  const difficultyColor = DIFFICULTY_COLORS[article.difficulty] || DIFFICULTY_COLORS.intermediate
  const difficultyLabel = DIFFICULTY_LABELS[article.difficulty] || '进阶'
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category

  return (
    <div className="max-w-3xl mx-auto">
      {/* 返回 */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
        ← 返回
      </button>

      {/* 封面图 */}
      {article.coverImage && (
        <div className="rounded-2xl overflow-hidden mb-8 h-72">
          <img src={article.coverImage} alt={article.titleCn || article.title}
            className="w-full h-full object-cover" />
        </div>
      )}

      {/* 元信息 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-400">{categoryLabel}</span>
          <span className={`text-xs px-3 py-1 rounded-full ${difficultyColor}`}>{difficultyLabel}</span>
          {(article.tags||[]).map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-600">{tag}</span>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-2">
          {article.titleCn || article.title}
        </h1>
        {article.titleCn && article.title && article.title !== article.titleCn && (
          <p className="text-base text-gray-400 mb-3">{article.title}</p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          {article.author && <span>✏️ {article.author}</span>}
          {article.source && <span>📖 {article.source}</span>}
          {article.sourceUrl && (
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-primary-light underline">🔗 原文链接</a>
          )}
          <span>⏱ {article.readingTime} 分钟阅读</span>
          {article.published && <span>📅 {article.published}</span>}
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-white/10 mb-8" />

      {/* 正文 */}
      {article.content ? (
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content, API) }}
        />
      ) : (
        <p className="text-gray-400 leading-relaxed">{article.excerpt}</p>
      )}

      {/* 分割线 */}
      <div className="border-t border-white/10 mt-12 mb-8" />

      {/* 参考资料 */}
      {(article.refLinks||[]).length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">📚 参考资料</h3>
          <div className="space-y-2">
            {(article.refLinks as Array<{title:string;url:string}>).map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-light transition-colors group">
                <span className="text-gray-600">├──</span>
                <span className="group-hover:underline flex-1">{ref.title || ref.url}</span>
                <span className="text-gray-600 text-xs">→</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 相关文章 */}
      {(article.related||[]).length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">📎 相关文章</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(article.related as Array<any>).map((r: any) => (
              <Link
                key={r.id}
                to={`/article/${r.id}`}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/25 transition-all group"
              >
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-500 mb-2 inline-block">
                  {CATEGORY_LABELS[r.category] || r.category}
                </span>
                <p className="text-xs text-gray-300 leading-snug group-hover:text-white line-clamp-2">
                  {r.titleCn || r.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">⏱ {r.readingTime} 分钟</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 底部 */}
      <div className="text-center">
        <Link to="/knowledge" className="text-sm text-primary-light hover:text-primary/80 transition-colors">
          ← 返回博客
        </Link>
      </div>
    </div>
  )
}
