# Guanacaste Real Estate AI KB Education Process

## How to "Educate" the AI Model Continuously

The AI assistant learns from a knowledge base stored in the `kb_docs` table. To add new information:

### 1. Create a New Markdown File
- Add a new `.md` file to `seed/kb/`
- Use the frontmatter format:

```yaml
---
title: "Your Document Title"
topic: "relevant_topic"
location_scope: "guanacaste" | "national"
verified: true
law_refs: []  # array of law references if applicable
---
```

### 2. Write Factual, Concise Content
- Focus on public, verified information
- Avoid fluff; include specific details like municipal notes
- Split large topics into multiple files (e.g., `zmt-concessions-legal.md`, `zmt-concessions-muni-carrillo.md`)

### 3. Ingest the Document
- For local dev: POST to `http://localhost:54321/functions/v1/ingest`
- For production: POST to your Supabase Functions URL
- Include the file as multipart/form-data
- Requires service role key for admin access

### 4. Verify Ingestion
- Check that `kb_docs` has the new row
- Ensure `embeddings_global` has chunks with vectors
- Test queries that should hit the new content

### 5. Iterate and Expand
- Add more town profiles (Playa Coco, Brasilito, etc.)
- Include legal processes, fees, schools, hospitals, roads
- For property-specific intelligence in v1.1: embed listing descriptions into `embeddings_property`

## Quality Guidelines
- Keep each section factual and concise
- Include citations where possible
- Verify information before marking `verified: true`
- Test that answers cite the new content appropriately