#!/usr/bin/env python3
"""migrate-glossary.py - 为 glossary 表填充完整正文"""
import sqlite3, os

DB = '/workspace/ai-watchtower/data/watchtower.db'

ITEMS = [
  {
    'id': 'g001',
    'term': 'RLHF',
    'term_cn': '基于人类反馈的强化学习',
    'definition': 'Reinforcement Learning from Human Feedback (RLHF) is a training paradigm that fine-tunes a language model using human preference data to align model outputs with human values and intentions.',
    'definition_cn': 'RLHF是一种训练范式，通过人类偏好数据对语言模型进行微调，使模型输出与人类价值观和意图保持一致。',
    'tags': '["LLM","Alignment","Training"]',
    'updated': '2026-03-24',
    'content': '''# RLHF：基于人类反馈的强化学习

## 什么是 RLHF？

RLHF（Reinforcement Learning from Human Feedback）是近年来大语言模型训练中最重要的对齐技术之一。核心思想：**用人类偏好数据训练奖励模型，再用它优化语言模型**。

## 为什么需要 RLHF？

预训练模型目标是"预测下一个token"，会生成所有可能的文本，包括有害内容。RLHF纠正这个倾向。

## 三阶段流程

### 第一阶段：监督微调（SFT）
用人工标注的高质量问答对微调预训练模型。

### 第二阶段：训练奖励模型（RM）
收集人类偏好数据（同一prompt多个回答，标注员排序），训练RM预测人类偏好。

### 第三阶段：PPO强化学习
用RM的信号通过PPO算法微调SFT模型。

## RLHF的局限

| 问题 | 说明 |
|------|------|
| 标注成本高 | 需要大量人工标注 |
| 偏好偏差 | 标注员文化背景不同，偏好不一致 |
| Reward Hacking | 模型找到欺骗奖励模型的方法 |

## 参考文献
- Ouyang et al. "Training language models to follow instructions with human feedback" (InstructGPT, 2022)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2203.02155',
    'reading_time': 5,
  },
  {
    'id': 'g002',
    'term': 'RAG',
    'term_cn': '检索增强生成',
    'definition': 'Retrieval-Augmented Generation (RAG) combines a language model with a retrieval system, allowing the model to ground responses in external documents.',
    'definition_cn': '检索增强生成将语言模型与检索系统结合，使模型能够基于外部文档来生成更准确、更及时的回答。',
    'tags': '["LLM","Knowledge","Retrieval"]',
    'updated': '2026-03-24',
    'content': '''# RAG：检索增强生成

## 核心思想

RAG（Retrieval-Augmented Generation）将信息检索系统与语言模型相结合，让模型在生成回答时参考外部知识库。

简单来说：RAG = 搜索引擎 + LLM

## 工作流程

### 1. 文档处理（Indexing）
将文档切分成chunks，编码为向量，存入向量数据库。

### 2. 检索（Retrieval）
将用户问题编码为向量，在向量数据库中检索最相关的文档块。

### 3. 生成（Generation）
将检索到的相关文档作为上下文，喂给LLM生成答案。

## RAG vs Fine-tuning

| 维度 | RAG | Fine-tuning |
|------|-----|-------------|
| 知识更新 | 实时（更新文档即可） | 需要重新训练 |
| 幻觉 | 显著减少 | 一定程度减少 |
| 成本 | 低（无需训练） | 高（GPU+训练时间） |
| 定制风格 | 一般 | 强 |

## 参考文献
- Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (2020)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2005.11401',
    'reading_time': 5,
  },
  {
    'id': 'g003',
    'term': 'MoE',
    'term_cn': '混合专家模型',
    'definition': 'Mixture of Experts (MoE) is a neural network architecture that activates only a subset of expert networks per input, enabling massive scale with manageable compute.',
    'definition_cn': '混合专家模型是一种稀疏激活的神经网络架构，对每个输入只激活部分专家网络，在可控计算量下实现超大模型规模。',
    'tags': '["Architecture","Efficiency","LLM"]',
    'updated': '2026-03-24',
    'content': '''# MoE：混合专家模型

## 什么是MoE？

Mixture of Experts（混合专家模型）是一种稀疏激活的神经网络架构。对每个输入，模型只激活部分"专家"网络，而非让所有参数都参与计算。

核心思想：**把模型的不同能力分配给不同专家，动态选择谁来处理当前输入。**

## 为什么MoE重要？

| 类型 | 参数量↑时计算量 |
|------|----------------|
| Dense | 同比例增加 |
| MoE (Sparse) | 远小于参数量增加 |

## 主流MoE模型

| 模型 | 参数量 | 活跃参数 |
|------|--------|---------|
| Mixtral 8x7B | 46.7B | 12.9B |
| DeepSeekMoE | 145B | 2.9B |
| Qwen1.5-MoE | 109B | 19B |

## 参考文献
- Shazeer et al. "Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer" (2017)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/1701.06538',
    'reading_time': 4,
  },
  {
    'id': 'g004',
    'term': 'LoRA',
    'term_cn': '低秩自适应',
    'definition': 'Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning technique that adds small trainable matrices to frozen model weights.',
    'definition_cn': '低秩自适应是一种参数高效微调技术，通过向冻结的模型权重添加小型可训练的低秩分解矩阵实现。',
    'tags': '["Fine-tuning","Efficiency","LLM"]',
    'updated': '2026-03-24',
    'content': '''# LoRA：低秩自适应

## 背景

全参数微调大模型面临巨大挑战：显存高、时间长、部署成本大。

## 核心思想

LoRA（Low-Rank Adaptation）来自Hu et al., ICLR 2022。

**核心洞察**：大模型权重矩阵通常是低秩的，参数更新可通过低秩分解近似。

原始更新：ΔW = W_finetuned - W_pretrained
LoRA近似：ΔW ≈ BA，其中A ∈ R(r×d), B ∈ R(d×r), r << d

## 效果

对于d=4096, r=8的矩阵：
- 全参数：16,777,216参数
- LoRA：65,536参数（压缩256倍）

## QLoRA

将预训练模型量化到4-bit，配合LoRA，一个65B模型可在单张48GB GPU上微调。

## 参考文献
- Hu et al. "LoRA: Low-Rank Adaptation of Large Language Models" (ICLR 2022)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2106.09685',
    'reading_time': 4,
  },
  {
    'id': 'g005',
    'term': 'AGI',
    'term_cn': '通用人工智能',
    'definition': 'Artificial General Intelligence (AGI) refers to a hypothetical AI system with the ability to understand, learn, and apply intelligence across any domain at human level or beyond.',
    'definition_cn': '通用人工智能指具有在任意领域达到或超越人类水平地理解、学习和应用智能能力的人工智能系统。',
    'tags': '["Concept","Future","AI"]',
    'updated': '2026-03-24',
    'content': '''# AGI：通用人工智能

## 什么是AGI？

AGI（Artificial General Intelligence）是人工智能研究的终极目标——一个能够在任何领域达到或超越人类水平的AI系统。

与窄人工智能（Narrow AI）的区别：
- 窄AI：只能在特定任务上表现优秀
- AGI：具备跨领域的泛化能力，能像人类一样自主学习新技能

## AGI的关键能力里程碑

| 里程碑 | 描述 |
|--------|------|
| 涌现能力 | 在未明确训练的任务上表现良好 |
| 多模态统一 | 处理文本、图像、语音、视频等多种模态 |
| 持续学习 | 无需重新训练就能适应新任务 |
| 元认知 | 能够评估自身知识边界 |

## AGI的风险

- **控制问题**：AI目标与人类利益不一致可能导致灾难性后果
- **能力爆炸**：自我改进引发"智能爆炸"，人类可能失去控制

## 参考文献
- Bostrom, N. "Superintelligence: Paths, Dangers, Strategies" (2014)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://en.wikipedia.org/wiki/Artificial_general_intelligence',
    'reading_time': 4,
  },
  {
    'id': 'g006',
    'term': 'Alignment',
    'term_cn': 'AI对齐',
    'definition': 'AI alignment is the field of ensuring AI systems act in accordance with human intentions and values.',
    'definition_cn': 'AI对齐是确保人工智能系统行为符合人类意图和价值观的研究领域。',
    'tags': '["Safety","Ethics","LLM"]',
    'updated': '2026-03-24',
    'content': '''# Alignment：AI对齐

## 为什么Alignment至关重要

即使AI能力再强，如果它不按照我们的意图行动，后果也是危险的。

## 核心挑战

### 1. 操控目标
AI学到的"目标"可能不是我们真正想要的。

### 2. 奖励黑客
AI找到"作弊"方式最大化奖励信号，而非真正完成目标。

### 3. 分布外失败
模型在训练分布内对齐，但遇到新场景时对齐失效。

## 主要对齐技术

### RLHF
用人类偏好数据训练奖励模型，用RL优化策略。详见RLHF词条。

### Constitutional AI
用一组原则（Constitution）引导AI自我批评，减少对人类标注的依赖。

## 参考文献
- Bai et al. "Constitutional AI: Harmlessness from AI Feedback" (Anthropic, 2022)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback',
    'reading_time': 4,
  },
  {
    'id': 'g007',
    'term': 'Context Window',
    'term_cn': '上下文窗口',
    'definition': 'The context window is the maximum number of tokens an LLM can process in a single forward pass.',
    'definition_cn': '上下文窗口是大语言模型在单次前向传播中可以处理的最大token数。',
    'tags': '["LLM","Architecture"]',
    'updated': '2026-03-24',
    'content': '''# Context Window：上下文窗口

## 什么是上下文窗口？

上下文窗口是LLM在单次前向传播中能处理的最大token数，包括输入prompt和生成的输出。

## 技术挑战

标准Self-Attention复杂度是O(n²)：
- n=4096 → 16,777,216次注意力计算
- n=131072 → 17,179,869,184次注意力计算（1024倍更多）

## 突破窗口限制的技术

### 1. 滑动窗口注意力
每次只关注固定窗口大小（如4096），代表：Mamba、Snowflake Arctic。

### 2. 稀疏注意力
不是每个token都attend所有其他token，代表：Longformer、BigBird。

### 3. 近似注意力
降低O(n²)复杂度，代表：Performer（Linear Attention）。

### 4. RoPE位置编码
RoPE具有良好外推特性，使通过微调扩展上下文窗口成为可能。

## 参考文献
- Vaswani et al. "Attention Is All You Need" (2017)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/1706.03762',
    'reading_time': 4,
  },
  {
    'id': 'g008',
    'term': 'Fine-tuning',
    'term_cn': '微调',
    'definition': 'Fine-tuning is the process of taking a pre-trained model and continuing to train it on a specific domain or task dataset.',
    'definition_cn': '微调是指将预训练模型在特定领域或任务的dataset上继续训练，使其适应目标用例。',
    'tags': '["Training","LLM"]',
    'updated': '2026-03-24',
    'content': '''# Fine-tuning：微调

## 什么是微调？

Fine-tuning是在预训练模型的基础上，用特定任务或领域的数据继续训练，使模型在该任务上表现更好的技术。

优势：
- 成本低（预训练需数千GPU卡月，微调只需几小时）
- 效果好（预训练模型已学到通用语言能力）
- 数据需求少（从零训练需TB级，微调仅需GB级）

## 微调范式演进

### 1. 全参数微调
更新模型所有参数。问题：显存需求极高。

### 2. LoRA/QLoRA
只训练低秩适配器，冻结原模型参数。详见LoRA词条。

### 3. 指令微调
用（指令、输入、输出）格式数据微调，让模型学会遵循指令。

## 微调常见问题

- **灾难性遗忘**：微调后模型在原始任务上性能下降
- **过拟合**：特定领域数据过少时容易过拟合

## 参考文献
- Howard et al. "ULMFiT" (2018)
- Liu et al. "LIMA: Less Is More for Alignment" (2023)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2305.11206',
    'reading_time': 5,
  },
  {
    'id': 'g009',
    'term': 'Chain-of-Thought (CoT)',
    'term_cn': '思维链',
    'definition': 'Chain-of-Thought prompting encourages an LLM to explicitly verbalize intermediate reasoning steps before giving a final answer.',
    'definition_cn': '思维链提示鼓励大语言模型在给出最终答案前显式表达中间推理步骤，显著提升复杂推理任务性能。',
    'tags': '["Prompting","Reasoning","LLM"]',
    'updated': '2026-03-24',
    'content': '''# Chain-of-Thought：思维链

## 核心思想

Chain-of-Thought（CoT）提示是一种让LLM显式展示推理过程而非直接给出答案的技术。

关键发现：**让模型把思考过程说出来，答案准确率显著提升。**

## CoT的类型

### Few-shot CoT
在prompt中给出几个"问题→推理→答案"的示例，让模型学习这种模式。

### Zero-shot CoT
在问题后加"让我们一步一步思考"，触发模型的推理能力。

## 自洽性（Self-Consistency）
对同一个问题生成多条推理路径，选择最终答案出现频率最高的那个。

## 局限性

- 对小规模模型（<10B）效果有限
- 对简单计算题反而增加错误率
- 需要消耗更多tokens（成本增加）

## 参考文献
- Wei et al. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (2022)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2201.11903',
    'reading_time': 4,
  },
  {
    'id': 'g010',
    'term': 'Diffusion Model',
    'term_cn': '扩散模型',
    'definition': 'Diffusion models are a class of generative models that learn to create data by reversing a gradual noising process.',
    'definition_cn': '扩散模型是一类生成模型，通过学习逆转渐进式噪声过程来生成数据，在图像音视频生成上达到最优效果。',
    'tags': '["Generation","CV","GenAI"]',
    'updated': '2026-03-24',
    'content': '''# Diffusion Model：扩散模型

## 什么是扩散模型？

扩散模型是一类生成模型，通过学习逆转渐进式噪声过程来生成数据。

前向过程：逐步向数据添加噪声，直到变成纯噪声
反向过程：学习逐步去除噪声，从噪声中恢复数据

## 核心组件

### 1. U-Net骨干
用于预测噪声残差，是DDPM的标准骨干网络。

### 2. 条件控制（Conditioning）
- Classifier-Free Guidance：用无条件和条件预测的差值作为引导信号
- Cross-Attention：让文本、图像等条件信息注入生成过程

### 3. 采样加速
- DDIM：通过非马尔可夫过程加速采样
- LCM（Latent Consistency Models）：几步即可生成高质量图像

## 主流扩散模型

| 模型 | 领域 | 代表 |
|------|------|------|
| Stable Diffusion | 图像 | 开源图像生成标准 |
| DALL-E 3 | 图像 | OpenAI |
| Sora | 视频 | OpenAI视频生成 |
| Stable Video Diffusion | 视频 | Stability AI |

## 参考文献
- Ho et al. "Denoising Diffusion Probabilistic Models" (DDPM, 2020)''',
    'author': 'AI前沿瞭望台',
    'source_url': 'https://arxiv.org/abs/2006.11239',
    'reading_time': 5,
  },
]

def main():
    conn = sqlite3.connect(DB)
    for item in ITEMS:
        conn.execute('''
            INSERT OR REPLACE INTO glossary
            (id,term,term_cn,definition,definition_cn,tags,updated,content,author,source_url,reading_time)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        ''', [
            item['id'], item['term'], item['term_cn'],
            item['definition'], item['definition_cn'],
            item['tags'], item['updated'],
            item['content'], item['author'], item['source_url'], item['reading_time']
        ])
        print(f"  {item['term_cn']}")
    conn.commit()
    print(f"\nDone! {len(ITEMS)} glossary items updated.")

if __name__ == '__main__':
    main()
