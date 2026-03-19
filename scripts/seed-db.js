/**
 * scripts/seed-db.js
 * 从 glossary/*.json 初始化 SQLite 数据库
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import initSqlJs from 'sql.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'watchtower.db')

async function main() {
  const SQL = await initSqlJs()
  const db = fs.existsSync(DB_PATH) ? new SQL.Database(fs.readFileSync(DB_PATH)) : new SQL.Database()
  
  // Ensure tables exist
  db.run(`CREATE TABLE IF NOT EXISTS papers (id TEXT PRIMARY KEY, title TEXT NOT NULL, title_cn TEXT NOT NULL, authors TEXT NOT NULL, abstract TEXT NOT NULL, abstract_cn TEXT NOT NULL, category TEXT NOT NULL, tags TEXT NOT NULL, published TEXT NOT NULL, url TEXT NOT NULL, pdf_url TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, title_cn TEXT NOT NULL, source TEXT NOT NULL, source_url TEXT NOT NULL, published_at TEXT NOT NULL, summary TEXT NOT NULL, summary_cn TEXT NOT NULL, tags TEXT NOT NULL, featured INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS glossary (id TEXT PRIMARY KEY, term TEXT NOT NULL, term_cn TEXT NOT NULL, definition TEXT NOT NULL, definition_cn TEXT NOT NULL, tags TEXT NOT NULL, updated TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`)
  
  // Seed glossary
  const glossDir = path.join(ROOT, 'data', 'glossary')
  const files = fs.readdirSync(glossDir).filter(f => f.endsWith('.json'))
  const insertGloss = db.prepare('INSERT OR REPLACE INTO glossary (id,term,term_cn,definition,definition_cn,tags,updated) VALUES (?,?,?,?,?,?,?)')
  for (const file of files) {
    const item = JSON.parse(fs.readFileSync(path.join(glossDir, file), 'utf8'))
    insertGloss.run([item.id, item.term, item.termCn, item.definition, item.definitionCn, JSON.stringify(item.tags), item.updated])
    console.log('✓', item.term)
  }
  insertGloss.free()
  
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()))
  console.log('Database seeded:', files.length, 'glossary entries')
}

main().catch(console.error)
