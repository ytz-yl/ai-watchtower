---
name: arxiv-paper-collector
description: 搜索今日 arXiv 最新 AI 方向论文，摘录最有创意的并录入数据库。用户说"抓论文"、"更新papers"、"采集arXiv论文"、"今日论文更新"时触发。
---

# ArXiv Paper Collector

## 工作流程

1. 用 `batch_web_search` 搜索今日 arXiv AI 最新论文（CS.AI/CS.CL/CS.CV/LG）
2. 对重点论文抓取 arXiv 页面获取摘要和作者信息
3. 评估创新性，选取最有价值的 5~8 篇
4. 写入数据库

## 搜索策略

```json
[
  {"query": "site:arxiv.org AI large language model 2026", "data_range": "d"},
  {"query": "site:arxiv.org language model OR transformer 2026", "data_range": "d"},
  {"query": "site:arxiv.org multimodal OR reasoning 2026", "data_range": "d"},
  {"query": "site:arxiv.org RLHF OR alignment 2026", "data_range": "d"}
]
```

## 论文数据格式

```json
{
  "id": "2603.XXXXX",
  "title": "Paper Title in English",
  "titleCn": "中文标题",
  "authors": ["Author 1", "Author 2"],
  "abstract": "英文摘要（可截取前500字符）",
  "abstractCn": "中文摘要（翻译）",
  "category": "cs.CL",
  "tags": ["LLM", "Reasoning"],
  "published": "2026-03-24",
  "url": "https://arxiv.org/abs/2603.XXXXX",
  "pdfUrl": "https://arxiv.org/pdf/2603.XXXXX.pdf"
}
```

注意：
- arXiv ID 取实际搜索到的，不要编造
- `abstractCn` 必填，自己翻译
- 作者超过5人只取前5位

## 写入命令

```bash
python3 /workspace/skills/arxiv-paper-collector/scripts/collect-papers.py --items \
  '[{"id":"2603.12345","title":"...","titleCn":"...","authors":["A1"],"abstract":"...","abstractCn":"...","category":"cs.AI","tags":["LLM"],"published":"2026-03-24","url":"...","pdfUrl":"..."}]'
```

## 完成后

通知用户：采集数量、论文列表、每篇一句话简介。
