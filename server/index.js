/**
 * AI Watchtower - Express + SQLite 后端服务
 * 同时托管 API 和前端静态文件
 * 
 * 启动: node server/index.js
 * 环境变量: PORT (默认 3000)
 */
import express from 'express'
import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'watchtower.db')
const PORT = process.env.PORT || 3000

// ── SQLite 初始化 ────────────────────────────────────────────────
let db

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH))
    console.log('[db] Loaded existing database')
  } else {
    db = new SQL.Database()
    db.run(`
      CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL, title_cn TEXT NOT NULL,
        authors TEXT NOT NULL, abstract TEXT NOT NULL, abstract_cn TEXT NOT NULL,
        category TEXT NOT NULL, tags TEXT NOT NULL,
        published TEXT NOT NULL, url TEXT NOT NULL, pdf_url TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL, title_cn TEXT NOT NULL,
        source TEXT NOT NULL, source_url TEXT NOT NULL,
        published_at TEXT NOT NULL,
        summary TEXT NOT NULL, summary_cn TEXT NOT NULL,
        tags TEXT NOT NULL, featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS glossary (
        id TEXT PRIMARY KEY,
        term TEXT NOT NULL, term_cn TEXT NOT NULL,
        definition TEXT NOT NULL, definition_cn TEXT NOT NULL,
        tags TEXT NOT NULL, updated TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
    saveDb()
    console.log('[db] Created new database')
  }
}

function saveDb() {
  if (!db) return
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// ── Express 路由 ─────────────────────────────────────────────────
function papersToObj(r) {
  return {
    id: r.id, title: r.title, titleCn: r.title_cn,
    authors: JSON.parse(r.authors), abstract: r.abstract, abstractCn: r.abstract_cn,
    category: r.category, tags: JSON.parse(r.tags),
    published: r.published, url: r.url, pdfUrl: r.pdf_url,
  }
}

function newsToObj(r) {
  return {
    id: r.id, title: r.title, titleCn: r.title_cn,
    source: r.source, sourceUrl: r.source_url,
    publishedAt: r.published_at, summary: r.summary, summaryCn: r.summary_cn,
    tags: JSON.parse(r.tags), featured: !!r.featured,
  }
}

function glossaryToObj(r) {
  return {
    id: r.id, term: r.term, termCn: r.term_cn,
    definition: r.definition, definitionCn: r.definition_cn,
    tags: JSON.parse(r.tags), updated: r.updated,
  }
}

// ── 主程序 ───────────────────────────────────────────────────────
async function main() {
  await initDb()

  const app = express()
  app.use(express.json())

  // CORS（允许前端跨域访问）
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
  })

  // ── Papers API ────────────────────────────────────────────────
  app.get('/api/papers', (req, res) => {
    try {
      const result = db.exec('SELECT id,title,title_cn,authors,abstract,abstract_cn,category,tags,published,url,pdf_url,created_at FROM papers ORDER BY created_at DESC LIMIT 50')
      if (!result.length) return res.json({ papers: [], meta: { updated: null, count: 0 } })
      const cols = result[0].columns  // ['id','title','title_cn',...]
      const items = result[0].values.map(row => {
        const obj = {}
        cols.forEach((c, i) => { obj[c] = row[i] })
        return {
          id: obj.id, title: obj.title, titleCn: obj.title_cn,
          authors: (() => { try { return JSON.parse(obj.authors) } catch { return [] } })(),
          abstract: obj.abstract || '', abstractCn: obj.abstract_cn || '',
          category: obj.category || 'cs.AI',
          tags: (() => { try { return JSON.parse(obj.tags) } catch { return [] } })(),
          published: obj.published || '', url: obj.url || '', pdfUrl: obj.pdf_url || '',
        }
      })
      const cnt = db.exec('SELECT COUNT(*) FROM papers')
      const upd = db.exec("SELECT MAX(published) FROM papers")
      res.json({ meta: { updated: upd[0]?.values[0]?.[0]||null, count: cnt[0]?.values[0]?.[0]||0 }, papers: items })
    } catch (e) {
      res.status(500).json({ error: e.message + ' | ' + e.stack?.split('\n')[1] })
    }
  })

  app.post('/api/papers', (req, res) => {
    try {
      const { papers } = req.body
      if (!Array.isArray(papers)) return res.status(400).json({ error: 'papers must be an array' })
      const insert = db.prepare('INSERT OR REPLACE INTO papers (id,title,title_cn,authors,abstract,abstract_cn,category,tags,published,url,pdf_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      for (const p of papers) {
        insert.run([p.id, p.title, p.titleCn, p.authors, p.abstract, p.abstractCn, p.category, JSON.stringify(p.tags), p.published, p.url, p.pdfUrl])
      }
      insert.free()
      saveDb()
      res.json({ ok: true, count: papers.length })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── News API ──────────────────────────────────────────────────
  app.get('/api/news', (req, res) => {
    try {
      const rows = db.exec('SELECT * FROM news ORDER BY created_at DESC LIMIT 50')
      if (!rows.length) return res.json({ items: [], meta: { updated: null, count: 0 } })
      const items = rows[0].values.map(([id,title,title_cn,source,source_url,published_at,summary,summary_cn,tags,featured]) =>
        newsToObj({ id, title, title_cn, source, source_url, published_at, summary, summary_cn, tags, featured })
      )
      const countRow = db.exec('SELECT COUNT(*) FROM news')
      const updatedRow = db.exec('SELECT MAX(published_at) FROM news')
      res.json({
        meta: { updated: updatedRow[0]?.values[0][0] || null, count: countRow[0]?.values[0][0] || 0 },
        items,
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/news', (req, res) => {
    try {
      const { items } = req.body
      if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' })
      const insert = db.prepare('INSERT OR REPLACE INTO news (id,title,title_cn,source,source_url,published_at,summary,summary_cn,tags,featured) VALUES (?,?,?,?,?,?,?,?,?,?)')
      for (const n of items) {
        insert.run([n.id, n.title, n.titleCn, n.source, n.sourceUrl, n.publishedAt, n.summary, n.summaryCn, JSON.stringify(n.tags), n.featured ? 1 : 0])
      }
      insert.free()
      saveDb()
      res.json({ ok: true, count: items.length })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── Glossary API ───────────────────────────────────────────────
  app.get('/api/glossary', (req, res) => {
    try {
      const rows = db.exec('SELECT * FROM glossary ORDER BY term ASC')
      if (!rows.length) return res.json([])
      const items = rows[0].values.map(([id,term,term_cn,definition,definition_cn,tags,updated]) =>
        glossaryToObj({ id, term, term_cn, definition, definition_cn, tags, updated })
      )
      res.json(items)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/glossary', (req, res) => {
    try {
      const item = req.body
      if (!item.id || !item.term) return res.status(400).json({ error: 'id and term required' })
      db.run('INSERT OR REPLACE INTO glossary (id,term,term_cn,definition,definition_cn,tags,updated) VALUES (?,?,?,?,?,?,?)',
        [item.id, item.term, item.termCn, item.definition, item.definitionCn, JSON.stringify(item.tags || []), item.updated || new Date().toISOString().split('T')[0]])
      saveDb()
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── 静态文件（Vite 构建产物）───────────────────────────────
  const distPath = path.join(ROOT, 'dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    // SPA fallback
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'))
      }
    })
    console.log('[server] Serving static files from dist/')
  } else {
    console.log('[server] No dist/ found, API-only mode')
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] AI Watchtower running at http://0.0.0.0:${PORT}`)
    console.log(`[server] API: http://0.0.0.0:${PORT}/api/papers`)
  })
}

main().catch(console.error)
