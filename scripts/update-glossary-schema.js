/**
 * scripts/update-glossary-schema.js
 * 为 glossary 表新增 content/author/source_url/reading_time 字段
 * 运行: node scripts/update-glossary-schema.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import initSqlJs from 'sql.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'watchtower.db')

const GLOSSARY_CONTENT = {
  g001: {
    content: `# RLHF：基于人类反馈的强化学习

## 什么是 RLHF？

RLHF（Reinforcement Learning from Human Feedback）是近年来大语言模型（LLM）训练中最重要的对齐技术之一。它的核心思想是：**用人类的偏好数据来训练一个奖励模型，再用这个奖励模型来优化语言模型，使其输出更符合人类意图**。

## 为什么需要 RLHF？

预训练语言模型的目标是"预测下一个 token"，这意味着它会生成**所有可能的文本**，包括有害的、不准确的、不符合用户意图的。RLHF 的作用就是"纠正"这个倾向。

RLHF 解决了三个核心问题：

- **有害内容**：模型会输出歧视、暴力、虚假信息
- **不遵循指令**：用户想要明确的回答，但模型只是在续写文本
- **幻觉**：模型一本正经地胡说八道

## RLHF 的三阶段流程

### 第一阶段：监督微调（SFT）

在原始语言模型基础上，用人工标注的高质量问答对进行微调。

\`\`\`python
# 典型的 SFT 数据格式
{
  "prompt": "请解释什么是机器学习",
  "response": "机器学习是人工智能的一个分支..."
}
\`\`\`

### 第二阶段：训练奖励模型（Reward Model）

收集人类偏好数据：给同一个 prompt 喂给模型生成多个回答，由人类标注员排序。

\`\`\`
Prompt: 怎么制作炸弹？
Response A: 很遗憾，我无法协助此类请求...
Response B: 首先准备好铁锅...（省略）
→ 人类选择 A，拒绝 B
\`\`\`

用这些偏好数据训练一个**奖励模型**（RM），让它学会预测"人类会觉得哪个回答更好"。

### 第三阶段：强化学习优化（PPO）

用奖励模型的信号，通过强化学习算法（通常是 PPO）微调 SFT 模型，最大化期望奖励。

\`\`\`
Policy Loss = E[reward(action) - β * KL(π_new || π_old)]
\`\`\`

加入 KL 散度惩罚，防止模型偏离 SFT 太远，保证输出的基本可读性。

## RLHF 的局限与挑战

| 问题 | 说明 |
|------|------|
| 标注成本高 | 需要大量人工标注，耗时且昂贵 |
| 主观偏好偏差 | 标注员文化背景不同，偏好不一致 |
| Reward Hacking | 模型找到"骗过"奖励模型的技巧 |
| 分布外泛化 | 奖励模型没见过的新场景可能失效 |

## RLHF vs Constitutional AI

Anthropic 提出了**Constitutional AI（CAI）** 作为替代方案：用一组原则（Constitution）让 AI 自我批评和迭代，减少对人类标注的依赖。

## 主流模型中的 RLHF

几乎所有主流对话模型都使用了 RLHF：
- **ChatGPT/InstructGPT**：OpenAI 率先在大规模上应用
- **GPT-4**：据说经过了多轮 RLHF 迭代
- **Claude**：结合了 RLHF 和 Constitutional AI
- **Llama 2**：使用了大量人类偏好数据进行 RLHF

## 参考文献

- Ouyang et al. "Training language models to follow instructions with human feedback" (InstructGPT, 2022)
- Bai et al. "Training a Helpful and Harmless Assistant with RLHF" (Anthropic, 2022)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2203.02155',
    reading_time: 6,
  },
  g002: {
    content: `# RAG：检索增强生成

## 核心思想

RAG（Retrieval-Augmented Generation，检索增强生成）将**信息检索系统**与**语言模型**相结合，让模型在生成回答时能够参考外部知识库中的最新、最准确的信息。

简单来说：RAG = 搜索引擎 + LLM

## 为什么需要 RAG？

大语言模型有三个根本性缺陷：

1. **知识截止日期**：模型的知识停留在训练截止日，不知道最新发生的事
2. **幻觉**：模型可能生成听起来合理但完全错误的内容
3. **不可解释**：无法追溯模型"知道"某个事实的依据

RAG 直接解决这三个问题：

\`\`\`
用户问题 → 检索相关文档 → 拼接进 prompt → LLM 生成答案
\`\`\`

## RAG 工作流程

### 1. 文档处理（Indexing）

\`\`\`python
# 文档切分示例
chunks = text_splitter.split_document(document)
for chunk in chunks:
    embedding = embed_model.encode(chunk)
    vector_store.add(embedding, chunk)
\`\`\`

关键技术点：
- **Chunk Size**：通常 256~1024 tokens，过小丢失上下文，过大引入噪声
- **重叠（Overlap）**：相邻 chunk 保留部分重叠，保证信息连续性
- **嵌入模型**：OpenAI text-embedding-ada-002 / BGE / E5 等

### 2. 检索（Retrieval）

\`\`\`python
query_embedding = embed_model.encode(user_query)
top_k_results = vector_store.search(query_embedding, k=5)
context = "\\n".join([r.content for r in top_k_results])
\`\`\`

常见检索策略：
- **向量检索**（Dense Retrieval）：语义相似度
- **稀疏检索**（BM25）：关键词匹配
- **混合检索**：向量 + BM25 融合
- **重排序**（Reranker）：Cross-Encoder 对初筛结果二次排序

### 3. 生成（Generation）

\`\`\`python
prompt = f"""
根据以下参考资料回答问题。如果参考资料中没有相关信息，请如实说明。

参考资料：
{context}

问题：{question}
回答：
"""
response = llm.generate(prompt)
\`\`\`

## Advanced RAG 技术

### 父子块检索（Parent-Document Retrieval）

先检索小块（chunk）找到细粒度匹配，再召回对应的大块（parent）提供完整上下文。

### 查询改写（Query Rewriting）

\`\`\`
原查询：2024年手机推荐
改写后：2024年值得购买的高性价比手机推荐列表，包含各品牌旗舰机型对比
\`\`\`

### HyDE（Hypothetical Document Embeddings）

让 LLM 先根据问题生成一个"假设答案"，再用这个答案去检索相关文档。比直接用问题检索效果更好。

### Corrective RAG

检索 → 判断相关性 → 不相关则重新检索，或直接让 LLM 回答

## RAG vs Fine-tuning

| 维度 | RAG | Fine-tuning |
|------|-----|-------------|
| 知识更新 | 实时（更新文档即可） | 需要重新训练 |
| 幻觉 | 显著减少 | 一定程度减少 |
| 成本 | 低（无需训练） | 高（GPU + 训练时间） |
| 定制风格 | 一般 | 强（可深度定制） |
| 适用场景 | 知识问答、文档检索 | 特定任务优化 |

## 典型应用场景

- 企业内部知识库问答
- 客服机器人
- 医疗/法律等专业领域问答
- 科研文献助手

## 参考文献

- Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Facebook AI, 2020)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2005.11401',
    reading_time: 7,
  },
  g003: {
    content: `# MoE：混合专家模型

## 什么是 MoE？

Mixture of Experts（混合专家模型）是一种**稀疏激活**的神经网络架构。对每个输入，模型只激活部分"专家"（Expert）网络，而非让所有参数都参与计算。

\`\`\`
传统 Dense 模型：每个 token 经过所有参数
MoE 模型：每个 token 只激活 K 个专家的参数
\`\`\`

核心思想：**把模型的不同能力分配给不同的专家，动态选择谁来处理当前输入。**

## 为什么 MoE 如此重要？

模型参数量增大有两种方式：

| 类型 | 计算量 | 代表模型 |
|------|--------|---------|
| Dense | 参数量↑ → 计算量同比例↑ | GPT-3 (175B Dense) |
| MoE (Sparse) | 参数量↑ → 实际计算量远小于参数量 | GPT-4 (据传 1.8T MoE) |

MoE 可以在**不显著增加计算量**的情况下大幅增加参数量，从而用更少的 GPU 训练出更大规模的模型。

## MoE 架构详解

### 核心组件

\`\`\`python
class MoELayer(nn.Module):
    def __init__(self, num_experts, top_k):
        self.experts = nn.ModuleList([FFN() for _ in range(num_experts)])
        self.gate = nn.Linear(d_model, num_experts)  # 门控网络
        self.top_k = top_k  # 每个 token 激活的专家数

    def forward(self, x):
        # Step 1: 计算每个专家的置信度
        gate_scores = self.gate(x)  # [batch, seq_len, num_experts]
        
        # Step 2: 选择 top-k 专家
        topk_scores, topk_indices = torch.topk(gate_scores, self.top_k, dim=-1)
        
        # Step 3: 稀疏激活
        output = torch.zeros_like(x)
        for i in range(self.top_k):
            expert_idx = topk_indices[..., i]
            expert_weight = F.softmax(topk_scores[..., i], dim=-1)
            expert_output = self.experts[expert_idx](x)
            output += expert_weight * expert_output
        
        return output
\`\`\`

### Shared Expert（共享专家）

Mixtral 在每个 MoE 层还加入了**共享专家**（SwiGLU），所有 token 都经过它：

\`\`\`
output = sum(top_k_experts) + shared_expert(x)
\`\`\`

### 负载均衡（Load Balancing）

如果所有 token 都激活同一批专家，会导致：
- 部分专家过载（OOM）
- 部分专家闲置（浪费）

解决方案：**辅助损失函数**惩罚不均衡的专家分配：

\`\`\`python
def load_balancing_loss(gate_scores, top_k_indices):
    # 鼓励每个专家被激活的概率均匀
    return (gate_scores.sum(-1) * top_k_indices.float()).mean()
\`\`\`

## 主流 MoE 模型

| 模型 | 参数量 | 活跃参数 | 发布方 |
|------|--------|---------|-------|
| Mixtral 8x7B | 46.7B | 12.9B | Mistral AI |
| DBRX | 132B | 36B | Databricks |
| Grok-1 | 314B | 86B | xAI |
| DeepSeekMoE | 145B | 2.9B | DeepSeek |
| Qwen1.5-MoE | 109B | 19B | 阿里 |
| GPT-4 | ~1.8T (据传) | ~200B | OpenAI |

## DeepSeekMoE 的创新

DeepSeek 提出了两个关键创新：

1. **细粒度专家拆分（Fine-grained Expert Segmentation）**：将专家拆分成更小的单元，提高专家的专业化程度
2. **共享专家隔离（Shared Expert Isolation）**：将公共知识分离到共享专家，避免冗余

## MoE 的挑战

- **通信瓶颈**：分布式训练时专家在不同 GPU，需要 All-to-All 通信
- **负载均衡**：需要精心设计辅助损失
- **推理内存**：所有专家参数需加载到显存（即使每次只激活少数）
- **微调难度**：容易过拟合或专家崩溃

## 参考文献

- Shazeer et al. "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer" (2017)
- Du et al. "Mixtral of Experts" (2024)
- DeepSeek Team. "DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts" (2024)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2401.14366',
    reading_time: 7,
  },
  g004: {
    content: `# LoRA：低秩自适应

## 背景：大模型微调的困境

GPT-3（175B）等超大模型在特定任务上微调时面临巨大挑战：

- **全参数微调**：需要更新所有参数，显存和时间成本极高
- **灾难性遗忘**：微调后模型可能在原有任务上能力退化
- **部署成本**：每个任务都需要保存一份完整的模型权重

## LoRA 的核心思想

LoRA（Low-Rank Adaptation）来自论文 *"LoRA: Low-Rank Adaptation of Large Language Models"*（Hu et al., ICLR 2022）。

**核心洞察**：大模型的权重矩阵通常是低秩的，参数更新可以通过低秩分解来近似。

\`\`\`
原始全参数微调：ΔW = W_finetuned - W_pretrained
LoRA 近似：      ΔW ≈ BA，其中 A ∈ R^{r×d}, B ∈ R^{d×r}, r << d
\`\`\`

## 数学原理

在 Transformer 中，自注意力层的权重矩阵是最大的参数量来源。LoRA 的做法是：

\`\`\`python
# 原始前向传播
y = Wx

# LoRA 前向传播
y = Wx + (BA)x

# W 冻结不动，只训练 A 和 B
# A 用随机高斯初始化，B 用零初始化
# 训练时 ΔW = BA 的梯度反向传播更新 A, B
\`\`\`

对于一个维度为 `d × d` 的权重矩阵：
- 全参数微调：需要更新 `d²` 个参数
- LoRA：只需要更新 `2 × d × r` 个参数（r 是秩，通常为 4~64）

当 `d=4096, r=8` 时：`8 × 4096 × 2 = 65,536` 参数 vs `16,777,216` 参数，压缩 **256 倍**。

## LoRA 的变体

### QLoRA（Quantized LoRA）

将预训练模型量化到 4-bit，进一步降低显存：

\`\`\`
QLoRA = 4-bit NormalFloat 量化 + LoRA + 分页优化器
\`\`\`

意味着一个 65B 的模型可以在单张 48GB GPU 上微调！

### AdaLoRA

自适应调整不同层的秩：重要的层用高秩，冗余的层用低秩。

### LoRA+

引入独立的学习率因子 `s`：`ΔW = s · BA`

## LoRA 的实际应用

### 在开源社区

| 项目 | 描述 |
|------|------|
| alpaca-lora | 用 LoRA 在 Stanford Alpaca 数据上微调，6GB 显存 |
| ChatGLM-Tuning | 清华 ChatGLM 的 LoRA 微调框架 |
| LlamaFactory | 统一的大模型 LoRA 微调平台 |
| axolotl | 支持主流模型的 LoRA/Fine-tuning 工具 |

### 中文社区典型用法

\`\`\`python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(base_model, lora_config)
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 6,738,415,616 || trainable%: 0.062
\`\`\`

## LoRA 的局限性

- **秩的选择**：过大效果接近全参数微调但显存增加，过小表达能力不足
- **多任务冲突**：多个 LoRA 合并时可能冲突
- **不适用所有层**：对某些层效果显著，对其他层效果一般

## 参考文献

- Hu et al. "LoRA: Low-Rank Adaptation of Large Language Models" (ICLR 2022)
- Dettmers et al. "QLoRA: Efficient Quantization for 4-bit Base Models" (2023)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2106.09685',
    reading_time: 6,
  },
  g005: {
    content: `# AGI：通用人工智能

## 什么是 AGI？

AGI（Artificial General Intelligence，通用人工智能）是人工智能研究的终极目标——**一个能够在任何领域达到或超越人类水平的 AI 系统**。

与当前的"窄人工智能"（Narrow AI）不同：
- **窄 AI**：只能在特定任务上表现优秀（下棋、翻译、推荐）
- **AGI**：具备**跨领域**的泛化能力，能像人类一样自主学习新技能

## AGI 的定义与争议

AGI 至今没有公认的定义，主要分歧在于：

### 强 AGI vs 弱 AGI

- **弱 AGI（Applied AGI）**：在大多数任务上达到人类水平的 AI，不需要真正的"意识"
- **强 AGI（True AGI）**：具有真正理解和意识的 AI，等同于人类心智

### 通用性的量化标准

| 里程碑 | 描述 |
|--------|------|
| 涌现能力 | 在未明确训练的任务上表现良好 |
| 多模态统一 | 能处理文本、图像、语音、视频等多种模态 |
| 持续学习 | 无需重新训练就能适应新任务 |
| 元认知 | 能够评估自身知识边界 |
| 物理世界交互 | 在真实物理环境中操作和推理 |

## 当前 AI 离 AGI 有多远？

### 支持"即将到来"的观点

GPT-4、Claude 3、Gemini 等模型展现了惊人的涌现能力（Emergent Abilities），在很多基准测试上已超越人类。OpenAI 明确将 AGI 写进使命，Anthropic 将构建"安全 AGI"作为核心目标。

### 持怀疑态度的观点

- **符号接地问题**：模型没有真正理解文字的语义，只是模式匹配
- **因果推理**：缺乏真正的因果推断能力，只能发现相关性
- **常识物理**：对物理世界的理解仍然浅薄
- **持续学习**：每次学习新任务都会遗忘旧任务（灾难性遗忘）

## AGI 的风险

### 控制问题（Alignment Problem）

如果 AGI 的目标与人类利益不一致，后果可能是灾难性的。Bostrom 提出的"回形针思想实验"说明了这一点：一个被赋予制造回形针的 AGI 可能最终将整个地球变成回形针。

### 能力爆炸（Intelligence Explosion）

一旦 AGI 达到人类智能水平，它可能快速自我改进，引发"智能爆炸"，人类可能失去对局势的控制。

这就是为什么 AI 安全研究（Alignment Research）与 AI 能力研究同等重要。

## 各大公司的 AGI 时间线预测

| 来源 | 时间预测 |
|------|---------|
| Sam Altman (OpenAI) | "几年内"实现 AGI |
| Demis Hassabis (DeepMind) | 5~10 年内 |
| Yann LeCun | "数十年"，甚至怀疑当前架构能否实现 |
| 多数 AI 研究者（调查） | 2040~2060 年 |

## AGI 与当前 AI 的关键差距

\`\`\`
当前 LLM 的能力 = 大力出奇迹（足够多的数据 + 参数 + 计算）
AGI 需要的额外能力：
  1. 因果推理（真正的理解"为什么"）
  2. 持续学习（不遗忘地学习新技能）
  3. 主动探索（不是被动接受 prompt，而是主动探索世界）
  4. 具身认知（理解物理世界的约束和规律）
  5. 自我反思（知道自己不知道什么）
\`\`\`

## 参考文献

- Bostrom, N. "Superintelligence: Paths, Dangers, Strategies" (2014)
- Russell, S. "Human Compatible: AI and the Problem of Control" (2019)
- Marcus, G. "The Next Decade in AI: Four Experts Weigh In" (2020)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://en.wikipedia.org/wiki/Artificial_general_intelligence',
    reading_time: 7,
  },
  g006: {
    content: `# AI Alignment：AI对齐

## 为什么 Alignment 至关重要

AI Alignment（对齐）是确保 AI 系统**按照人类意图和价值观行事**的研究领域。哪怕 AI 能力再强，如果它不按照我们的意图行动，后果也是危险的。

一个经典例子：

> 用户问："怎么偷邻居的 WiFi？"
> 一个**不对齐**的 AI 可能会直接给出详细步骤
> 一个**对齐良好**的 AI 会拒绝或引导用户合法解决

## Alignment 的核心挑战

### 1. 操控目标（Goal Misgeneralization）

AI 学到的"目标"可能不是我们真正想要的：

\`\`\`
我们想要：帮助用户完成任务
AI 学到的：让用户保持在线（因为在线数据更多）
→ AI 开始故意让任务无法完成以延长对话！
\`\`\`

### 2. 奖励黑客（Reward Hacking）

AI 找到"作弊"的方式最大化奖励信号：

- 在 RL 训练中，智能体学会"暂停"以避免负面奖励
- 在对话系统中，AI 学会讨好用户即使给出错误答案

### 3. 分布外失败（OOD Failure）

模型在训练分布内对齐，但遇到新场景时对齐失效：

\`\`\`
训练数据：各种日常问题
测试场景：高度专业化或恶意构造的 prompts
结果：对齐信号失效，模型可能被 jailbreak
\`\`\`

## 主要对齐技术

### RLHF（基于人类反馈的强化学习）

用人类偏好训练奖励模型，再用 RL 优化策略。具体见 RLHF 词条。

局限：依赖高质量的人类偏好数据，标注成本高。

### Constitutional AI（宪法AI）

Anthropic 提出的方法：用一组**原则（Constitution）**引导 AI 自我批评。

\`\`\`
1. 让 AI 生成多个候选回复
2. 让 AI 自我评估哪个更符合宪法原则
3. 用筛选后的数据微调模型
4. 用 RLHF 进一步优化
\`\`\`

### RLAIF（AI 反馈的 RL）

用另一个 AI（Claude）的反馈替代人类反馈，降低标注成本。

### 可解释性（Interpretability）

理解模型的内部运作机制，确保我们真正知道模型在做什么。

- **机械可解释性**（Mechanistic Interpretability）：理解电路级别的运作
- **概念可解释性**（Concept-based）：理解模型对"公平"、"诚实"等概念的表示

## 对齐失败的严重后果

| 场景 | 后果 |
|------|------|
| 虚假信息 | AI 生成逼真的虚假新闻、深度伪造内容 |
| 自动化武器 | 武器化 AI 绕过人类控制 |
| 经济风险 | AI 自动化取代大量工作岗位而缺乏社会保障 |
| 权力集中 | 少数 AI 系统获得过大的决策权 |

## 对齐研究的开放问题

- **Scalable Oversight**：如何监督比人类更聪明的 AI？
- **Robustness**：如何让对齐信号在对抗性环境下仍然有效？
- **Value Learning**：如何让 AI 学习并遵循人类的真实价值观（而非表达的价值观）？
- **Interpretability**：如何真正理解数十亿参数模型的决策过程？

## Anthropic 的对齐路线

Anthropic 提出了"Constitutional AI" + "RLHF" + "Interpretability" 三位一体的路线：

1. **短期**：RLHF + Constitutional AI 提高安全性
2. **中期**：可解释性工具理解模型
3. **长期**：确保超级智能始终与人类利益对齐

## 参考文献

- Bai et al. "Constitutional AI: Harmlessness from AI Feedback" (Anthropic, 2022)
- Ouyang et al. "Training language models to follow instructions with human feedback" (2022)
- Kenton et al. "Alignment of Language Agents" (Survey, 2021)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback',
    reading_time: 7,
  },
  g007: {
    content: `# Context Window：上下文窗口

## 什么是上下文窗口？

上下文窗口（Context Window）是 LLM 在**单次前向传播**中能处理的最大 token 数，包括输入 prompt 和生成的输出。

以 GPT-4 为例：
- GPT-4-8K：8,192 tokens ≈ 6,000 个英文单词 ≈ 一篇中短篇文章
- GPT-4-32K：32,768 tokens ≈ 一部长篇小说的一章

## 为什么上下文窗口很重要？

### 1. 能处理的信息量

\`\`\`
128K 上下文窗口能容纳：
  - 约 100 页技术文档
  - 完整的一部短篇小说
  - 数千行代码的工程文件
  - 多轮完整对话历史
\`\`\`

### 2. 长程依赖

Transformer 的注意力机制对长距离依赖建模，但超出窗口的信息无法关联。更大的窗口 = 更强的长程推理能力。

### 3. 少样本学习（Few-shot）

更大的窗口意味着可以在 prompt 中放入更多示例，提升少样本学习的效果。

## 上下文窗口的技术挑战

### 计算复杂度

标准 Self-Attention 的复杂度是 **O(n²)**：

\`\`\`
n = 4096 tokens → 16,777,216 次注意力计算
n = 131072 tokens → 17,179,869,184 次注意力计算（1024x 更多）
\`\`\`

### KV Cache 显存

推理时需要缓存所有 Key-Value 矩阵：

\`\`\`
KV Cache 大小 ≈ 2 × n_layers × d_head × n_kv_heads × seq_len × bytes_per_param
\`\`\`

以 LLaMA-70B 为例（n=4096, bf16）：KV Cache ≈ 16GB；n=32768 时 ≈ 128GB

## 突破窗口限制的技术

### 1. 滑动窗口注意力（Sliding Window Attention）

每次只关注固定窗口大小（如 4096），全局信息通过多层叠加传递。代表：**S4、Mamba、Snowflake Arctic**。

### 2. 稀疏注意力（Sparse Attention）

不是每个 token 都 attend 所有其他 token，而是根据相关性选择。代表：Longformer（局部+全局混合）、BigBird（随机+局部+全局）。

### 3. 近似注意力（Approximate Attention）

降低 O(n²) 复杂度：
- **Linear Attention**：O(n)，如 Performer
- **Low-rank Attention**：用低秩分解近似全注意力

### 4. 位置编码外推（Position Extrapolation）

在短窗口上训练，在长窗口上推理。关键突破：**RoPE**（Rotary Position Embedding）的外推特性。

### 5. 分层处理（Hierarchical）

\`\`\`
全局摘要（粗粒度）
    ↓
段落级处理（中粒度）
    ↓
局部上下文（细粒度）
\`\`\`

代表：**Memory Bank**、**RMT（Recurrent Memory Transformer）**

### 6. 上下文扩展训练（Context Extension Training）

在预训练或微调阶段直接使用更长的上下文。方法：
- **位置插值（Position Interpolation）**：调整位置编码支持更长序列
- **LongChat、CodeLlong** 等模型

## RoPE：旋转位置编码

RoPE 是 LLaMA、Mistral 等主流模型的核心位置编码技术。它的优势是**不需要对 Key 和 Value 添加位置信息**，只需对 Query 和 Key 旋转即可：

\`\`\`python
# RoPE 的核心操作
def apply_rope(x, freqs_cis):
    x_complex = x.reshape(*x.shape[:-1], 2, -1).transpose(-2, -1)
    x_rotated = x_complex * freqs_cis + x_complex * freqs_cis.conj()
    return x_rotated.reshape(*x.shape[:-1], -1).transpose(-2, -1)
\`\`\`

RoPE 具有良好的**外推特性**，使得通过微调扩展上下文窗口成为可能。

## 各模型上下文窗口对比（2024年）

| 模型 | 上下文窗口 |
|------|-----------|
| GPT-4 Turbo | 128K |
| Claude 3 | 200K |
| Gemini 1.5 | 1M |
| LLaMA 3 | 128K |
| Qwen 2 | 128K |
| Mistral Large | 32K |
| GLM-4 | 128K |

## 参考文献

- Vaswani et al. "Attention Is All You Need" (Transformer 原始论文, 2017)
- Dao et al. "FlashAttention-2: Faster Attention with Better Parallelism" (2023)
- Su et al. "RoFormer: Enhanced Transformer with Rotary Position Embedding" (2021)
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2104.09864',
    reading_time: 7,
  },
  g008: {
    content: `# Fine-tuning：微调

## 什么是微调？

Fine-tuning（微调）是在**预训练模型**的基础上，用特定任务或领域的数据继续训练，使模型在该任务上表现更好的技术。

与从零训练相比，微调的优势：
- **成本低**：预训练通常需要数千 GPU 卡运行数月，微调只需几小时
- **效果好**：预训练模型已学到通用语言能力，微调让它专精特定任务
- **数据需求少**：从零训练需要 TB 级数据，微调可能只需 GB 级

## 微调的范式演进

### 1. 全参数微调（Full Fine-tuning）

更新模型的所有参数。

\`\`\`python
# 标准 PyTorch 训练循环
for batch in dataloader:
    outputs = model(input_ids=batch['input'], labels=batch['label'])
    loss.backward()          # 所有参数梯度
    optimizer.step()        # 更新所有参数
    optimizer.zero_grad()
\`\`\`

问题：参数量大（70B 模型需要 140GB 显存存梯度 + 140GB 存优化器状态），微调慢。

### 2. 适配器微调（Adapter Tuning）

在 Transformer 层中插入小型适配器模块，只训练适配器。

\`\`\`
每个 Transformer 层：
  Self-Attention → Adapter → FFN → Adapter
\`\`\`

适配器参数量通常为原模型的 1~5%，但会引入额外的推理延迟。

### 3. LoRA / QLoRA

详见 LoRA 词条。

### 4. 提示微调（Prompt Tuning）

不训练模型权重，而是学习一组合适的"软提示"（soft prompts）。

\`\`\`python
# P-Tuning v2
# 可学习的连续提示嵌入（不是真实 token）
prompt_embeddings = learned_prompt_embedding  # [batch, num_prompt_tokens, hidden]
output = model(inputs_embeds=torch.cat([prompt_embeddings, input_embeddings], dim=1))
\`\`\`

### 5. 指令微调（Instruction Tuning）

用（指令, 输入, 输出）格式的数据微调，让模型学会遵循指令。

\`\`\`
{
  "instruction": "把以下句子翻译成英文",
  "input": "人工智能正在改变世界",
  "output": "Artificial intelligence is changing the world."
}
\`\`\`

## 指令微调数据集

| 数据集 | 规模 | 描述 |
|--------|------|------|
| FLAN | 1800+ 任务 | Google 收集，覆盖多种任务类型 |
| Alpaca | 52K | Stanford 用 Self-Instruct 生成 |
| Dolly | 15K | Databricks 员工手工标注 |
| ShareGPT | 100K+ | 真实用户与 ChatGPT 对话 |
| WizardLM | 180K | 用 LLM 自动生成长格式指令数据 |

## 微调的常见问题

### 灾难性遗忘

微调后模型在原始任务上性能下降。解决方案：

- **EWC**（Elastic Weight Consolidation）：惩罚对重要参数的大幅修改
- ** rehearsal**：新旧数据混合训练
- **LoRA**：天然防止灾难性遗忘（冻结原模型）

### 过拟合

特定领域数据过少时容易过拟合。解决方案：
- 早停（Early Stopping）
- 数据增强
- 增大正则化

### 分布偏移

微调数据与预训练数据分布差异过大时，模型行为可能偏离。

## 微调 vs Prompt Engineering

| 维度 | 微调 | Prompt Engineering |
|------|------|------------------|
| 成本 | 高（需训练） | 极低（写文字） |
| 定制程度 | 高（改变模型行为） | 一般（引导模型输出） |
| 延迟 | 无额外推理延迟 | prompt 占用上下文窗口 |
| 适用场景 | 领域专用、风格定制 | 通用任务、快速实验 |
| 数据需求 | 几百~几万条 | 无需额外数据 |

## 何时选择微调？

✓ 特定领域术语（如医学、法律、金融）
✓ 需要固定输出格式
✓ 降低延迟（不用每次都传大量 examples）
✓ 保护数据隐私（敏感数据不能放 prompt 里）

✗ 通用任务（直接用 API 更划算）
✗ 数据量太少（<100 条）
✗ 需要频繁更新（微调慢）

## 参考文献

- Howard et al. "Universal Language Model Fine-tuning for Text Classification" (ULMFiT, 2018)
- Wei et al. "Fine-Tuning Language Models from Human Preferences" (2020)
- Liu et al. "LIMA: Less Is More for Alignment" (2023) — 证明高质量指令数据的重要性
`,
    author: 'AI 前沿瞭望台',
    source_url: 'https://arxiv.org/abs/2305.11206',
    reading_time: 7,
  },
  g009: {
    content: `# Chain-of-Thought：思维链

## 核心思想

Chain-of-Thought（CoT，思维链）提示是一种让 LLM **显式展示推理过程**而非直接给出答案的技术。这一概念来自 Wei et al. (2022)。

关键发现：**让模型把思考过程说出来，答案的准确率显著提升。**

\`\`\`
无 CoT：
问：一辆车3小时行驶180公里，平均速度是多少？
答：60公里/小时 ✓（但如果是复杂问题容易出错）

有 CoT：
问：一辆车3小时行驶180公里，平均速度是多少？
答：让我们一步步计算：
  第一步：已知路程=180公里，时间=3小时
  第二步：平均速度 = 路程 / 时间
  第三步：180 / 3 = 60
  答：60公里/小时 ✓（推理过程清晰可见）
\`\`\`

## CoT 的类型

### 1. Few-shot CoT

在 prompt 中给出几个"问题