import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public', 'data')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const sp = path.join(src, entry)
    const dp = path.join(dest, entry)
    fs.statSync(sp).isDirectory() ? copyDir(sp, dp) : fs.copyFileSync(sp, dp)
  }
}

for (const f of ['papers.json', 'news.json']) {
  const src = path.join(DATA_DIR, f)
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(PUBLIC_DATA_DIR, f)); console.log('Copied: ' + f) }
}
copyDir(path.join(DATA_DIR, 'glossary'), path.join(PUBLIC_DATA_DIR, 'glossary'))
console.log('Data sync done.')
