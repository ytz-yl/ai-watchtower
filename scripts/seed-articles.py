#!/usr/bin/env python3
"""seed-articles.py - 将 distill/ 和 pretrain/ 的 Markdown 文章迁移到 articles 表"""
import sqlite3, json, re, os, hashlib
from datetime import date

ROOT = '/workspace/ai-watchtower'
DB = f'{ROOT}/data/watchtower.db'
DISTILL = '/workspace/distill'
PRETRAIN = '/workspace/llm-pretraining-research'

conn = sqlite3.connect(DB)
cur = conn.cursor()

# ── 工具函数 ──────────────────────────────────────────────────

def slug(text):
    """生成 URL-safe id"""
    text = re.sub(r'[^\w\s]', '', text).strip()
    text = re.sub(r'[\s]+', '-', text.lower())
    h = hashlib.md5(text.encode()).hexdigest()[:8]
    return f'{text[:40]}-{h}'

def extract_meta(content):
    """从 Markdown 提取元信息"""
    result = {
        'title': '', 'title_cn': '',
        'author': '', 'source': '', 'source_url': '',
        'published': str(date.today()),
    }
    # 来源
    m = re.search(r'\*\*来源[：:]\*\*\s*(.+?)\n', content)
    if m: result['source'] = m.group(1).strip()
    # 原文链接
    m = re.search(r'(https?://[^\s*]+)', content)
    if m: result['source_url'] = m.group(1).strip()
    # 发布/更新时间
    m = re.search(r'\*\*更新时间[：:]\*\*\s*(\d{4}-\d{2}-\d{2})', content)
    if m: result['published'] = m.group(1).strip()
    m = re.search(r'(\d{4}[-/]\d{2}[-/]\d{2})', content)
    if m and not result['published']: result['published'] = m.group(1).strip().replace('/', '-')
    # 作者
    m = re.search(r'\*\*作者[：:]\*\*\s*(.+?)\n', content)
    if m: result['author'] = m.group(1).strip()
    return result

def extract_title(content):
    """提取第一个 # 标题"""
    m = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    return m.group(1).strip() if m else ''

