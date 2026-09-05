---
name: DMS AI Specialist
description: Expert in AI/ML integration for Document Management Systems (DMS), specializing in RAG, embeddings, and pgvector
---

# 🤖 DMS AI Specialist Skill

The **DMS AI Specialist** is responsible for implementing, maintaining, and optimizing AI-powered features in the Eidybrisk DMS, with a focus on Retrieval-Augmented Generation (RAG), document vectorization, and semantic search.

## 🎯 Core Responsibilities

### 1. Document Vectorization Pipeline
- Text extraction from PDFs (PdfPig, OCR for scanned docs)
- Intelligent chunking strategies (sliding window, semantic boundaries)
- Embedding generation via OpenAI (text-embedding-3-small, 1536 dims)
- Batch processing optimization
- Error handling and retry logic

### 2. RAG (Retrieval-Augmented Generation)
- Vector similarity search using pgvector
- HNSW index optimization for performance
- Context window management for LLM prompts
- Hallucination prevention through strict grounding
- Source citation and traceability

### 3. AI Chat System
- Real-time query processing
- Multi-document synthesis
- Conversation history management
- Response quality assurance
- User feedback loop

### 4. Model Management
- OpenAI API integration and cost optimization
- Model selection (embeddings vs. chat models)
- Prompt engineering for accuracy
- Temperature tuning for determinism
- Token usage monitoring

## 🏗️ Architecture Expertise

### Technology Stack

