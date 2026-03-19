import { useState } from 'react'
import { useNews } from '../hooks/useApi'
import type { NewsItem } from '../hooks/types'

function NewsCard({ item }: { item: NewsItem }) {
  const [showCn, setShowCn] = useState(false)
  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition-all cursor-pointer"
      onClick={() => setShowCn(!showCn)}
    >
      {item.featured && (
        <span className="inline-block text-xs font-bold text-yellow-400 mb-2 bg-yellow-400/10 px-2 py-0.5 rounded">⭐ 重点关注</span>
      )}
      <h3 className="text-base font-semibold text-gray-100 leading-snug mb-1">
        {showCn ? item.titleCn : item.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
        <span>{item.source}</span><span>·</span><span>{item.publishedAt}</span>
        <button className="ml-auto text-primary-light underline text-xs">{showCn ? '🇺🇸 English' : '🇨🇳 中文'}</button>
      </p>
      <p className="text-sm text-gray-400 leading-relaxed">{showCn ? item.summaryCn : item.summary}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </div>
  )
}

export default function Home() {
  const { data, loading, error } = useNews()
  const featured = data?.items.filter((n: NewsItem) => n.featured) ?? []
  const rest = data?.items.filter((n: NewsItem) => !n.featured) ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📰 AI 快讯</h1>
        <p className="text-gray-400">追踪人工智能领域最新动态 · 每日自动更新</p>
        <div className="flex gap-2 mt-3">
          {data ? (
            <>
              <span className="text-xs bg-primary/20 text-primary-light px-3 py-1 rounded-full">🔄 {data.meta.updated} 更新</span>
              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">🟢 共 {data.meta.count} 条资讯</span>
            </>
          ) : <span className="text-xs text-gray-500">加载中…</span>}
        </div>
      </div>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length:6}).map((_,i) => <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-40" />)}
      </div>}

      {error && <p className="text-red-400 text-sm">⚠ {error} — 数据服务暂不可用</p>}

      {!loading && !error && data && (
        <>
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">⭐ 重点关注</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((item: NewsItem) => <NewsCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">📡 最新资讯</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((item: NewsItem) => <NewsCard key={item.id} item={item} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
