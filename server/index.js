/**
 * AI Watchtower - Express + SQLite 后端服务
 *
 * 启动: node server/index.js
 * 环境变量:
 *   PORT=3000
 *   API_BASE_URL=http://localhost:3000  （构造图片完整URL用）
 */
import express from 'express'
import initSqlJs from 'sql.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'watchtower.db')
const UPLOADS_DIR = path.join(ROOT, 'data', 'uploads')
const PORT = process.env.PORT || 3000
const API_BASE = process.env.API_BASE_URL || `http://localhost:${PORT}`

// ── 初始化目录 & SQLite ─────────────────────────────────────────
let db

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH))
    console.log('[db] Loaded existing database')
  } else {
    db = new SQL.Database()
  }

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
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_cn TEXT NOT NULL DEFAULT '',
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '技术解析',
      difficulty TEXT NOT NULL DEFAULT 'intermediate',
      tags TEXT NOT NULL DEFAULT '[]',
      related_ids TEXT NOT NULL DEFAULT '[]',
      ref_links TEXT NOT NULL DEFAULT '[]',
      reading_time INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      published TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // 创建 uploads 目录
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    console.log('[uploads] Created uploads directory')
  }

  saveDb()
  console.log('[db] Database ready')
}

function saveDb() {
  if (!db) return
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()))
}

