#!/usr/bin/env node
/**
 * update-data.js
 * AI 前沿瞭望台 - 每日数据更新脚本
 * 
 * 用法: node scripts/update-data.js
 * 用途:
 *   - 将 /data/ 下的源数据同步到 /public/data/（前台运行时读取）
 *   - 更新元信息（updated 时间、论文数量）
 *   - 提交 git（可选）
 * 
 * 实际的数据抓取逻辑由调用方（cron agent）完成，
 * 此脚本负责数据文件的整理和构建触发。
 */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'data')
const PUBLIC_DIR = path.join(ROOT, 'public', 'data')

function ensurePublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  }
}

function syncJsonFile(filename) {
  const src = path.join(DATA_DIR, filename)
  const dest = path.join(PUBLIC_DIR, filename)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`✓ Synced ${filename}`)
  } else {
    console.warn(`✗ Source not found: ${src}`)
  }
}

function updateMeta() {
  // Papers metadata
  const papersFile = path.join(DATA_DIR, 'papers.json')
  if (fs.existsSync(papersFile)) {
    const papers = JSON.parse(fs.readFileSync(papersFile, 'utf-8'))
    papers.meta = {
      updated: new Date().toISOString().split('T')[0],
      count: papers.papers?.length || 0,
      note: '每日自动从 ArXiv 抓取更新，也可手动添加条目'
    }
    fs.writeFileSync(papersFile, JSON.stringify(papers, null, 2))
  }

  // News metadata
  const newsFile = path.join(DATA_DIR, 'news.json')
  if (fs.existsSync(newsFile)) {
    const news = JSON.parse(fs.readFileSync(newsFile, 'utf-8'))
    news.meta = {
      updated: new Date().toISOString().split('T')[0],
      count: news.items?.length || 0,
      note: '每日自动抓取更新，也可手动添加条目'
    }
    fs.writeFileSync(newsFile, JSON.stringify(news, null, 2))
  }
}

function copyGlossaryToPublic() {
  const srcDir = path.join(DATA_DIR, 'glossary')
  const destDir = path.join(PUBLIC_DIR, 'glossary')
  if (!fs.existsSync(srcDir)) return

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'))
  const entries = files.map(f => {
    const content = JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf-8'))
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f))
    return content
  })

  // Also write a combined index
  fs.writeFileSync(path.join(PUBLIC_DIR, 'glossary-index.json'), JSON.stringify(entries, null, 2))
  console.log(`✓ Synced ${files.length} glossary entries`)
}

function getStats() {
  try {
    const papers = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'papers.json'), 'utf-8'))
    const news = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'news.json'), 'utf-8'))
    const glossaryCount = fs.readdirSync(path.join(DATA_DIR, 'glossary')).filter(f => f.endsWith('.json')).length
    return {
      papers: papers.papers?.length || 0,
      news: news.items?.length || 0,
      glossary: glossaryCount
    }
  } catch {
    return { papers: 0, news: 0, glossary: 0 }
  }
}

async function main() {
  console.log('=== AI Watchtower Data Update ===')
  console.log(`Time: ${new Date().toISOString()}`)

  ensurePublicDir()
  updateMeta()
  syncJsonFile('papers.json')
  syncJsonFile('news.json')
  copyGlossaryToPublic()

  const stats = getStats()
  console.log(`\nStats: ${stats.papers} papers, ${stats.news} news, ${stats.glossary} glossary terms`)
  console.log('\nData synced to public/. Build to deploy.')
}

main().catch(console.error)
