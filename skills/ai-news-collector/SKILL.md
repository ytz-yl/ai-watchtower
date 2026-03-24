---
name: ai-news-collector
description: 搜索今日 AI 科技新闻，摘录并录入 ai-watchtower 数据库。当用户说"抓新闻"、"更新今日快讯"、"采集AI新闻"、"更新news"时触发此技能。
---

# AI News Collector

## 工作流程

1. 用 `batch_web_search` 搜索今日 AI 新闻（查询今日日期 + AI/大模型/大模型最新进展）
2. 对每条新闻用 `extract_content_from_websites` 抓取正文
3. 整理成结构化数据
4. 执行写入脚本

## 搜索策略

```json
[
  {"query": "AI 大模型 最新进展 今日 DATE", "data_range": "d"},
  {"query": "人工智能 突破性进展 DATE", "data_range": "d"},
  {"query": "LLM GPT Claude Gemini 最新消息 DATE", "data_range": "d"},
  {"query": "AI 产品发布 最新 DATE", "data_range": "d"}
]
```

DATE 替换为今天日期，格式 `2026年3月24日`。

每条新闻选取 5~8 条最有价值的。

## 新闻数据格式

```json
{
  "id": "news-YYYYMMDD-001",
  "title": "英文标题",
  "titleCn": "中文标题",
  "source": "The Verge / 机器之心 等",
  "sourceUrl": "https://...",
  "publishedAt": "2026-03-24",
  "summary": "英文摘要 1-2句",
  "summaryCn": "中文摘要 1-2句",
  "tags": ["LLM", "产品发布"],
  "featured": 1
}
```

## 写入命令

```bash
python3 /workspace/skills/ai-news-collector/scripts/collect-news.py \
  '{"title":"...","titleCn":"...","source":"...","sourceUrl":"...","summary":"...","summaryCn":"...","tags":["AI"],"publishedAt":"2026-03-24","featured":0}'
```

或批量写入（多条新闻用 Python 脚本读取 stdin）：

```bash
python3 /workspace/skills/ai-news-collector/scripts/collect-news.py --items \
  '[{"title":"...","titleCn":"...","source":"...","sourceUrl":"...","summary":"...","summaryCn":"...","tags":["AI"],"featured":0},...]'
```

## 完成后

通知用户：
- 本次采集数量
- 主要内容摘要（2~3条亮点）
- 写入的日期
