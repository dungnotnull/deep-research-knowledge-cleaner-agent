# PROJECT-detail.md
## deep-research-knowledge-cleaner (DRKC) — Full Technical Specification

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [System Architecture](#3-system-architecture)
4. [Component Deep-Dive](#4-component-deep-dive)
5. [ML/DL Model Selection](#5-mldl-model-selection)
6. [Data Flow & Pipeline](#6-data-flow--pipeline)
7. [API Design](#7-api-design)
8. [Storage Design](#8-storage-design)
9. [LLM Integration Layer](#9-llm-integration-layer)
10. [Research Paper Crawler (Knowledge Brain Feed)](#10-research-paper-crawler-knowledge-brain-feed)
11. [AI Slop Detection Engine](#11-ai-slop-detection-engine)
12. [Security & Ethical Considerations](#12-security--ethical-considerations)
13. [Performance & Scalability](#13-performance--scalability)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment](#15-deployment)

---

## 1. Project Overview

**deep-research-knowledge-cleaner (DRKC)** is an autonomous research agent system that:
- Accepts any research topic from a user
- Crawls and aggregates content from 10–200+ raw sources
- Applies a multi-layer quality filter (heuristic + ML reranking) to select the top 50 most authoritative, non-AI-polluted documents
- Structures them into a categorized knowledge base
- Synthesizes a comprehensive Markdown research report with citations
- Continuously updates a persistent **Second Knowledge Brain** that improves agent accuracy over time

**Primary Users:** Developers, researchers, technical writers, product managers who need deep, trustworthy technical knowledge quickly.

---

## 2. Problem Statement & Motivation

### The AI Slop Crisis
The modern web is increasingly polluted with AI-generated content that:
- Sounds authoritative but contains subtle inaccuracies
- Prioritizes SEO keyword density over information accuracy
- Lacks citations, reproducible examples, or verifiable claims
- Contaminates RAG pipelines and LLM knowledge bases with low-quality signal

### The Research Bottleneck
Manual deep research on a technical topic (e.g., "DDD in NestJS") requires:
- 4–8 hours of reading, evaluating, and cross-referencing
- Expert judgment to distinguish primary from secondary sources
- Constant vigilance against circular citation (AI articles citing other AI articles)

### DRKC's Solution
An automated agent that does this in 15–30 minutes with higher consistency and full audit trails.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│              (CLI / REST API / Web UI)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ Topic Input
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH ORCHESTRATOR                        │
│   (NestJS Service hosting LangGraph state machine)              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Keyword  │→ │  Crawl   │→ │  Filter  │→ │  Synthesis   │   │
│  │ Expander │  │ Manager  │  │ Reranker │  │    Agent     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                    │            │
│                                          ┌─────────▼─────────┐ │
│                                          │  Knowledge Brain  │ │
│                                          │     Updater       │ │
│                                          └───────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │              │              │               │
         ▼              ▼              ▼               ▼
    ┌─────────┐   ┌──────────┐  ┌──────────┐   ┌──────────────┐
    │   LLM   │   │ crawl4ai │  │   ML     │   │  Vector DB   │
    │   API   │   │ Workers  │  │ Reranker │   │  (Chroma /   │
    │(Claude/ │   │(parallel)│  │  (BGE /  │   │   Qdrant)    │
    │  GPT)   │   │          │  │  Cohere) │   │              │
    └─────────┘   └──────────┘  └──────────┘   └──────────────┘
```

### Architecture Pattern: Agentic RAG with LangGraph
- **LangGraph** manages the agent state machine — each node is a discrete, testable unit
- State is passed explicitly between nodes (no hidden global state)
- Conditional edges allow retry logic, fallback sources, and quality gates
- Human-in-the-loop checkpoint supported at the "top 50 review" stage

---

## 4. Component Deep-Dive

### 4.1 Keyword Expander Node
**Input:** Raw user topic string
**Output:** `keyword-graph.json`

```typescript
interface KeywordGraph {
  coreTopic: string;
  primaryKeywords: string[];         // Direct synonyms, technical terms
  adjacentKeywords: string[];        // Related concepts worth crawling
  targetDomains: string[];           // e.g., ["github.com", "arxiv.org", "nestjs.com"]
  academicSearchQueries: string[];   // Optimized for Google Scholar / Semantic Scholar
  githubSearchQueries: string[];     // e.g., "topic:domain-driven-design language:typescript"
  authorityAuthors: string[];        // Known experts (to boost their content)
}
```

**LLM Prompt Strategy:** Chain-of-thought prompting asking the LLM to think like a senior engineer building a reading list. Uses structured output (JSON mode).

---

### 4.2 Crawl Manager Node
**Framework:** `crawl4ai` (Python microservice called from NestJS via HTTP or gRPC)
**Pattern:** Parallel async crawling with semaphore-limited concurrency (max 10 concurrent)

**Source Targets:**
| Source | Method | Priority |
|--------|--------|----------|
| Google Scholar | Scrapy + Scholar API | High |
| Semantic Scholar | Official API (free, 100 req/5min) | High |
| ArXiv | Official API (no rate limit) | High |
| GitHub | GitHub Search API + README crawl | High |
| Official Docs | crawl4ai with JS rendering | High |
| npm/PyPI | Package metadata + README | Medium |
| Dev.to / Hashnode | RSS + crawl | Medium |
| HackerNews (Ask HN) | Algolia HN API | Low |
| YouTube transcripts | yt-dlp + transcript API | Low (optional) |

**Output format per document:**
```typescript
interface RawDocument {
  id: string;           // SHA256 hash of URL
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  contentMarkdown: string;
  wordCount: number;
  sourceType: 'paper' | 'github' | 'docs' | 'blog' | 'forum';
  rawMetadata: Record<string, any>;
  crawledAt: string;    // ISO 8601
}
```

---

### 4.3 Filter & Reranker Node
Three-stage pipeline:

**Stage 1 — Hard Rejection (Rule-based, fast)**
- Word count < 300 → reject
- No author AND no organization AND no date → reject
- Domain in blacklist → reject
- Dead link (4xx/5xx) → reject

**Stage 2 — AI Slop Score (Heuristic ML)**
- Feature extraction: filler phrase frequency, sentence length variance, unique vocabulary ratio, information density
- Binary classifier: `is_ai_slop` (threshold 0.65)
- Model: fine-tuned `distilbert-base-uncased` on a labeled dataset of known AI slop vs. quality content

**Stage 3 — Semantic Reranking (Cross-Encoder)**
- Query: enriched topic description (from KeywordGraph)
- Model: `BAAI/bge-reranker-large` (local) or Cohere Rerank v3 (API)
- Combines: semantic_relevance × authority_score × freshness_score
- Authority score = f(citation_count, github_stars, domain_authority_heuristic)
- Freshness score = exponential decay based on publish date (half-life: 18 months for tech content)

**Final selection:** Top 50 by composite score

---

### 4.4 Synthesis Agent Node
Uses LLM to:
1. Categorize 50 documents into taxonomy
2. Extract key insights per document (1–3 bullet points)
3. Identify consensus positions and contradictions across sources
4. Write RESEARCH-SYNTHESIS.md with:
   - Executive summary
   - Concept map
   - Per-category annotated bibliography
   - "Practitioner's Takeaways" section
   - Full citation list with URLs

---

### 4.5 Knowledge Brain Updater Node
After every session:
- Extracts generalizable learnings (not topic-specific facts, but meta-knowledge)
- Appends to `SECOND-KNOWLEDGE-BRAIN.md` with session ID and date
- Re-embeds the brain document into vector DB for future retrieval
- Tracks: source quality patterns, domain reliability scores, crawl success rates

---

## 5. ML/DL Model Selection

### Rationale: Pretrained HuggingFace Models (No Training from Scratch)

| Task | Model | Source | Mode |
|------|-------|--------|------|
| Text Embedding | `BAAI/bge-m3` | HuggingFace | Local |
| Cross-Encoder Reranking | `BAAI/bge-reranker-large` | HuggingFace | Local |
| AI Slop Detection | `distilbert-base-uncased` (fine-tuned) | HuggingFace (fine-tune on small dataset) | Local |
| NER (author extraction) | `dslim/bert-base-NER` | HuggingFace | Local |
| Language Detection | `papluca/xlm-roberta-base-language-detection` | HuggingFace | Local |
| Reranking (API fallback) | Cohere Rerank v3 | Cohere API | API |

### Why BGE-M3 for Embeddings?
- Supports 100+ languages (useful for non-English research papers)
- Handles up to 8192 tokens (entire papers, not just chunks)
- Dense + sparse + multi-vector retrieval in one model
- MIT license, commercially usable

### Why BGE-reranker-large?
- State-of-the-art on BEIR benchmark for cross-encoder reranking
- Significantly outperforms bi-encoder retrieval for precision-critical tasks
- ~560M params, runs on consumer GPU (RTX 3060+) or CPU with slight latency

### Fine-tuning the AI Slop Detector
- Dataset: 500 labeled examples (250 known AI slop articles, 250 high-quality technical posts)
- Training: DistilBERT fine-tune, 3 epochs, binary classification head
- Target: F1 > 0.88 on held-out test set
- Fallback: Pure heuristic rule engine if model not available

---

## 6. Data Flow & Pipeline

```
User Input
    │
    ▼
[LangGraph Node 1] KeywordExpander
    │ keyword-graph.json
    ▼
[LangGraph Node 2] CrawlManager
    │ raw-corpus/ (N documents, N = 200–500 typically)
    ▼
[LangGraph Node 3a] HardRejectionFilter
    │ filtered-corpus/ (N reduced to ~150)
    ▼
[LangGraph Node 3b] AISlopDetector
    │ clean-corpus/ (N reduced to ~80)
    ▼
[LangGraph Node 3c] CrossEncoderReranker
    │ top-50.json (exactly 50 documents)
    ▼
[LangGraph Node 4] SynthesisAgent
    │ RESEARCH-SYNTHESIS.md
    ▼
[LangGraph Node 5] VectorDBIngestion
    │ Embeddings stored in Chroma/Qdrant
    ▼
[LangGraph Node 6] KnowledgeBrainUpdater
    │ SECOND-KNOWLEDGE-BRAIN.md (updated)
    ▼
Output Delivered to User
```

---

## 7. API Design

### REST API (NestJS)

```
POST   /api/research/start          — Start new research session
GET    /api/research/:sessionId     — Get session status & progress
GET    /api/research/:sessionId/result — Get RESEARCH-SYNTHESIS.md
GET    /api/research/:sessionId/sources — Get top-50 source list
DELETE /api/research/:sessionId     — Cancel session

POST   /api/knowledge-brain/query   — Query the knowledge brain
GET    /api/knowledge-brain/entries — List brain entries
GET    /api/knowledge-brain/stats   — Domain/source quality statistics

GET    /api/health                  — Health check
GET    /api/models/status           — ML model loading status
```

### WebSocket (for real-time progress)
```
WS /api/research/:sessionId/stream
Events: crawl_progress, filter_progress, rerank_complete, synthesis_progress, done
```

---

## 8. Storage Design

### 8.1 Vector DB Schema (Chroma/Qdrant)

**Collection: `research_documents`**
- Vector: 1024-dim (BGE-M3 output)
- Metadata: `{session_id, url, title, author, source_type, quality_score, crawled_at}`

**Collection: `knowledge_brain`**
- Vector: 1024-dim
- Metadata: `{entry_date, topic_domain, source_session_id, confidence}`

### 8.2 File Storage
```
./data/
├── sessions/
│   └── {session_id}/
│       ├── raw-corpus/          ← Raw crawled markdown
│       ├── filtered-corpus/
│       ├── top-50.json
│       ├── keyword-graph.json
│       ├── RESEARCH-SYNTHESIS.md
│       └── logs/
├── knowledge-brain/
│   ├── SECOND-KNOWLEDGE-BRAIN.md
│   └── brain-embeddings/        ← Persisted Chroma data
└── models/
    ├── bge-reranker-large/
    ├── bge-m3/
    └── slop-detector/
```

### 8.3 SQLite (Lightweight Session Management)
Tables: `sessions`, `documents`, `crawl_log`, `quality_scores`, `brain_entries`

---

## 9. LLM Integration Layer

### Pluggable LLM Abstraction

```typescript
interface LLMProvider {
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  completeStructured<T>(prompt: string, schema: ZodSchema<T>): Promise<T>;
  embed(text: string): Promise<number[]>;
}

// Implementations:
class ClaudeProvider implements LLMProvider { ... }
class OpenAIProvider implements LLMProvider { ... }
class GeminiProvider implements LLMProvider { ... }
class OllamaProvider implements LLMProvider { ... }  // Local models
```

### LLM Usage per Node
| Node | LLM Task | Avg Tokens |
|------|----------|-----------|
| KeywordExpander | Topic analysis, query generation | 2,000 |
| AISlopDetector | Reasoning about suspicious content | 500 (sampled) |
| SynthesisAgent | Full report writing | 8,000–15,000 |
| KnowledgeBrainUpdater | Extract generalizable learnings | 2,000 |

---

## 10. Research Paper Crawler (Knowledge Brain Feed)

This is a **scheduled background job** (separate from per-session crawls) that continuously feeds new academic knowledge into the brain.

### Sources
- **Semantic Scholar API** — Free, 200M+ papers, excellent filtering
- **ArXiv API** — Preprints in CS, ML, AI (daily new papers)
- **Papers With Code** — ML papers with linked implementations
- **ACM Digital Library** — Metadata scraping (full text paywalled)
- **IEEE Xplore** — Metadata + open access subset

### Scheduler
- Runs daily at 02:00 UTC (configurable)
- Queries based on tracked topic domains in knowledge brain
- New papers scored for relevance, added to `SECOND-KNOWLEDGE-BRAIN.md` if score > threshold
- Knowledge brain embedding index rebuilt weekly

### Update Flow
```
Scheduler triggers
    │
    ▼
Query Semantic Scholar + ArXiv for new papers (last 7 days)
    │
    ▼
Filter by: topic relevance > 0.7, citation count or recency boost
    │
    ▼
Extract: title, abstract, authors, DOI, key findings
    │
    ▼
Append to SECOND-KNOWLEDGE-BRAIN.md
    │
    ▼
Re-embed brain → Vector DB updated
```

---

## 11. AI Slop Detection Engine

### Feature Set for Classification
```python
features = {
    "filler_phrase_ratio": count_filler_phrases(text) / word_count,
    "sentence_length_variance": np.var(sentence_lengths),
    "unique_vocab_ratio": len(unique_words) / total_words,
    "compression_ratio": len(zlib.compress(text.encode())) / len(text.encode()),
    "has_named_author": bool(author_name),
    "has_code_blocks": bool(re.search(r'```', text)),
    "citation_count": count_citations(text),
    "passive_voice_ratio": count_passive_sentences(text) / sentence_count,
    "heading_density": count_headings(text) / word_count,
    "avg_paragraph_length": mean(paragraph_lengths),
}
```

### Filler Phrase Dictionary (curated)
```
"it's worth noting", "in today's", "dive deep into", "game-changer",
"leverage", "holistic approach", "at the end of the day", "seamlessly",
"unlock the potential", "in the realm of", "it is important to note",
"take it to the next level", "needless to say", "without further ado",
"in conclusion", "in summary", "to summarize", "first and foremost",
"cutting-edge", "state-of-the-art" (when not citing a paper title),
"delve into", "landscape", "paradigm shift", "robust solution"
```

---

## 12. Security & Ethical Considerations

- **robots.txt compliance:** Always respected; blocked domains never crawled
- **Rate limiting:** Per-domain rate limits enforced (min 1s delay, configurable)
- **Copyright:** Content stored for processing only; no redistribution
- **API keys:** Never logged; stored in environment variables only
- **PII:** Crawled content scanned for and stripped of personal data before storage
- **Terms of Service:** Only scrape pages where ToS permits automated access, or use official APIs

---

## 13. Performance & Scalability

### Performance Targets
| Metric | Target |
|--------|--------|
| Total research session time | < 20 minutes for top-50 |
| Crawl throughput | 50 pages/minute (10 concurrent workers) |
| Reranking latency (50 docs) | < 30 seconds on CPU |
| Synthesis generation | < 3 minutes (LLM dependent) |
| Knowledge brain query | < 500ms |

### Scalability Path
- **Phase 1 (MVP):** Single-machine, SQLite, Chroma local
- **Phase 2:** Dockerized, PostgreSQL, Qdrant standalone
- **Phase 3:** Kubernetes deployment, distributed crawling, Qdrant cluster

---

## 14. Testing Strategy

### Unit Tests
- Each LangGraph node tested in isolation with mock inputs
- AI Slop Detector: labeled test set with known slop/quality examples
- Reranker: verified ranking on curated query-document pairs

### Integration Tests
- Full pipeline E2E test with 5 known topics (pre-verified expected outputs)
- Crawl tests against live URLs (rate-limited, infrequent)

### Quality Regression Tests
- Monthly: Run DRKC on 3 benchmark topics, compare top-50 overlap with human-curated gold list
- Target: >70% overlap with human-curated sources

---

## 15. Deployment

### Docker Compose (Development)
```yaml
services:
  api:           # NestJS API server
  crawler:       # crawl4ai Python service
  ml-worker:     # HuggingFace model server (FastAPI)
  chroma:        # Vector DB
  scheduler:     # Knowledge brain updater (cron)
```

### Environment Requirements
- **Minimum:** 8GB RAM, 4 CPU cores, 20GB disk
- **Recommended:** 16GB RAM, 8 cores, GPU (for faster reranking), 50GB disk
- **OS:** Linux (Ubuntu 22.04+) or macOS (M1/M2 native)

### Production Considerations
- Reverse proxy: Nginx
- Process manager: PM2 (Node) + Gunicorn (Python)
- Logging: Winston (Node) + Loguru (Python) → centralized log aggregator
- Monitoring: Prometheus + Grafana for crawl metrics and model latency
