# Cron 定时任务设置文档

本文件记录 ai-watchtower 项目的定时自动采集任务的设置方法。

---

## 已设置的定时任务

| 任务 | Cron 表达式 | 说明 |
|------|-------------|------|
| `ai-news-daily` | `0 8 * * *`（北京时间） | 每日 08:00 自动采集 AI 新闻 |
| `arxiv-paper-daily` | `0 9 * * *`（北京时间） | 每日 09:00 自动采集 arXiv 论文 |

触发后自动执行对应 Skill，完成后通过企业微信推送结果。

---

## 查看当前所有 Cron 任务

```bash
# 在 OpenClaw 对话框中运行：
cron({ action: 'list' })
```

---

## 查看某个任务的运行历史

```bash
cron({ action: 'runs', jobId: '<job-id>' })
# job-id 为创建时返回的 id
```

---

## 手动触发某个任务（测试用）

```bash
cron({ action: 'run', jobId: '<job-id>' })
```

---

## 删除某个任务

```bash
cron({ action: 'remove', jobId: '<job-id>' })
```

---

## 修改任务时间

```bash
cron({
  action: 'update',
  jobId: '<job-id>',
  patch: {
    schedule: { kind: 'cron', expr: '0 10 * * *', tz: 'Asia/Shanghai' }
  }
})
```

---

## 添加新的定时任务（代码模板）

```javascript
cron({
  action: 'add',
  job: {
    name: '任务名称（唯一标识）',
    schedule: {
      kind: 'cron',
      expr: '0 8 * * *',      // 北京时间每天 08:00
      tz: 'Asia/Shanghai',
    },
    payload: {
      kind: 'agentTurn',
      message: `请执行 ai-news-collector 技能：
1. 抓取量子位、智源今日 AI 新闻
2. 按四维度评估，只写入 7/10 分以上的
3. 完成后向我汇报`,
    },
    sessionTarget: 'isolated',   // 独立会话，不污染主对话
    delivery: {
      mode: 'announce',          // 完成后推送结果
      channel: 'wecom',          // 推送到企业微信
    },
    enabled: true,
  }
})
```

---

## Cron 表达式参考

| 表达式 | 含义 |
|--------|------|
| `0 8 * * *` | 每天 08:00 |
| `0 */4 * * *` | 每 4 小时一次 |
| `0 9 * * 1` | 每周一 09:00 |
| `30 8 * * *` | 每天 08:30 |
| `0 8,12,18 * * *` | 每天 08:00 / 12:00 / 18:00 |

---

## 任务执行流程

```
Cron 时间到达
    ↓
OpenClaw 启动独立 Agent 会话（isolated session）
    ↓
Agent 读取对应 SKILL.md 中的工作流指令
    ↓
执行：抓取 → 评估筛选 → 写入数据库
    ↓
结果通过企业微信推送给用户
```

---

## 注意事项

- `sessionTarget` 必须为 `isolated`，否则任务会在主对话里跑
- `delivery.mode` 用 `announce`，结果会推送到企业微信
- 任务描述（message）要写得足够详细，让 Agent 无需查阅文档也能执行
