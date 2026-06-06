# SECOND-KNOWLEDGE-BRAIN.md
## DRKC Persistent Knowledge Brain — Cumulative Research Intelligence

> **CRITICAL RULE: This file is APPEND-ONLY. Never delete or overwrite existing entries.**
> New entries are added at the bottom of their respective section, tagged with `[DATE]` and `[SOURCE]`.
> This brain is re-embedded into the vector DB after every update.
> The agent reads this file at the start of every session to improve its decisions.

---

## How to Read This File

Each entry follows this format:
```
### [ENTRY-ID] Title of Learning
- **Date Added:** YYYY-MM-DD
- **Source Session / Paper:** session-id or DOI or URL
- **Confidence:** High / Medium / Low
- **Domain:** e.g., Web Crawling, ML Reranking, Source Quality
- **Learning:** The actual insight, written concisely and precisely.
- **Actionable Implication:** How the agent should change behavior based on this.
```

---

## Section 1: Source Quality & Reliability

### [SKB-001] Cross-Encoder Reranking Significantly Outperforms Bi-Encoder Retrieval for Precision Tasks
- **Date Added:** 2025-01-01 (Seed entry — project initialization)
- **Source:** Nogueira & Cho (2019) "Passage Re-ranking with BERT" + BEIR Benchmark (Thakur et al., 2021)
- **Confidence:** High
- **Domain:** ML Reranking
- **Learning:** Bi-encoder (embedding similarity) retrieval achieves recall well but is poor at precision. Cross-encoders process query+document jointly and achieve significantly higher nDCG@10 scores (+8–15% on BEIR). The gap is largest for technical/specialized queries.
- **Actionable Implication:** Always use cross-encoder reranking as a second stage after initial retrieval. Never rely solely on vector similarity for final top-N selection in DRKC.

---

### [SKB-002] BGE-M3 Outperforms OpenAI text-embedding-3-small on Technical Domain Retrieval
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** BAAI/bge-m3 technical report (Chen et al., 2024) — https://arxiv.org/abs/2309.07597
- **Confidence:** High
- **Domain:** Text Embedding
- **Learning:** BGE-M3 supports multi-vector retrieval (dense + sparse + multi-vec ColBERT), handles 8192 token inputs, and achieves superior results on BEIR benchmarks for domain-specific technical content vs. OpenAI's embedding models. Additionally, it is free and runs locally.
- **Actionable Implication:** Default to BGE-M3 for all embedding tasks in DRKC. Only use API-based embedding if local GPU is unavailable.

---

### [SKB-003] GitHub Star Count is a Reliable but Noisy Proxy for Code Quality
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Empirical study: Borges et al. (2016) "On the Popularity of GitHub Repositories"
- **Confidence:** Medium
- **Domain:** Source Quality Signals
- **Learning:** GitHub stars correlate with popularity, not necessarily quality. However, for repositories with >500 stars AND active commit history (commits in last 90 days), the correlation with code quality becomes stronger. Stars alone without recency can indicate abandoned-but-famous projects.
- **Actionable Implication:** Authority score for GitHub repos should combine: star count (log scale) × recency multiplier (0.0–1.0 based on last commit date) × has-documentation-bonus.

---

### [SKB-004] AI-Generated Content Exhibits Measurable Compression Ratio Signatures
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Guo et al. (2023) "How Close is ChatGPT to Human Experts?" + internal analysis
- **Confidence:** Medium
- **Domain:** AI Slop Detection
- **Learning:** AI-generated text tends to have higher compression ratios (zlib) than human-written text of equivalent length because it contains more repeated structures, filler phrases, and predictable patterns. A compression ratio > 0.65 is a useful soft signal for AI generation.
- **Actionable Implication:** Include zlib compression ratio as one of the features in the AI Slop Detector. Weight at ~15% of final slop score. Do not use alone — combine with other features.

---

### [SKB-005] Semantic Scholar API Provides Higher Quality Metadata than Google Scholar Scraping
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Semantic Scholar documentation — https://api.semanticscholar.org/
- **Confidence:** High
- **Domain:** Web Crawling, Data Sources
- **Learning:** Semantic Scholar offers a free, well-documented API with 200M+ papers, citation counts, author profiles, open-access PDF links, and embedding vectors. Google Scholar actively blocks scrapers and has no official API. Semantic Scholar data quality is excellent for CS, ML, and engineering domains.
- **Actionable Implication:** Always prefer Semantic Scholar API over Google Scholar scraping. Use Scholar as fallback only for humanities/social science papers not in Semantic Scholar. Budget: 100 requests per 5 minutes on free tier, 1 req/sec with API key.

---

