# deep-research-knowledge-cleaner (DRKC)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform: NestJS](https://img.shields.io/badge/Platform-NestJS-red.svg)
![ML: BGE-M3](https://img.shields.io/badge/ML-BGE--M3-blue.svg)
![Crawl: crawl4ai](https://img.shields.io/badge/Crawl-crawl4ai-green.svg)

DRKC is an advanced autonomous research agent system designed to combat the AI Slop crisis. It autonomously crawls, filters, and distills the internet's vast information into a high-density, authoritative knowledge base, culminating in a professional research report.

---

## Key Features

### Precision Research Pipeline
- **Agentic Orchestration**: Powered by LangGraph, the system moves through a deterministic state machine: Topic Expansion -> Deep Crawl -> Quality Filtering -> Semantic Reranking -> Synthesis.
- **AI Slop Detection**: A custom heuristic engine that detects low-information-density content, filler-phrase patterns, and synthetic structures to ensure only human-grade, authoritative data enters the system.
- **Composite Reranking**: Uses a Cross-Encoder approach to score documents based on:
  - Semantic Relevance (BGE-Reranker-Large)
  - Authority Score (Citations, GitHub stars, Domain reputation)
  - Freshness (Exponential decay with an 18-month half-life)

### The Second Knowledge Brain
- **Cumulative Intelligence**: Unlike standard RAG, DRKC maintains a persistent, append-only SECOND-KNOWLEDGE-BRAIN.md.
- **Durable Learnings**: After every session, the agent extracts topic-agnostic principles and updates the brain, ensuring the agent becomes smarter with every research task.

### High-Performance Tech Stack
- **Orchestrator**: NestJS (TypeScript)
- **Crawler**: crawl4ai (Python/FastAPI)
- **Embeddings**: BGE-M3 (Local, Multi-lingual)
- **Vector Storage**: ChromaDB
- **LLM Layer**: Pluggable provider system (Claude, GPT, Gemini)

---

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.10+
- Node.js 18+

### Installation
1. Clone the Repository
2. Configure Environment: Copy .env.example to .env and add your API keys.
3. Launch Infrastructure: Run docker-compose up -d.
4. Start Research: Send a POST request to /api/research/start.

---

## System Architecture

The pipeline follows a linear progression:
User Topic -> Keyword Expander -> Crawl Manager -> Hard Rejection Filter -> AI Slop Detector -> Cross-Encoder Reranker -> Top 50 Selection -> Vector DB Ingestion -> Synthesis Agent -> Final Report.

---

## Project Structure

- src/agents: Topic expansion and agentic logic.
- src/crawlers: crawl4ai integration.
- src/filters: AI Slop and Reranking pipelines.
- src/vectordb: ChromaDB adapters.
- src/synthesis: Report generation.
- src/knowledge-brain: Brain persistence.
- raw-corpus: Local storage of crawled markdown.
- outputs: Generated research reports.

---

## License
Distributed under the MIT License.
