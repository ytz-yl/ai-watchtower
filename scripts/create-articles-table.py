import sqlite3
conn = sqlite3.connect('/workspace/ai-watchtower/data/watchtower.db')
conn.execute('''CREATE TABLE IF NOT EXISTS articles (
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
  status TEXT NOT NULL DEFAULT "published",
  featured INTEGER NOT NULL DEFAULT 0,
  published TEXT NOT NULL DEFAULT "",
  created_at TEXT,
  updated_at TEXT
)''')
conn.commit()
print('articles table ready')
