# Course Content Pipeline

Run the corpus builder from the `backend` directory:

```bash
node scripts/build-course-content.mjs --refresh
```

The builder downloads curated course sources from `source_manifest.json`, then writes:

- `raw/<source-id>/...` source snapshots and fetched HTML pages
- `extracted/<source-id>/*.md` cleaned, retrieval-ready documents
- `topics/*.md` topic bundles and representative excerpts
- `overview.md` and `catalog.json` course metadata

Current generated course directories:

- `python`
- `machine_learning`
- `artificial_intelligence`
