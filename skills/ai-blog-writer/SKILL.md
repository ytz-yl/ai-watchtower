---
name: ai-blog-writer
description: 在网上广泛搜索某个 AI 技术话题，整合成一篇结构完整的技术博客并录入数据库。用户说"写一篇博客"、"整理一下XX技术"、"帮我写技术文章"、"调研XX并写成博客"时触发。
---

# AI Blog Writer

## 工作流程

1. **明确话题**：用户指定 AI 技术话题（如 "LoRA 原理"、"RLHF 训练流程"）
2. **广泛搜索**：用多个角度的关键词搜索相关内容源
3. **深度抓取**：对最重要的页面抓取完整内容
4. **整理写作**：综合所有资料，写成结构完整的中文技术博客
5. **写入数据库**：执行脚本存入 articles 表
6. **通知用户**

## 搜索策略（多角度）

```
话题：LoRA

查询1: "LoRA low-rank adaptation paper 2021"
查询2: "LoRA 微调 原理 教程"
查询3: "QLoRA 4-bit quantization LLM fine-tuning"
查询4: "LoRA vs adapter fine-tuning comparison"
查询5: "LoRA github implementation huggingface"
```

每个话题至少搜索 5 个不同角度。

## 文章结构要求

```markdown
# 主题中文标题

> 主题英文标题（可选）

## 一句话定义
用通俗语言在 1~2 句话内解释核心概念。

## 背景与问题
为什么需要这个技术？解决什么问题？

## 核心原理
详细解释原理，配合图表说明（如有数学公式用代码块）。

## 技术细节/代码示例
关键代码、配置、参数说明。

## 优势与局限
客观分析优缺点。

## 主流应用场景
2~4个真实应用案例。

## 参考资料
- [论文标题](url)
- [参考文章](url)
```

## 文章数据格式

```json
{
  "title": "英文标题",
  "titleCn": "中文标题",
  "excerpt": "3句话摘要，用于列表页展示",
  "content": "完整 Markdown 正文",
  "category": "技术解析",
  "difficulty": "intermediate",
  "tags": ["LoRA", "Fine-tuning", "LLM"],
  "refLinks": [
    {"title": "论文标题", "url": "https://..."},
    {"title": "参考文章", "url": "https://..."}
  ],
  "readingTime": 8,
  "featured": 0,
  "published": "2026-03-24"
}
```

## 写入命令

```bash
python3 /workspace/skills/ai-blog-writer/scripts/write-blog.py \
  '{"title":"LoRA: Low-Rank Adaptation","titleCn":"LoRA：低秩自适应原理与实践",...}'
```

## 完成后

通知用户：
- 文章标题
- 预估阅读时间
- 主要内容概要（2~3句话）
- 存入数据库的 article id
