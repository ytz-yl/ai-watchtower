// AI前沿瞭望台 - 静态演示数据
// 实际运行时由 Cron 脚本每日自动更新

export interface Paper {
  id: string
  title: string
  titleCn: string
  authors: string[]
  abstract: string
  abstractCn: string
  category: string
  tags: string[]
  published: string
  url: string
  pdfUrl: string
}

export interface NewsItem {
  id: string
  title: string
  titleCn: string
  source: string
  sourceUrl: string
  publishedAt: string
  summary: string
  summaryCn: string
  tags: string[]
  featured?: boolean
}

export interface GlossaryItem {
  id: string
  term: string
  termCn: string
  definition: string
  definitionCn: string
  tags: string[]
  updated: string
}

export const papers: Paper[] = [
  {
    id: '2603.18004',
    title: 'Unified Spatio-Temporal Token Scoring for Efficient Video VLMs',
    titleCn: '统一时空Token评分：高效视频视觉语言模型',
    authors: ['Jianrui Zhang', 'Yue Yang', 'Rohun Tripathi'],
    abstract: 'Token pruning is essential for enhancing the computational efficiency of vision-language models (VLMs), particularly for video-based tasks where temporal redundancy is prevalent. We introduce Spatio-Temporal Token Scoring (STTS), a lightweight module that prunes vision tokens across both the ViT and LLM without text conditioning or token merging, fully compatible with end-to-end training. STTS prunes 50% of vision tokens throughout the entire architecture, resulting in a 62% improvement in efficiency during both training and inference with only a 0.7% drop in average performance across 13 short and long video QA tasks.',
    abstractCn: '本文提出时空Token评分（STTS），一种轻量级模块，可在视频视觉语言模型的视觉Transformer和大语言模型中同时剪枝50%的视觉Token，训练和推理效率提升62%，而平均性能仅下降0.7%。该方法无需文本条件或Token合并，与端到端训练完全兼容。',
    category: 'cs.CV',
    tags: ['Video Understanding', 'VLM', 'Efficiency'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.18004',
    pdfUrl: 'https://arxiv.org/pdf/2603.18004',
  },
  {
    id: '2603.18003',
    title: 'Universal Skeleton Understanding via Differentiable Rendering and MLLMs',
    titleCn: '通过可微渲染与多模态大语言模型实现通用骨架理解',
    authors: ['Ziyi Wang', 'Peiming Li', 'Xinshun Wang'],
    abstract: 'Multimodal large language models (MLLMs) exhibit strong visual-language reasoning yet cannot directly process structured non-visual data such as human skeletons. We present SkeletonLLM, which achieves universal skeleton understanding by translating arbitrary skeleton sequences into the MLLM\'s native visual modality via DrAction, a differentiable format-agnostic renderer. By making the pipeline end-to-end differentiable, MLLM gradients can directly guide rendering to produce task-informative visual tokens.',
    abstractCn: '本文提出SkeletonLLM，通过可微渲染器DrAction将任意骨架序列转换为视觉模态，实现多模态大语言模型的通用骨架理解。由于pipeline端到端可微，MLLM梯度可直接指导渲染生成任务相关的视觉Token，在动作识别、描述、推理等任务上展现出强大的跨格式泛化能力。',
    category: 'cs.CV',
    tags: ['Skeleton Understanding', 'MLLM', 'Multimodal'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.18003',
    pdfUrl: 'https://arxiv.org/pdf/2603.18003',
  },
  {
    id: '2603.18002',
    title: 'Loc3R-VLM: Language-based Localization and 3D Reasoning with Vision-Language Models',
    titleCn: 'Loc3R-VLM：基于视觉语言模型的语言定位与三维推理',
    authors: ['Kevin Qu', 'Haozhe Qi', 'Mihai Dusmanu'],
    abstract: 'Multimodal Large Language Models have made impressive progress in connecting vision and language but struggle with spatial understanding and viewpoint-aware reasoning. We introduce Loc3R-VLM, a framework that equips 2D Vision-Language Models with advanced 3D understanding from monocular video via two joint objectives: global layout reconstruction and explicit situation modeling. Leveraging lightweight camera pose priors from a pretrained 3D foundation model, Loc3R-VLM achieves state-of-the-art performance in language-based localization.',
    abstractCn: '本文提出Loc3R-VLM框架，通过全局布局重建和显式情境建模两个联合目标，使2D视觉语言模型获得先进的三维理解能力。该框架利用预训练3D基础模型的轻量级相机位姿先验，在语言定位任务上达到最优性能，为视觉语言模型开辟了3D空间推理的新路径。',
    category: 'cs.CV',
    tags: ['3D Reasoning', 'VLM', 'Spatial Understanding'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.18002',
    pdfUrl: 'https://arxiv.org/pdf/2603.18002',
  },
  {
    id: '2603.17969',
    title: 'Specification-Aware Distribution Shaping for Robotics Foundation Models',
    titleCn: '机器人基础模型的形式化规范感知动作分布塑形',
    authors: ['Sadık Bera Yüksel', 'Derya Aksaray', 'Author 3'],
    abstract: 'Robotics foundation models have demonstrated strong capabilities in executing natural language instructions across diverse tasks, yet they lack formal guarantees on safety and satisfaction of time-dependent specifications. We propose a specification-aware action distribution optimization framework that enforces Signal Temporal Logic (STL) constraints during execution of a pretrained robotics foundation model without modifying its parameters, by reasoning over the remaining horizon using forward dynamics propagation.',
    abstractCn: '本文提出一种规范感知动作分布优化框架，在不修改预训练机器人基础模型参数的情况下，通过前向动力学传播推理，在每个决策步骤计算满足信号时序逻辑（STL）约束的最小修正动作分布。该方法在多种环境和复杂规范下验证了框架的有效性。',
    category: 'cs.AI',
    tags: ['Robotics', 'Foundation Model', 'Temporal Logic'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17969',
    pdfUrl: 'https://arxiv.org/pdf/2603.17969',
  },
  {
    id: '2603.17965',
    title: 'LaDe: Unified Multi-Layered Graphic Media Generation and Decomposition',
    titleCn: 'LaDe：统一的多层级图文媒体生成与分解',
    authors: ['Vlad-Constantin Lungu-Stan', 'Ionut Mironica', 'Mariana-Iuliana Georgescu'],
    abstract: 'Media design layer generation enables fully editable layered design documents such as posters and logos using natural language. Existing methods restrict outputs to fixed layer counts or require spatially continuous regions. We propose LaDe, a latent diffusion framework that generates a flexible number of semantically meaningful layers, combining an LLM-based prompt expander, a Latent Diffusion Transformer with 4D RoPE, and an RGBA VAE. LaDe supports text-to-image generation, text-to-layers generation, and media design decomposition.',
    abstractCn: '本文提出LaDe，一个潜在扩散框架，可根据自然语言生成灵活数量的语义化图层。它结合LLM提示扩展器、配备4D RoPE的潜在扩散Transformer和RGBA VAE三大组件，支持图文生成、图文分层生成和媒体设计分解三大任务，在图文对齐任务上显著超越基线方法。',
    category: 'cs.CV',
    tags: ['Image Generation', 'Layered Media', 'Latent Diffusion'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17965',
    pdfUrl: 'https://arxiv.org/pdf/2603.17965',
  },
  {
    id: '2603.17948',
    title: 'VideoAtlas: Navigating Long-Form Video in Logarithmic Compute',
    titleCn: 'VideoAtlas：以对数计算量导航长视频',
    authors: ['Mohamed Eltahir', 'Ali Habibullah', 'Yazan Alshoibi'],
    abstract: 'Extending language models to video introduces two key challenges: representation and long-context. Existing methods rely on lossy approximations and caption-based pipelines that collapse video into text. We introduce VideoAtlas, a hierarchical grid environment to represent video as simultaneously lossless, navigable, scalable, and caption-free. The grid structure ensures access depth grows only logarithmically with video length. VideoAtlas enables Video-RLM with parallel Master-Worker architecture, scaling from 1-hour to 10-hour benchmarks with minimal accuracy degradation.',
    abstractCn: '本文提出VideoAtlas，以分层网格环境实现视频的无损、可导航、可扩展表示，计算复杂度仅随视频长度对数增长。VideoAtlas使得Master-Worker并行架构的Video-RLM成为可能，在1小时到10小时视频基准测试中准确率保持稳定，展示了结构化环境导航是视频理解的一条可行且可扩展的路径。',
    category: 'cs.CV',
    tags: ['Long-Form Video', 'Video Understanding', 'Efficiency'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17948',
    pdfUrl: 'https://arxiv.org/pdf/2603.17948',
  },
  {
    id: '2603.17947',
    title: 'Unified Policy Value Decomposition for Rapid Adaptation',
    titleCn: '统一策略价值分解实现快速任务适应',
    authors: ['Cristiano Falorsi', 'Luca Ciardiello', 'Luca Manneschi'],
    abstract: 'Rapid adaptation in complex control systems remains a central challenge in reinforcement learning. We introduce a framework where policy and value functions share a low-dimensional coefficient vector (goal embedding) that captures task identity and enables immediate adaptation to novel tasks without retraining. The bilinear actor-critic decomposition multiplies task-specific coefficients with learned value basis functions, reminiscent of gain modulation in Layer 5 pyramidal neurons.',
    abstractCn: '本文提出一种策略与价值函数共享低维目标嵌入系数的强化学习框架，可在测试时通过单次前向传播实现零样本快速适应，无需梯度更新。在MuJoCo Ant多方向运动任务上的实验表明，共享低维目标嵌入是高维控制系统中高效结构化适应的有效机制。',
    category: 'cs.LG',
    tags: ['Reinforcement Learning', 'Rapid Adaptation', 'Policy Learning'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17947',
    pdfUrl: 'https://arxiv.org/pdf/2603.17947',
  },
  {
    id: '2603.17942',
    title: 'Efficient Training-Free Multi-Token Prediction via Embedding-Space Probing',
    titleCn: '基于嵌入空间探测的高效免训练多Token预测',
    authors: ['Raghavv Goel', 'Mukul Gagrani', 'Mingu Lee'],
    abstract: 'Large language models exhibit latent multi-token prediction capabilities despite being trained solely for next-token generation. We propose a training-free MTP approach that probes an LLM using on-the-fly mask tokens from its embedding space, enabling parallel prediction of future tokens without modifying model weights. Across benchmarks, our method consistently outperforms existing training-free baselines, increasing acceptance length by ~12% on LLaMA3 and achieving throughput gains of up to 15-19%.',
    abstractCn: '本文提出一种免训练多Token预测方法，通过探测大语言模型嵌入空间中的即时掩码Token来并行预测未来Token，无需修改模型权重。在LLaMA3和Qwen3上的实验表明，该方法在无需辅助草稿模型的情况下，接受长度提升约12%，吞吐量增益达15-19%。',
    category: 'cs.CL',
    tags: ['LLM', 'Inference Acceleration', 'Multi-Token Prediction'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17942',
    pdfUrl: 'https://arxiv.org/pdf/2603.17942',
  },
  {
    id: '2603.17915',
    title: 'IndicSafe: A Benchmark for Evaluating Multilingual LLM Safety in South Asia',
    titleCn: 'IndicSafe：南亚多语言LLM安全性评测基准',
    authors: ['Priyaranjan Pattnayak', 'Sanchari Chowdhuri', 'Author 3'],
    abstract: 'As large language models are deployed in multilingual settings, their safety behavior in culturally diverse low-resource languages remains poorly understood. We present IndicSafe, the first systematic evaluation of LLM safety across 12 Indic languages spoken by over 1.2 billion people. Using 6,000 culturally grounded prompts spanning caste, religion, gender, health, and politics, we assess 10 leading LLMs and reveal critical safety generalization gaps, showing that safety alignment does not transfer evenly across languages.',
    abstractCn: '本文提出IndicSafe——首个覆盖12种南亚语言（超12亿使用者）的LLM安全评测基准，通过涵盖种姓、宗教、性别、健康和政治领域的6000个文化情境提示，对10个主流LLM进行系统性评估。结果揭示了关键的安全泛化差距，表明安全对齐不能均匀地跨语言转移。',
    category: 'cs.CL',
    tags: ['LLM Safety', 'Multilingual', 'Benchmark'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17915',
    pdfUrl: 'https://arxiv.org/pdf/2603.17915',
  },
  {
    id: '2603.17945',
    title: 'ShapleyLaw: A Game-Theoretic Approach to Multilingual Scaling Laws',
    titleCn: 'ShapleyLaw：多语言扩展定律的合作博弈论方法',
    authors: ['Author 1', 'Author 2', 'Author 3'],
    abstract: 'In multilingual pretraining, test loss is heavily influenced by language mixture ratios. Existing multilingual scaling laws do not measure the cross-lingual transfer effect, resulting in suboptimal mixture ratios. We consider multilingual pretraining as a cooperative game where each language acts as a player jointly contributing to pretraining. We quantify cross-lingual transfer using Shapley values and propose ShapleyLaw, which outperforms baseline methods in model performance prediction and language mixture optimization.',
    abstractCn: '本文将多语言预训练建模为合作博弈，将每种语言视为共同贡献预训练的参与者，利用Shapley值量化跨语言迁移效应，提出ShapleyLaw多语言扩展定律。该方法在模型性能预测和语言混合优化任务上均显著超越基线方法，为多语言训练数据配比优化提供了理论基础。',
    category: 'cs.CL',
    tags: ['Multilingual LLM', 'Scaling Laws', 'Game Theory'],
    published: '2026-03-19',
    url: 'https://arxiv.org/abs/2603.17945',
    pdfUrl: 'https://arxiv.org/pdf/2603.17945',
  },
]

export const newsItems: NewsItem[] = [
  {
    id: 'n001',
    title: "Nvidia Compares OpenClaw to GPT's Disruption: 'A New Inflection Point for AI Agents'",
    titleCn: '英伟达将OpenClaw比作GPT的颠覆："AI Agent的新拐点"',
    source: 'The Next Platform',
    sourceUrl: 'https://www.nextplatform.com/ai/2026/03/17/nvidia-says-openclaw-is-to-agentic-ai-what-gpt-was-to-chattybots/',
    publishedAt: '2026-03-18',
    summary: "Nvidia's AI research division published a blog post positioning OpenClaw and Claude Code as the catalysts for a new wave of agentic AI adoption, drawing parallels to how GPT sparked the LLM revolution.",
    summaryCn: '英伟达AI研究部门发表博客文章，将OpenClaw和Claude Code定位为新一轮Agent式AI普及的催化剂，将其与GPT引发的大语言模型革命相提并论。',
    tags: ['OpenClaw', 'Nvidia', 'AI Agent'],
    featured: true,
  },
  {
    id: 'n002',
    title: "China's Ministry of State Security Issues First 'AI Agent Security Guidelines'",
    titleCn: '中国国家安全部发布首份"AI Agent安全指南"',
    source: 'Reuters / Digitimes',
    sourceUrl: 'https://www.digitimes.com/news/a20260317PD227/china-openclaw-ai-agent-cybersecurity-data.html',
    publishedAt: '2026-03-17',
    summary: "Beijing issued its inaugural security guidelines specifically targeting AI agents, citing data sovereignty and cybersecurity concerns, in what analysts view as an attempt to regulate the rapidly growing agentic AI market.",
    summaryCn: '北京发布了首份专门针对AI Agent的安全指南，引用数据主权和网络安全担忧，分析师认为这是监管快速增长的Agent式AI市场的尝试。',
    tags: ['Policy', 'China', 'Security'],
    featured: true,
  },
  {
    id: 'n003',
    title: 'OpenAI Launches GPT-5 with Native Tool Use and Real-Time Reasoning',
    titleCn: 'OpenAI发布GPT-5：原生工具使用与实时推理',
    source: 'OpenAI Blog',
    sourceUrl: 'https://openai.com/blog/gpt-5',
    publishedAt: '2026-03-16',
    summary: "GPT-5 marks a significant leap with native tool-calling, multi-step real-time reasoning, and a 1M token context window, setting new records on reasoning benchmarks while reducing hallucination rates by 60%.",
    summaryCn: 'GPT-5以原生工具调用、多步实时推理和100万token上下文窗口实现了重大飞跃，在推理基准上创下新纪录，同时将幻觉率降低60%。',
    tags: ['GPT-5', 'OpenAI', 'LLM'],
    featured: true,
  },
  {
    id: 'n004',
    title: 'DeepSeek-R2 Outperforms GPT-4 Turbo on MMLU with Open-Source Release',
    titleCn: 'DeepSeek-R2开源发布：MMLU基准超越GPT-4 Turbo',
    source: 'DeepSeek Blog',
    sourceUrl: 'https://deepseek.com/blog/r2',
    publishedAt: '2026-03-17',
    summary: 'Chinese AI lab DeepSeek released R2, a 1.8T MoE model that matches GPT-4 Turbo performance on major benchmarks while using only one-fifth of the inference compute.',
    summaryCn: '中国AI实验室DeepSeek发布了R2模型，一个在主流基准测试中与GPT-4 Turbo性能相当、同时仅用五分之一推理计算量的1.8万亿参数MoE模型。',
    tags: ['DeepSeek', 'MoE', 'Open Source'],
  },
  {
    id: 'n005',
    title: 'Google Gemini 2.0 Ultra Achieves State-of-the-Art on Math and Coding Benchmarks',
    titleCn: 'Google Gemini 2.0 Ultra在数学和代码基准上实现最优',
    source: 'Google AI Blog',
    sourceUrl: 'https://blog.google/technology/ai/gemini-2-ultra',
    publishedAt: '2026-03-15',
    summary: 'Gemini 2.0 Ultra sets new records on MATH and HumanEval benchmarks, signalling intense competition in frontier AI with GPT-5 and Claude 4 both launching this quarter.',
    summaryCn: 'Gemini 2.0 Ultra在MATH和HumanEval基准上创下新纪录，标志着前沿AI竞争日益激烈——GPT-5和Claude 4均在本季度发布。',
    tags: ['Gemini', 'Google', 'Benchmark'],
  },
  {
    id: 'n006',
    title: 'AI Agents Write 30% of New Code at Major Tech Companies in 2026',
    titleCn: '2026年AI Agent已代写主要科技公司30%的新代码',
    source: 'IEEE Spectrum',
    sourceUrl: 'https://spectrum.ieee.org/ai-coding-2026',
    publishedAt: '2026-03-14',
    summary: 'A new survey reveals that AI agents now contribute more than 30% of code committed at companies like Google, Microsoft, and Meta, up from just 8% in 2024.',
    summaryCn: '一项新调查显示，AI Agent现在为谷歌、微软、Meta等公司的代码提交量贡献超过30%，而2024年这一比例仅为8%。',
    tags: ['AI Agent', 'Code Generation', 'Industry'],
  },
  {
    id: 'n007',
    title: 'Stanford HELM Benchmark Updated: 100+ New Tasks Including Agentic Workflows',
    titleCn: '斯坦福HELM基准更新：新增100+任务，含Agent工作流评测',
    source: 'Stanford CRFM',
    sourceUrl: 'https://crfm.stanford.edu/helm',
    publishedAt: '2026-03-13',
    summary: 'HELM now includes agentic benchmarks measuring how well models complete multi-step real-world tasks, adding 100+ new evaluation scenarios across 8 domains.',
    summaryCn: 'HELM现在包含Agent基准测试，衡量模型完成多步骤现实世界任务的能力，新增跨越8个领域的100余个评测场景。',
    tags: ['Benchmark', 'Stanford', 'AI Agent'],
  },
  {
    id: 'n008',
    title: 'Mistral AI Releases Mixtral 8x22B: Best Open-Source MoE Model to Date',
    titleCn: 'Mistral AI发布Mixtral 8x22B：迄今最强开源MoE模型',
    source: 'Mistral AI',
    sourceUrl: 'https://mistral.ai/news/mixtral-8x22b',
    publishedAt: '2026-03-12',
    summary: 'Mixtral 8x22B delivers GPT-4-level performance with only 39B active parameters and fully open weights under Apache 2.0 license, becoming the new standard for efficient open-source deployment.',
    summaryCn: 'Mixtral 8x22B仅用390亿活跃参数即可达到GPT-4级性能，且完全以Apache 2.0许可开源权重，成为高效开源部署的新标杆。',
    tags: ['Mistral', 'MoE', 'Open Source'],
  },
]

export const glossaryItems: GlossaryItem[] = [
  {
    id: 'g001',
    term: 'RLHF',
    termCn: '基于人类反馈的强化学习',
    definition: 'Reinforcement Learning from Human Feedback (RLHF) is a training paradigm that fine-tunes a language model using human preference data to align model outputs with human values and intentions. It typically involves training a reward model from human rankings, then fine-tuning the LLM with reinforcement learning.',
    definitionCn: '基于人类反馈的强化学习（RLHF）是一种训练范式，通过人类偏好数据对语言模型进行微调，使模型输出与人类价值观和意图保持一致。它通常包括从人类排序中训练奖励模型，然后用强化学习微调LLM。',
    tags: ['LLM', 'Alignment', 'Training'],
    updated: '2026-03-19',
  },
  {
    id: 'g002',
    term: 'RAG',
    termCn: '检索增强生成',
    definition: 'Retrieval-Augmented Generation (RAG) combines a language model with a retrieval system, allowing the model to ground its responses in external documents for more accurate and up-to-date answers. RAG reduces hallucinations and enables knowledge-intensive tasks without fine-tuning.',
    definitionCn: '检索增强生成（RAG）将语言模型与检索系统相结合，使模型能够基于外部文档来生成回答，从而获得更准确、更及时的结果。RAG减少幻觉，使知识密集型任务无需微调即可完成。',
    tags: ['LLM', 'Knowledge', 'Retrieval'],
    updated: '2026-03-19',
  },
  {
    id: 'g003',
    term: 'MoE',
    termCn: '混合专家模型',
    definition: 'Mixture of Experts (MoE) is a neural network architecture that activates only a subset of "expert" networks per input. While total parameters can reach trillions, only a small fraction (e.g., 37B) are active per token, enabling massive scale with manageable compute.',
    definitionCn: '混合专家模型（MoE）是一种神经网络架构，对每个输入只激活部分"专家"网络。虽然参数量可达万亿级，但每个token只激活少量参数（如370亿），实现了在可控计算量下的超大模型规模。',
    tags: ['Architecture', 'Efficiency', 'LLM'],
    updated: '2026-03-19',
  },
  {
    id: 'g004',
    term: 'LoRA',
    termCn: '低秩自适应',
    definition: 'Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning technique that adds small trainable rank-decomposition matrices to existing frozen model weights. This enables fine-tuning massive models on consumer GPUs with as little as 1-5% of trainable parameters.',
    definitionCn: '低秩自适应（LoRA）是一种参数高效微调技术，通过向冻结的模型权重添加小型可训练的低秩分解矩阵实现。这使得在消费级GPU上用仅1-5%的可训练参数即可微调超大规模模型。',
    tags: ['Fine-tuning', 'Efficiency', 'LLM'],
    updated: '2026-03-19',
  },
  {
    id: 'g005',
    term: 'AGI',
    termCn: '通用人工智能',
    definition: 'Artificial General Intelligence (AGI) refers to a hypothetical AI system with the ability to understand, learn, and apply intelligence across any domain at a human-level or beyond. AGI remains an open research goal with significant philosophical and technical debates.',
    definitionCn: '通用人工智能（AGI）指具有在任意领域达到或超越人类水平地理解、学习和应用智能能力的人工智能系统。AGI仍是一个开放的研究目标，涉及深刻的哲学和技术争议。',
    tags: ['Concept', 'Future', 'AI'],
    updated: '2026-03-19',
  },
  {
    id: 'g006',
    term: 'Alignment',
    termCn: 'AI对齐',
    definition: 'AI alignment is the field of ensuring AI systems act in accordance with human intentions and values. Key approaches include RLHF, Constitutional AI, and safety constraints. Misaligned AI can pursue goals in unintended and potentially harmful ways.',
    definitionCn: 'AI对齐是确保人工智能系统行为符合人类意图和价值观的研究领域。主要方法包括RLHF、宪法AI和安全约束。未对齐的AI可能以非预期和潜在有害的方式追求目标。',
    tags: ['Safety', 'Ethics', 'LLM'],
    updated: '2026-03-19',
  },
  {
    id: 'g007',
    term: 'Context Window',
    termCn: '上下文窗口',
    definition: 'The context window is the maximum number of tokens (words/pieces of words) an LLM can process in a single forward pass. A larger context window enables the model to consider more prior conversation and documents, critical for long-document tasks.',
    definitionCn: '上下文窗口是大语言模型在单次前向传播中可以处理的最大token数（词/词片段）。更大的上下文窗口使模型能够考虑更多的先前对话和文档，对长文档任务至关重要。',
    tags: ['LLM', 'Architecture'],
    updated: '2026-03-19',
  },
  {
    id: 'g008',
    term: 'Fine-tuning',
    termCn: '微调',
    definition: 'Fine-tuning is the process of taking a pre-trained model and continuing to train it on a specific domain or task dataset. Unlike pre-training from scratch, fine-tuning starts with an already capable model and adapts it to a target use case efficiently.',
    definitionCn: '微调是指将预训练模型在特定领域或任务的 dataset 上继续训练。与从零开始预训练不同，微调从一个已有能力的模型出发，高效地将其适应至目标用例。',
    tags: ['Training', 'LLM'],
    updated: '2026-03-19',
  },
  {
    id: 'g009',
    term: 'Chain-of-Thought (CoT)',
    termCn: '思维链',
    definition: 'Chain-of-Thought prompting encourages an LLM to explicitly verbalize its intermediate reasoning steps before giving a final answer. This significantly improves performance on complex multi-step reasoning tasks like math word problems and logical deduction.',
    definitionCn: '思维链（CoT）提示鼓励大语言模型在给出最终答案前显式表达其中间推理步骤。这显著提升了数学应用题和逻辑推理等复杂多步骤推理任务的性能。',
    tags: ['Prompting', 'Reasoning', 'LLM'],
    updated: '2026-03-19',
  },
  {
    id: 'g010',
    term: 'Diffusion Model',
    termCn: '扩散模型',
    definition: 'Diffusion models are a class of generative models that learn to create data by reversing a gradual noising process. They have achieved state-of-the-art results in image, audio, and video generation, powering tools like DALL-E, Stable Diffusion, and Sora.',
    definitionCn: '扩散模型是一类生成模型，通过学习逆转渐进式噪声过程来生成数据。它们在图像、音频和视频生成任务上达到了最优效果，支撑着DALL-E、Stable Diffusion和Sora等工具。',
    tags: ['Generation', 'CV', 'GenAI'],
    updated: '2026-03-19',
  },
]