### [SKB-006] crawl4ai Extracts Cleaner Markdown than BeautifulSoup + Markdownify Pipeline
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** crawl4ai GitHub README + benchmarks — https://github.com/unclecode/crawl4ai
- **Confidence:** High
- **Domain:** Web Crawling
- **Learning:** crawl4ai uses specialized content extraction heuristics (LLM-friendly Markdown output, boilerplate removal, navigation stripping) that outperform naive BS4+markdownify pipelines, especially on documentation sites and blog platforms. It also handles JavaScript-rendered pages via Playwright integration.
- **Actionable Implication:** Use crawl4ai as the primary crawling engine. Only fall back to raw requests/BS4 for simple static pages where crawl4ai would be overkill.

---

### [SKB-007] LangGraph State Machine Enables Reliable Agentic RAG with Explicit Error Recovery
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** LangGraph documentation + Harrison Chase talk at AI Engineer Summit (2024)
- **Confidence:** High
- **Domain:** Agent Architecture
- **Learning:** LangGraph's explicit state graph (nodes + edges + conditional routing) allows deterministic replay of failed nodes, human-in-the-loop checkpoints, and clear observability. Unlike simple chain-of-thought agents, LangGraph nodes can be individually tested, retried, and monitored. This is critical for long-running research pipelines where failures mid-pipeline are expensive.
- **Actionable Implication:** Model every major pipeline stage as a distinct LangGraph node. Use conditional edges for quality gates (e.g., "if top_50.length < 30, re-crawl with expanded queries"). Implement checkpointing at the post-crawl and post-rerank stages.

---

## Section 2: Domain-Specific Research Patterns

### [SKB-008] Technical Documentation Sites Require Different Crawl Strategies
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Internal analysis of crawl4ai documentation
- **Confidence:** Medium
- **Domain:** Web Crawling
- **Learning:** Documentation sites (ReadTheDocs, GitBook, Docusaurus, VitePress) often have SPA routing that requires JavaScript execution. Static crawlers miss 40–60% of content on these sites. Additionally, docs sites often have high-value sidebar navigation that can be used to discover all pages systematically.
- **Actionable Implication:** For domains matching doc site patterns (docs.*, *.readthedocs.io, gitbook.io), always use crawl4ai with JS rendering enabled. Extract the sitemap.xml or navigation structure first to enumerate all pages before crawling.

---

### [SKB-009] Research Papers Follow Predictable Quality Signals via Citation Velocity
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Semantic Scholar research on citation patterns
- **Confidence:** Medium
- **Domain:** Source Quality Signals, Academic Papers
- **Learning:** "Citation velocity" (citations per month since publication) is a stronger signal than raw citation count for recent papers. A 6-month-old paper with 50 citations has higher citation velocity than a 5-year-old paper with 200 citations — and is likely more impactful in its niche. Semantic Scholar provides this metric directly.
- **Actionable Implication:** For papers < 2 years old, weight citation_velocity over raw citation_count in the authority score calculation. For papers > 2 years old, raw citation count is more reliable.

---

## Section 3: Architecture & System Design Learnings

### [SKB-010] Vector DB Choice Depends on Scale Threshold
- **Date Added:** 2025-01-01 (Seed entry)
- **Source:** Vector DB benchmark: https://ann-benchmarks.com/ + Qdrant documentation
- **Confidence:** High
- **Domain:** Storage Architecture
- **Learning:** For < 1M vectors, Chroma (local) and Qdrant (standalone) have comparable query latency. Above 1M vectors or with concurrent query requirements > 10 QPS, Qdrant's HNSW implementation outperforms Chroma. For DRKC's typical scale (< 100k document chunks), Chroma is sufficient and simpler to operate.
- **Actionable Implication:** Default to Chroma for development and single-user deployments. Document upgrade path to Qdrant for multi-user or enterprise deployments.

---

## Section 4: Research Paper Updates (Auto-populated by Scheduler)

> This section is auto-populated by the scheduled background job (daily at 02:00 UTC).
> Papers are added when: relevance_score > 0.70 AND (citation_velocity > 5/month OR published within 30 days)

*No automated entries yet — scheduler not yet initialized.*

---

## Section 5: Crawl Failure Patterns & Domain Reliability

> This section tracks which domains reliably yield high-quality content and which are problematic.

### Reliable Domains (Updated as experience grows)
- `arxiv.org` — API available, free, high quality CS papers
- `semanticscholar.org` — API available, excellent metadata
- `github.com` — API available, good rate limits with auth token
- `nestjs.com` — Static docs, crawl4ai works well
- `docs.python.org` — Excellent structure, no JS needed
- `developer.mozilla.org` — High quality, CC-BY-SA licensed

### Problematic Domains (Updated as experience grows)
- `medium.com` — Paywall after 3 articles; partial content only
- `dev.to` — Rate limiting aggressive; use RSS feed instead
- `towardsdatascience.com` — Paywall; use Google Scholar abstract only

---

## Knowledge Brain Statistics

```
Total Entries: 10 (seed entries)
Sections: 5
Last Updated: Project initialization
Sessions Processed: 0
Papers Indexed: 0
Domains Tracked: 7
```

---

*Remember: Every session makes this brain smarter. Every entry compounds.*
*The agent that reads this tomorrow is more capable than the agent that ran yesterday.*
