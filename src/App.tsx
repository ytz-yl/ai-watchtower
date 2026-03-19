import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Papers from './pages/Papers'
import Glossary from './pages/Glossary'

function Navbar() {
  const location = useLocation()
  const links = [
    { to: '/', label: '📰 AI快讯', key: 'home' },
    { to: '/papers', label: '📄 今日论文', key: 'papers' },
    { to: '/glossary', label: '🧠 知识库', key: 'glossary' },
  ]
  return (
    <nav className="bg-surface-light border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            AI前沿瞭望台
          </Link>
          <div className="flex gap-1">
            {links.map(l => (
              <Link
                key={l.key}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' })}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #1a1040 100%)' }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/glossary" element={<Glossary />} />
          </Routes>
        </main>
        <footer className="text-center text-gray-600 text-xs py-6 border-t border-white/5">
          AI前沿瞭望台 · 数据每日自动更新 ·{" "}
          <span id="last-updated" className="text-gray-500">加载中…</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}