// ── Multer 配置 ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const hash = createHash('md5').update(Date.now() + file.originalname).digest('hex').substring(0, 12)
    cb(null, `${hash}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|jpg|gif|webp|svg\+xml)$/.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// ── 工具函数 ────────────────────────────────────────────────────
function safeJson(val, fallback) {
  try { return JSON.parse(val) } catch { return fallback }
}

function articleToObj(r) {
  return {
    id: r.id,
    title: r.title || '',
    titleCn: r.title_cn || '',
    excerpt: r.excerpt || '',
    content: r.content || '',
    coverImage: r.cover_image || '',
    author: r.author || '',
    source: r.source || '',
    sourceUrl: r.source_url || '',
    category: r.category || '技术解析',
    difficulty: r.difficulty || 'intermediate',
    tags: safeJson(r.tags, []),
    relatedIds: safeJson(r.related_ids, []),
    refLinks: safeJson(r.ref_links, []),
    readingTime: r.reading_time || 5,
    status: r.status || 'published',
    featured: !!r.featured,
    published: r.published || r.created_at || '',
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
  }
}

function relatedToObj(r) {
  return {
    id: r.id,
    title: r.title || '',
    titleCn: r.title_cn || '',
    excerpt: r.excerpt || '',
    category: r.category || '',
    readingTime: r.reading_time || 5,
    coverImage: r.cover_image || '',
  }
}

function buildArticleUrl(relativePath) {
  if (!relativePath) return ''
  if (relativePath.startsWith('http')) return relativePath
  return `${API_BASE}/uploads/${relativePath}`
}

// ── 主程序 ─────────────────────────────────────────────────────
async function main() {
  await initDb()

  const app = express()
  app.use(express.json({ limit: '10mb' })) // 支持大文章
  app.use(express.urlencoded({ extended: true }))

  // CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') return res.sendStatus(200)
    next()
  })

  // ── 上传图片 ────────────────────────────────────────────────
  app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No image file provided' })
      const url = `/uploads/${req.file.filename}`
      res.json({ ok: true, url, filename: req.file.filename })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── 列出已上传图片 ──────────────────────────────────────────
  app.get('/api/uploads', (req, res) => {
    try {
      const files = fs.readdirSync(UPLOADS_DIR).map(f => ({
        filename: f,
        url: `/uploads/${f}`,
        size: fs.statSync(path.join(UPLOADS_DIR, f)).size,
      }))
      res.json(files)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // 删除图片
  app.delete('/api/uploads/:filename', (req, res) => {
    try {
      const file = path.join(UPLOADS_DIR, req.params.filename)
      if (!file.startsWith(UPLOADS_DIR)) return res.status(403).json({ error: 'Forbidden' })
      if (fs.existsSync(file)) { fs.unlinkSync(file); return res.json({ ok: true }) }
      res.status(404).json({ error: 'File not found' })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── Articles API ───────────────────────────────────────────────
  app.get('/api/articles', (req, res) => {
    try {
      const { category, status, q, featured } = req.query
      let sql = 'SELECT id,title,title_cn,excerpt,cover_image,author,category,difficulty,tags,reading_time,status,featured,published,created_at FROM articles WHERE 1=1'
      const params = []
      if (category)  { sql += ' AND category = ?'; params.push(category) }
      if (status)    { sql += ' AND status = ?';  params.push(status) }
      if (q)         { sql += ' AND (title LIKE ? OR title_cn LIKE ? OR excerpt LIKE ?)'; const p=`%${q}%`; params.push(p,p,p) }
      if (featured)  { sql += ' AND featured = 1' }
      sql += ' ORDER BY featured DESC, created_at DESC LIMIT 100'
      const result = db.exec(sql, params)
      if (!result.length) return res.json({ items: [], meta: { count: 0 } })
      const cols = result[0].columns
      const items = result[0].values.map(row => {
        const obj = {}
        cols.forEach((c, i) => { obj[c] = row[i] })
        return articleToObj(obj)
      })
      res.json({ items, meta: { count: items.length } })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.get('/api/articles/:id', (req, res) => {
    try {
      const rows = db.exec('SELECT * FROM articles WHERE id = ?', [req.params.id])
      if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: 'Not found' })
      const cols = rows[0].columns
      const obj = {}
      rows[0].values[0].forEach((v, i) => { obj[cols[i]] = v })
      const article = articleToObj(obj)

      // 相关文章
      const related = []
      for (const rid of (article.relatedIds || [])) {
        const r = db.exec('SELECT id,title,title_cn,excerpt,category,cover_image,reading_time FROM articles WHERE id = ?', [rid])
        if (r.length && r[0].values.length) {
          const o = {}
          r[0].columns.forEach((c, i) => { o[c] = r[0].values[0][i] })
          related.push(relatedToObj(o))
        }
      }

      res.json({ ...article, related })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/articles', (req, res) => {
    try {
      const a = req.body
      if (!a.id || !a.title) return res.status(400).json({ error: 'id and title required' })
      db.run(`INSERT OR REPLACE INTO articles
        (id,title,title_cn,excerpt,content,cover_image,author,source,source_url,category,difficulty,tags,related_ids,ref_links,reading_time,status,featured,published,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
        [a.id, a.title, a.titleCn||'', a.excerpt||'', a.content||'',
         a.coverImage||'', a.author||'', a.source||'', a.sourceUrl||'',
         a.category||'技术解析', a.difficulty||'intermediate',
         JSON.stringify(a.tags||[]),
         JSON.stringify(a.relatedIds||[]),
         JSON.stringify(a.refLinks||[]),
         a.readingTime||5, a.status||'published', a.featured?1:0,
         a.published||new Date().toISOString().split('T')[0]])
      saveDb()
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.delete('/api/articles/:id', (req, res) => {
    try {
      db.run('DELETE FROM articles WHERE id = ?', [req.params.id])
      saveDb()
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // 获取所有分类及文章数量
  app.get('/api/categories', (req, res) => {
    try {
      const result = db.exec('SELECT category, COUNT(*) as count FROM articles WHERE status="published" GROUP BY category ORDER BY count DESC')
      if (!result.length) return res.json([])
      res.json(result[0].values.map(([category, count]) => ({ category, count })))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── Papers API ────────────────────────────────────────────────
  app.get('/api/papers', (req, res) => {
    try {
      const result = db.exec('SELECT * FROM papers ORDER BY published DESC LIMIT 50')
      if (!result.length) return res.json({ papers: [], meta: { updated: null, count: 0 } })
      const cols = result[0].columns
      const items = result[0].values.map(row => {
        const obj = {}
        cols.forEach((c, i) => { obj[c] = row[i] })
        // 修复 authors 字段：确保始终返回数组
        let authors = safeJson(obj.authors, [])
        if (typeof authors === 'number' || !Array.isArray(authors)) {
          authors = []
        }
        return {
          id: obj.id, title: obj.title, titleCn: obj.title_cn,
          authors,
          abstract: obj.abstract||'', abstractCn: obj.abstract_cn||'',
          category: obj.category||'cs.AI',
          tags: safeJson(obj.tags, []),
          published: obj.published||'', url: obj.url||'', pdfUrl: obj.pdf_url||'',
        }
      })
      const cnt = db.exec('SELECT COUNT(*) FROM papers')
      const upd = db.exec('SELECT MAX(published) FROM papers')
      res.json({ meta: { updated: upd[0]?.values[0]?.[0]||null, count: cnt[0]?.values[0]?.[0]||0 }, papers: items })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/papers', (req, res) => {
    try {
      const { papers } = req.body
      if (!Array.isArray(papers)) return res.status(400).json({ error: 'papers must be array' })
      const ins = db.prepare('INSERT OR REPLACE INTO papers (id,title,title_cn,authors,abstract,abstract_cn,category,tags,published,url,pdf_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      for (const p of papers) {
        ins.run([p.id, p.title, p.titleCn, JSON.stringify(p.authors), p.abstract, p.abstractCn, p.category, JSON.stringify(p.tags), p.published, p.url, p.pdfUrl])
      }
      ins.free(); saveDb()
      res.json({ ok: true, count: papers.length })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── News API ──────────────────────────────────────────────────
  app.get('/api/news', (req, res) => {
    try {
      const result = db.exec('SELECT * FROM news ORDER BY created_at DESC LIMIT 50')
      if (!result.length) return res.json({ items: [], meta: { updated: null, count: 0 } })
      const cols = result[0].columns
      const items = result[0].values.map(row => {
        const obj = {}
        cols.forEach((c, i) => { obj[c] = row[i] })
        return {
          id: obj.id, title: obj.title, titleCn: obj.title_cn,
          source: obj.source, sourceUrl: obj.source_url,
          publishedAt: obj.published_at, summary: obj.summary, summaryCn: obj.summary_cn,
          tags: safeJson(obj.tags, []), featured: !!obj.featured,
        }
      })
      const cnt = db.exec('SELECT COUNT(*) FROM news')
      const upd = db.exec('SELECT MAX(published_at) FROM news')
      res.json({ meta: { updated: upd[0]?.values[0]?.[0]||null, count: cnt[0]?.values[0]?.[0]||0 }, items })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  app.post('/api/news', (req, res) => {
    try {
      const { items } = req.body
      if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be array' })
      const ins = db.prepare('INSERT OR REPLACE INTO news (id,title,title_cn,source,source_url,published_at,summary,summary_cn,tags,featured) VALUES (?,?,?,?,?,?,?,?,?,?)')
      for (const n of items) {
        ins.run([n.id, n.title, n.titleCn, n.source, n.sourceUrl, n.publishedAt, n.summary, n.summaryCn, JSON.stringify(n.tags), n.featured?1:0])
      }
      ins.free(); saveDb()
      res.json({ ok: true, count: items.length })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── 静态文件服务 ────────────────────────────────────────────
  // 上传的图片
  app.use('/uploads', express.static(UPLOADS_DIR))

  // Vite 构建产物
  const distPath = path.join(ROOT, 'dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(distPath, 'index.html'))
      }
    })
    console.log('[server] Serving static files from dist/')
  } else {
    console.log('[server] No dist/ found, API-only mode')
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] AI Watchtower running at http://0.0.0.0:${PORT}`)
    console.log(`[server] Articles API: http://0.0.0.0:${PORT}/api/articles`)
    console.log(`[server] Uploads dir: ${UPLOADS_DIR}`)
  })
}

main().catch(console.error)
