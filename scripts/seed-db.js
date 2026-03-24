/**
 * scripts/seed-db.js
 * SQLite 数据管理工具
 *
 * 用法:
 *   node scripts/seed-db.js                  # 查看统计
 *   node scripts/seed-db.js add <json>      # 插入/更新一条 glossary
 *
 * 示例:
 *   node scripts/seed-db.js add '{"id":"g011","term":"SFT","termCn":"监督微调","definition":"...","definitionCn":"...","tags":["LLM","Training"],"updated":"2026-03-24"}'
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import initSqlJs from 'sql.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'watchtower.db')

async function getDb() {
  const SQL = await initSqlJs()
  return fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database()
}

function save(db) {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()))
}

async function ensureTable(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS glossary (
      id TEXT PRIMARY KEY,
      term TEXT NOT NULL, term_cn TEXT NOT NULL,
      definition TEXT NOT NULL, definition_cn TEXT NOT NULL,
      tags TEXT NOT NULL, updated TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
}

async function showStats() {
  const db = await getDb()
  await ensureTable(db)
  const tables = ['papers', 'news', 'glossary']
  for (const t of tables) {
    const r = db.exec(`SELECT COUNT(*) FROM ${t}`)
    console.log(`  ${t}: ${r[0]?.values[0]?.[0] ?? 0} 条`)
  }
  save(db)
}

async function addItem(jsonStr) {
  const item = JSON.parse(jsonStr)
  const db = await getDb()
  await ensureTable(db)
  db.run(
    `INSERT OR REPLACE INTO glossary (id,term,term_cn,definition,definition_cn,tags,updated) VALUES (?,?,?,?,?,?,?)`,
    [item.id, item.term, item.termCn, item.definition, item.definitionCn, JSON.stringify(item.tags||[]), item.updated||'']
  )
  save(db)
  console.log(`✅ 已写入: ${item.term}`)
}

async function main() {
  const [,, cmd, ...args] = process.argv

  if (cmd === 'add') {
    if (!args[0]) {
      console.error('用法: node scripts/seed-db.js add <json>')
      process.exit(1)
    }
    await addItem(args[0])
  } else {
    console.log('📊 AI Watchtower 数据库统计:')
    await showStats()
    console.log('\n用法: node scripts/seed-db.js add <json>  # 插入 glossary 条目')
  }
}

main().catch(console.error)
