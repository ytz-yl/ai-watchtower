#!/usr/bin/env python3
"""写入 AI 新闻到数据库"""
import sqlite3, json, sys
from datetime import datetime

DB = '/workspace/ai-watchtower/data/watchtower.db'

def write_news(items):
    conn = sqlite3.connect(DB)
    for item in items:
        conn.execute("""INSERT OR REPLACE INTO news
            (id,title,title_cn,source,source_url,published_at,summary,summary_cn,tags,featured)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            [item.get('id',''), item.get('title',''), item.get('titleCn',''),
             item.get('source',''), item.get('sourceUrl',''),
             item.get('publishedAt', datetime.now().strftime('%Y-%m-%d')),
             item.get('summary',''), item.get('summaryCn',''),
             json.dumps(item.get('tags',[])), 1 if item.get('featured') else 0])
    conn.commit()
    print(f'✅ 写入 {len(items)} 条新闻')
    return len(items)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--items':
        items = json.loads(sys.argv[2])
        write_news(items)
    elif len(sys.argv) > 1:
        # 尝试直接解析（单条 JSON 对象作为参数）
        items = json.loads(' '.join(sys.argv[1:]))
        write_news(items)
    else:
        data = sys.stdin.read()
        if data.strip():
            write_news(json.loads(data))
        else:
            print('用法: python3 collect-news.py --items \'[{"title":"..."}]\'')
            sys.exit(1)
