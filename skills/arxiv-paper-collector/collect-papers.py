#!/usr/bin/env python3
"""写入 AI 论文到数据库"""
import sqlite3, json, sys
from datetime import datetime

DB = '/workspace/ai-watchtower/data/watchtower.db'

def write_papers(items):
    conn = sqlite3.connect(DB)
    for item in items:
        conn.execute("""INSERT OR REPLACE INTO papers
            (id,title,title_cn,authors,abstract,abstract_cn,category,tags,published,url,pdf_url)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            [item.get('id',''), item.get('title',''), item.get('titleCn',''),
             json.dumps(item.get('authors',[])),
             item.get('abstract',''), item.get('abstractCn',''),
             item.get('category','cs.AI'), json.dumps(item.get('tags',[])),
             item.get('published', datetime.now().strftime('%Y-%m-%d')),
             item.get('url',''), item.get('pdfUrl','')])
    conn.commit()
    print(f'✅ 写入 {len(items)} 篇论文')
    return len(items)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--items':
        items = json.loads(sys.argv[2])
        write_papers(items)
    elif len(sys.argv) > 1:
        items = json.loads(' '.join(sys.argv[1:]))
        write_papers(items)
    else:
        data = sys.stdin.read()
        if data.strip():
            write_papers(json.loads(data))
        else:
            print('用法: python3 collect-papers.py --items \'[{"id":"...","title":"..."}]\'')
            sys.exit(1)
