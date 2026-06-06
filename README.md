# deep-research-knowledge-cleaner (DRKC)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform: NestJS](https://img.shields.io/badge/Platform-NestJS-red.svg)
![ML: BGE-M3](https://img.shields.io/badge/ML-BGE--M3-blue.svg)
![Crawl: crawl4ai](https://img.shields.io/badge/Crawl-crawl4ai-green.svg)

**DRKC** is an advanced autonomous research agent system designed to combat the "AI Slop" crisis. It autonomously crawls, filters, and distills the internet's vast information into a high-density, authoritative knowledge base, culminating in a professional research report.

---

## Key Features

### Precision Research Pipeline
- **Agentic Orchestration**: Powered by **LangGraph**, the system moves through a deterministic state machine: Topic Expansion $\rightarrow$ Deep Crawl $\rightarrow$ Quality Filtering $\rightarrow$ Semantic Reranking $\rightarrow$ Synthesis.
- **AI Slop Detection**: A custom heuristic engine that detects low-information-density content, filler-phrase patterns, and synthetic structures to ensure only human-grade, authoritative data enters the system.
- **Composite Reranking**: Uses a Cross-Encoder approach to score documents based on:
  - **Semantic Relevance** (BGE-Reranker-Large)
  - **Authority Score** (Citations, GitHub stars, Domain reputation)
  - **Freshness** (Exponential decay with an 18-month half-life)

### The Second Knowledge Brain
- **Cumulative Intelligence**: Unlike standard RAG, DRKC maintains a persistent, append-only SECOND-KNOWLEDGE-BRAIN.md.
- **Durable Learnings**: After every session, the agent extracts topic-agnostic principles and updates the brain, ensuring the agent becomes smarter with every research task.

### High-Performance Tech Stack
- **Orchestrator**: NestJS (TypeScript)
- **Crawler**: crawl4ai (Python/FastAPI) - Specialized in LLM-friendly Markdown extraction.
- **Embeddings**: BGE-M3 (Local, Multi-lingual, 8k context).
- **Vector Storage**: ChromaDB.
- **LLM Layer**: Pluggable provider system (Claude 3.5 Sonnet, GPT-4, Gemini).

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+

### Installation
1. **Clone the Repository**
   \\\ash
   git clone https://github.com/dungnotnull/deep-research-knowledge-cleaner-agent.git
   cd deep-research-knowledge-cleaner-agent
   \\\

2. **Configure Environment**
   \\\ash
   cp .env.example .env
   # Update ANTHROPIC_API_KEY or your preferred provider
   \\\

3. **Launch Infrastructure**
   \\\ash
   docker-compose up -d
   \\\

4. **Start Research**
   \\\ash
   curl -X POST http://localhost:3000/api/research/start \
     -H 'Content-Type: application/json' \
     -d '{"topic": "Domain Driven Design in NestJS"}'
   \\\

---

## System Architecture

\\\mermaid
graph TD
    A[User Topic] --> B[Keyword Expander]
    B --> C[Crawl Manager]
    C --> D[Hard Rejection Filter]
    D --> E[AI Slop Detector]
    E --> F[Cross-Encoder Reranker]
    F --> G[Top 50 Selection]
    G --> H[Vector DB Ingestion]
    H --> I[Synthesis Agent]
    I --> J[RESEARCH-SYNTHESIS.md]
    I --> K[Knowledge Brain Update]
    K --> L[SECOND-KNOWLEDGE-BRAIN.md]
\\\

---

## Project Structure

- \src/agents/\: Topic expansion and agentic logic.
- \src/crawlers/\: crawl4ai integration and target management.
- \src/filters/\: AI Slop and Reranking pipelines.
- \src/vectordb/\: ChromaDB adapters and chunking strategies.
- \src/synthesis/\: Report generation and taxonomy logic.
- \src/knowledge-brain/\: Persistence and update logic for the brain.
- \aw-corpus/\: Local storage of all crawled markdown.
- \outputs/\: Generated research reports.

---

## License
Distributed under the MIT License. See \LICENSE\ for more information.