**Backend:**
- .NET 8 (C#) - Main implementation language
- OpenAI SDK (text-embedding-3-small, GPT-4o-mini)
- pgvector extension for PostgreSQL
- MassTransit + Kafka for event-driven vectorization

**Database:**
- PostgreSQL 16+ with pgvector extension
- Vector column type: `vector(1536)`
- HNSW indexing for O(log n) search
- Cosine distance operator: `<=>`

**Services:**
- `DocumentProcessingService` - PDF text extraction
- `DocumentVectorizationService` - Orchestration
- `OpenAIEmbeddingService` - Embedding generation
- `AiChatService` - RAG chat implementation

### Key Files

```
ebrisk-dms-back/
├── src/Ebrisk.Dms.Application/
│   └── Features/AI/
│       ├── Services/
│       │   ├── IDocumentProcessingService.cs
│       │   ├── IDocumentVectorizationService.cs
│       │   ├── IEmbeddingService.cs
│       │   └── IAiChatService.cs
│       └── DTOs/
│           ├── ChatRequest.cs
│           ├── ChatResponse.cs
│           ├── ChatSource.cs
│           └── DocumentChunk.cs
├── src/Ebrisk.Dms.Infrastructure/
│   ├── Services/
│   │   ├── DocumentProcessingService.cs
│   │   ├── DocumentVectorizationService.cs
│   │   ├── OpenAIEmbeddingService.cs
│   │   └── AiChatService.cs
│   └── Messaging/Consumers/
│       └── DocumentGeneratedConsumer.cs
└── src/Ebrisk.Dms.Api/
    └── Controllers/
        └── AiController.cs
```

## 📋 Implementation Checklist

### Phase 1: Text Extraction & Chunking ✅

**Status:** COMPLETED

- [x] PdfPig integration for PDF text extraction
- [x] Page-by-page text extraction
- [x] Sliding window chunking (800 chars, 200 overlap)
- [x] Word boundary detection (avoid mid-word cuts)
- [x] Whitespace normalization

**Code Reference:** `DocumentProcessingService.cs:87-209`

### Phase 2: Embedding Generation ✅

**Status:** COMPLETED

- [x] OpenAI API integration (text-embedding-3-small)
- [x] Batch embedding generation (up to 100 texts)
- [x] Automatic batching for large documents
- [x] Error handling and retries
- [x] Logging and observability

**Code Reference:** `OpenAIEmbeddingService.cs:54-161`

### Phase 3: Vectorization Pipeline ✅

**Status:** COMPLETED

- [x] Event-driven architecture (Kafka)
- [x] DocumentGeneratedConsumer implementation
- [x] Async processing (non-blocking upload)
- [x] pgvector persistence
- [x] Transaction handling
- [x] Failure recovery

**Code Reference:** `DocumentVectorizationService.cs:39-114`

**Database Table:**
```sql
CREATE TABLE dms.document_embeddings (
    id UUID PRIMARY KEY,
    document_version_id UUID NOT NULL,
    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    page_number INT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_document_embeddings_vector_hnsw
ON dms.document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Phase 4: RAG Chat System ✅

**Status:** COMPLETED

- [x] Query embedding generation
- [x] Vector similarity search (pgvector)
- [x] Top-K retrieval (configurable, default 5)
- [x] Context prompt building
- [x] GPT-4o-mini integration
- [x] Hallucination prevention (strict grounding)
- [x] Source citation
- [x] Response streaming (optional)

**Code Reference:** `AiChatService.cs:64-260`

**API Endpoint:** `POST /api/v1/ai/chat`

### Phase 5: Advanced Features 🚧

**Status:** PLANNED / IN PROGRESS

- [ ] AI-powered metadata extraction (objective, scope, keywords)
  - Store in `document_versions.ai_metadata` JSONB column
  - Use GPT-4o-mini for structured extraction
- [ ] Multi-language support (Spanish, English)
- [ ] OCR integration for scanned documents (Tesseract)
- [ ] Semantic search in master list UI
- [ ] Document similarity recommendations
- [ ] Question answering with uncertainty estimation
- [ ] Fine-tuning on domain-specific corpus

## 🛠️ Configuration Management

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...                              # Required: API key
OPENAI_MODEL_EMBEDDING=text-embedding-3-small      # Default: text-embedding-3-small
OPENAI_MODEL_CHAT=gpt-4o-mini                      # Default: gpt-4o-mini
OPENAI_API_BASE_URL=https://api.openai.com/v1/    # Default: OpenAI endpoint
OPENAI_TEMPERATURE=0.1                             # Default: 0.1 (low = deterministic)
OPENAI_MAX_TOKENS_CHAT=1000                        # Default: 1000

# RAG Configuration
RAG_CHUNK_SIZE=800                                 # Default: 800 characters
RAG_CHUNK_OVERLAP=200                              # Default: 200 characters
RAG_SIMILARITY_THRESHOLD=0.5                       # Default: 0.5 (0-1 range)
RAG_MAX_CHUNKS_RETRIEVE=5                          # Default: 5 chunks
RAG_EMBEDDING_DIMENSIONS=1536                      # Default: 1536 (text-embedding-3-small)

# Performance
RAG_BATCH_SIZE=100                                 # Max texts per OpenAI batch request
RAG_ENABLE_CACHING=true                            # Cache embeddings (Redis/Memory)
RAG_CACHE_TTL_HOURS=24                             # Cache expiration
```

### appsettings.json

```json
{
  "OpenAI": {
    "ApiKey": "${OPENAI_API_KEY}",
    "ApiBaseUrl": "https://api.openai.com/v1/",
    "ModelEmbedding": "text-embedding-3-small",
    "ModelChat": "gpt-4o-mini",
    "Temperature": 0.1,
    "MaxTokensChat": 1000,
    "EmbeddingDimensions": 1536
  },
  "RAG": {
    "ChunkSize": 800,
    "ChunkOverlap": 200,
    "SimilarityThreshold": 0.5,
    "MaxChunksRetrieve": 5,
    "BatchSize": 100
  }
}
```

## 🔬 Testing Strategy

### 1. Unit Tests

**DocumentProcessingService:**
```csharp
[Fact]
public async Task ProcessDocumentAsync_WithValidPdf_ExtractsText()
{
    // Arrange
    var service = new DocumentProcessingService(config, logger);
    var pdfStream = GetTestPdfStream();

    // Act
    var result = await service.ProcessDocumentAsync(
        Guid.NewGuid(),
        pdfStream,
        "application/pdf"
    );

    // Assert
    Assert.NotEmpty(result.Chunks);
    Assert.All(result.Chunks, chunk =>
    {
        Assert.True(chunk.Content.Length <= 800 + 200); // ChunkSize + Overlap
        Assert.InRange(chunk.PageNumber, 1, int.MaxValue);
    });
}
```

**OpenAIEmbeddingService:**
```csharp
[Fact]
public async Task GenerateEmbeddingAsync_WithValidText_ReturnsCorrectDimensions()
{
    // Arrange
    var service = new OpenAIEmbeddingService(config, logger, httpClientFactory);

    // Act
    var embedding = await service.GenerateEmbeddingAsync("Test text");

    // Assert
    Assert.Equal(1536, embedding.Length);
    Assert.All(embedding, value => Assert.InRange(value, -1.0f, 1.0f));
}
```

### 2. Integration Tests

**End-to-End RAG Flow:**
```csharp
[Fact]
public async Task E2E_UploadDocumentAndChat_ReturnsAccurateResponse()
{
    // Arrange: Upload document
    var documentId = await UploadPdfAsync("safety-procedure.pdf");

    // Wait for async vectorization
    await WaitForVectorizationAsync(documentId, timeout: TimeSpan.FromMinutes(2));

    // Act: Query chat
    var chatResponse = await ChatAsync("¿Cuáles son los requisitos de seguridad?");

    // Assert
    Assert.NotEmpty(chatResponse.Answer);
    Assert.Contains("seguridad", chatResponse.Answer, StringComparison.OrdinalIgnoreCase);
    Assert.NotEmpty(chatResponse.Sources);
    Assert.All(chatResponse.Sources, source =>
    {
        Assert.Equal(documentId, source.DocumentId);
        Assert.True(source.Similarity > 0.5);
    });
}
```

### 3. Performance Tests

**Vectorization Speed:**
```csharp
[Fact]
public async Task VectorizeDocument_WithLargePdf_CompletesInReasonableTime()
{
    // Arrange
    var largePdf = GetTestPdf(pages: 100); // 100-page document
    var stopwatch = Stopwatch.StartNew();

    // Act
    await vectorizationService.VectorizeDocumentAsync(
        Guid.NewGuid(),
        largePdf,
        "application/pdf"
    );

    stopwatch.Stop();

    // Assert: Should complete in under 5 minutes
    Assert.True(stopwatch.Elapsed < TimeSpan.FromMinutes(5));
}
```

**Search Performance:**
```csharp
[Fact]
public async Task SearchSimilarChunks_With100KEmbeddings_CompletesInUnder500ms()
{
    // Arrange: Database with 100K embeddings
    var queryEmbedding = new float[1536];
    var stopwatch = Stopwatch.StartNew();

    // Act
    var results = await chatService.SearchSimilarChunksAsync(queryEmbedding, null, CancellationToken.None);

    stopwatch.Stop();

    // Assert
    Assert.True(stopwatch.ElapsedMilliseconds < 500);
}
```

## 🚨 Critical Guidelines

### 1. Never Hallucinate

**System Prompt Must Include:**
```
STRICT RULES:
1. ONLY use information from the provided CONTEXT
2. If information is NOT in context, respond: "No encontré información sobre esto"
3. NEVER add information from your training data
4. ALWAYS cite sources using [Fuente N]
```

**Test Hallucination Prevention:**
```bash
# Query about something not in documents
curl -X POST /api/v1/ai/chat -d '{"query": "¿Cuál es la capital de Francia?"}'

# Expected response:
# "No encontré información sobre esto en los documentos disponibles."
```

### 2. Always Cite Sources

Every claim in the response must reference a source:

```
Los requisitos de seguridad incluyen [Fuente 1]:
1. Uso de arnés certificado [Fuente 2]
2. Inspección previa del equipo [Fuente 1]
```

**Validation:**
```typescript
function validateSourceCitations(response: ChatResponse): boolean {
  const citationMatches = response.answer.match(/\[Fuente \d+\]/g) || [];
  const uniqueCitations = new Set(citationMatches);

  // All sources must be cited
  return uniqueCitations.size === response.sources.length;
}
```

### 3. Data Privacy & Security

- **GDPR Compliance:** OpenAI stores embeddings for 30 days (per policy)
- **Sensitive Data:** Be cautious with `CONFIDENTIAL` documents
- **Tenant Isolation:** Always filter by tenant_id in queries
- **Access Control:** Respect document permissions in search

**Security Query:**
```sql
-- Filter by user permissions
SELECT ...
FROM dms.document_embeddings de
INNER JOIN dms.document_versions dv ON dv.id = de.document_version_id
INNER JOIN dms.logical_documents ld ON ld.id = dv.logical_document_id
WHERE 1 - (de.embedding <=> @vector::vector) > @threshold
  AND (
    ld.confidentiality_level = 'PUBLIC'
    OR user_has_permission(ld.id, @userId)
  )
ORDER BY similarity DESC
LIMIT @limit;
```

### 4. Cost Optimization

**Embedding Costs (text-embedding-3-small):**
- $0.020 / 1M tokens
- Average chunk: 200 tokens
- 100-page PDF ≈ 500 chunks ≈ 100K tokens ≈ $0.002

**Chat Costs (GPT-4o-mini):**
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens
- Average query: 500 input + 200 output ≈ $0.0002

**Optimization Strategies:**
1. Cache common query embeddings
2. Batch process embeddings (100 per request)
3. Use GPT-4o-mini instead of GPT-4o (10x cheaper)
4. Limit max_tokens to prevent long responses
5. Monitor token usage per tenant

### 5. Performance Best Practices

**HNSW Index Tuning:**
```sql
-- Default configuration
CREATE INDEX idx_embeddings_hnsw
ON dms.document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- For larger datasets (100K+ embeddings):
WITH (m = 24, ef_construction = 128); -- Better accuracy, slower build

-- For smaller datasets (<10K embeddings):
WITH (m = 8, ef_construction = 32);   -- Faster build, slightly lower accuracy
```

**Connection Pooling:**
```csharp
// Always use connection pooling
"ConnectionStrings": {
  "TenantDb": "Host=localhost;Database=tenant;Pooling=true;MinPoolSize=5;MaxPoolSize=20"
}
```

**Async All the Way:**
```csharp
// ❌ BAD: Blocking
var embedding = GenerateEmbeddingAsync(text).Result;

// ✅ GOOD: Fully async
var embedding = await GenerateEmbeddingAsync(text, ct);
```

## 📊 Monitoring & Observability

### 1. Key Metrics

**Vectorization:**
- Documents processed per hour
- Average processing time per document
- Embedding generation success rate
- Kafka consumer lag

**Chat:**
- Queries per minute
- Average response time
- Average similarity score
- Source retrieval rate (queries with >0 sources)
- Token usage per query

### 2. Logging

**Structured Logging:**
```csharp
_logger.LogInformation(
    "Document vectorized: {DocumentId}, Chunks: {ChunkCount}, Time: {TimeMs}ms",
    documentId,
    chunks.Count,
    stopwatch.ElapsedMilliseconds
);

_logger.LogInformation(
    "Chat query processed: Query={QueryLength} chars, Sources={SourceCount}, Similarity={AvgSimilarity:F2}, Tokens={TokensUsed}",
    request.Query.Length,
    sources.Count,
    sources.Average(s => s.Similarity),
    tokensUsed
);
```

### 3. Alerting

**Critical Alerts:**
- OpenAI API errors (rate limit, auth failure)
- Kafka consumer stopped
- No embeddings generated for 1+ hour
- Average similarity < 0.3 (indicates poor document coverage)

**Warning Alerts:**
- Vectorization queue length > 100
- Average processing time > 5 minutes
- Token usage exceeds budget threshold

## 🔄 Maintenance Tasks

### Daily
- Monitor OpenAI API costs
- Check Kafka consumer health
- Review failed vectorizations

### Weekly
- Analyze chat quality (low similarity queries)
- Review common queries (FAQ candidates)
- Check embedding storage growth

### Monthly
- Optimize HNSW index parameters
- Clean up old embeddings (if document deleted)
- Review and update system prompts
- Analyze cost trends and optimize

## 🎓 Learning Resources

### RAG & Vector Databases
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)

### Prompt Engineering
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)

### Document Processing
- [PdfPig Documentation](https://github.com/UglyToad/PdfPig)
- [Chunking Strategies](https://www.pinecone.io/learn/chunking-strategies/)

---

**Related Workflows:**
- [Document Upload with Vectorization](../../workflows/document-upload-with-vectorization.md)
- [AI Chat RAG](../../workflows/ai-chat-rag.md)
- [Implement RAG Feature](../../workflows/implement-rag-feature.md)

**Related Skills:**
- [Backend Expert](../backend-expert/SKILL.md)
- [Data Engineer](../data-engineer/SKILL.md)
- [Frontend Master](../frontend-master/SKILL.md)