def extract_excerpt(content, max_len=200):
    """提取摘要"""
    text = re.sub(r'^#+\s+.+$', '', content, flags=re.MULTILINE)
    text = re.sub(r'>.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'\*\*|__|\*|_', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'\n+', ' ', text).strip()
    return text[:max_len] + ('…' if len(text) > max_len else '')

def estimate_reading_time(content):
    words = len(re.sub(r'\s', '', content))
    return max(3, words // 400)

def clean_content(content):
    """清理 Markdown，去掉元信息"""
    content = re.sub(r'^>\s*来源[：:].+$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^>\s*(https?://\S+)$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\*\*来源[：:]\*\*.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\*\*更新时间[：:]\*\*.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\*\*作者[：:]\*\*.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\*\*引用[：:]\*\*.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^---+$', '', content, flags=re.MULTILINE)
    return content.strip()

def extract_tags(content):
    """从 ## 标题中提取标签"""
    tags = set()
    for m in re.finditer(r'^##\s+(.+)$', content, re.MULTILINE):
        tag = m.group(1).strip().split()[0]
        tag = re.sub(r'[#*`🌟🔥📌⭐]+', '', tag).strip()
        if tag and 2 <= len(tag) <= 20:
            tags.add(tag)
    return list(tags)[:8]

def upsert(article):
    cur.execute("""
        INSERT OR REPLACE INTO articles
        (id,title,title_cn,excerpt,content,cover_image,author,source,source_url,
         category,difficulty,tags,related_ids,ref_links,reading_time,status,featured,published,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    """, [
        article['id'],
        article['title'],
        article.get('title_cn', ''),
        article.get('excerpt', ''),
        article.get('content', ''),
        article.get('cover_image', ''),
        article.get('author', ''),
        article.get('source', ''),
        article.get('source_url', ''),
        article.get('category', '技术解析'),
        article.get('difficulty', 'intermediate'),
        json.dumps(article.get('tags', []), ensure_ascii=False),
        json.dumps(article.get('related_ids', []), ensure_ascii=False),
        json.dumps(article.get('ref_links', []), ensure_ascii=False),
        article.get('reading_time', 5),
        article.get('status', 'published'),
        article.get('featured', 0),
        article.get('published', str(date.today())),
    ])
    print(f"  ✅ {article['title_cn'] or article['title'][:40]}")

# ── 迁移 distill/articles ───────────────────────────────────────

print('=== 迁移 distill/ ===')
CATEGORIES = {
    'blogs': ('技术解析', 'intermediate'),
    'papers': ('论文笔记', 'advanced'),
    'tips': ('工程实践', 'intermediate'),
}
for folder, (cat, diff) in CATEGORIES.items():
    dir_path = os.path.join(DISTILL, folder)
    if not os.path.exists(dir_path):
        print(f'  (跳过 {folder}/)')
        continue
    for fname in os.listdir(dir_path):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(dir_path, fname)
        content = open(fpath, encoding='utf-8').read()
        meta = extract_meta(content)
        title = extract_title(content)
        title_cn = title
        excerpt = extract_excerpt(content)
        tags = extract_tags(content)
        ref_links = []
        if meta.get('source_url'):
            ref_links.append({'title': meta.get('source', '原文链接'), 'url': meta['source_url']})
        id_base = fname.replace('.md', '')
        upsert({
            'id': f'distill-{folder}-{id_base}',
            'title': title,
            'title_cn': title_cn,
            'excerpt': excerpt,
            'content': clean_content(content),
            'category': cat,
            'difficulty': diff,
            'tags': tags,
            'ref_links': ref_links,
            'author': meta.get('author', 'AI前沿瞭望台'),
            'source': meta.get('source', ''),
            'source_url': meta.get('source_url', ''),
            'published': meta.get('published', str(date.today())),
            'reading_time': estimate_reading_time(content),
            'status': 'published',
            'featured': 1 if cat == '技术解析' else 0,
        })

# ── 迁移 pretrain/articles ──────────────────────────────────────

print('=== 迁移 pretrain/ ===')
PRETRAIN_CATS = {
    'blogs': ('工程实践', 'intermediate'),
    'papers': ('论文笔记', 'advanced'),
}
for folder, (cat, diff) in PRETRAIN_CATS.items():
    dir_path = os.path.join(PRETRAIN, folder)
    if not os.path.exists(dir_path):
        print(f'  (跳过 {folder}/)')
        continue
    for fname in os.listdir(dir_path):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(dir_path, fname)
        content = open(fpath, encoding='utf-8').read()
        meta = extract_meta(content)
        title = extract_title(content)
        excerpt = extract_excerpt(content)
        tags = extract_tags(content)
        ref_links = []
        if meta.get('source_url'):
            ref_links.append({'title': meta.get('source', '原文链接'), 'url': meta['source_url']})
        # 论文编号作为来源
        if 'arxiv' in meta.get('source_url', '').lower() or '2302' in fname or '2402' in fname:
            tags = ['LLM', '预训练'] + tags
        id_base = fname.replace('.md', '')
        upsert({
            'id': f'pretrain-{folder}-{id_base}',
            'title': title,
            'title_cn': title,
            'excerpt': excerpt,
            'content': clean_content(content),
            'category': cat,
            'difficulty': diff,
            'tags': tags,
            'ref_links': ref_links,
            'author': meta.get('author', 'AI前沿瞭望台'),
            'source': meta.get('source', ''),
            'source_url': meta.get('source_url', ''),
            'published': meta.get('published', str(date.today())),
            'reading_time': estimate_reading_time(content),
            'status': 'published',
            'featured': 0,
        })

conn.commit()
print('\n✅ 完成！')
