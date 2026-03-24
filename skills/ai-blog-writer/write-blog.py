#!/usr/bin/env python3
"""写入技术博客文章到数据库"""
import sqlite3, json, sys, re, hashlib
from datetime import datetime

DB = '/workspace/ai-watchtower/data/watchtower.db'

def slug(text):
    s = re.sub(r'[^\w\s]', '', text).strip().lower()
    s = re.sub(r'[\s]+', '-', s)
    h = hashlib.md5(s.encode()).hexdigest()[:8]
    return f'{s[:40]}-{h}'

def estimate_reading_time(content):
    words = len(re.sub(r'\s', '', content))
    return max(3, words // 400)

def write_article(item):
    conn = sqlite3.connect(DB)
    today = datetime.now().strftime('%Y-%m-%d')
    excerpt = item.get('excerpt', item.get('content','')[:200]).strip()
    content = item.get('content', '')
    tags = json.dumps(item.get('tags', []))
    ref_links = json.dumps(item.get('refLinks', []))
    related_ids = json.dumps(item.get('relatedIds', []))

    conn.execute("""INSERT OR REPLACE INTO articles
        (id,title,title_cn,excerpt,content,cover_image,author,source,source_url,
         category,difficulty,tags,related_ids,ref_links,reading_time,status,featured,published)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        [item.get('id', slug(item.get('title', 'untitled'))),
         item.get('title',''), item.get('titleCn',''),
         excerpt, content,
         item.get('coverImage',''),
         item.get('author','AI前沿瞭望台'),
         item.get('source',''), item.get('sourceUrl',''),
         item.get('category','技术解析'),
         item.get('difficulty','intermediate'),
         tags, related_ids, ref_links,
         item.get('readingTime', estimate_reading_time(content)),
         item.get('status','published'),
         1 if item.get('featured') else 0,
         item.get('published', today)])
    conn.commit()
    print(f"✅ 已写入: {item.get('titleCn', item.get('title','untitled'))[:50]}")
    return item.get('titleCn', item.get('title','untitled'))

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--items':
        item = json.loads(sys.argv[2])
        write_article(item)
    elif len(sys.argv) > 1:
        item = json.loads(' '.join(sys.argv[1:]))
        write_article(item)
    else:
        data = sys.stdin.read()
        if data.strip():
            write_article(json.loads(data))
        else:
            print('用法: python3 write-blog.py --items \'{"title":"..."}\'')
            sys.exit(1)
