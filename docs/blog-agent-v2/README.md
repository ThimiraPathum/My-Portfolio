# AI Blog Agent V2

Status: implementation complete; **keep draft-only for the initial rollout**. Tests do not rotate keys or publish production posts. Deployment uses the existing GitHub Actions workflow after an approved push to `main`.

## Why the old articles were unreliable

The old command sent a randomly chosen title directly to an LLM and immediately published any JSON containing a title and body. There was no retrieved evidence, claim validation, editorial review or safety gate. The universal prompt forced long articles, code, lists, callouts and a named company example into every category, including film reviews. That encouraged padding and invented case studies. Exact-title deduplication missed rewritten titles. Dated predictions could keep being selected long after release. Random Picsum fallbacks implied relevance that did not exist, and `withoutVerifying()` disabled TLS verification.

Separately, the reported production failure occurred **before** an API call: the key was unavailable, the backend `.env` was absent, and the dashboard screenshot showed a revoked key. This implementation cannot restore a revoked key or verify today's server configuration. Credentials must be supplied privately. The working `AI_MODEL=openai/gpt-oss-120b` is preserved; explicit environment values take precedence.

## Workflow

`topic → retrieve → plan → draft → deterministic checks → evidence-based editorial review → optional single revision → neutral cover → save`

1. A small curated evergreen catalogue covers all nine requested subject areas. Manual `--topic` is supported, with category detection and optional repeatable `--source`. Normalized-title similarity and a stable topic slug detect duplicates across both drafts and published posts. Old dated titles are rejected. News, comparisons, releases, "latest", "upcoming" and similar titles require dated recent evidence.
2. At most four source candidates are fetched. At least two distinct accessible source texts are required; mirrored text does not count twice. The catalogue is **candidate URLs, not pre-verified evidence**. An unknown manual topic needs explicit URLs. There is no search subscription, invented URL generation or unrestricted crawler. Each run fetches fresh text and retains its timestamp and hash. HTML/plain text only; PDFs and JavaScript-only sites fail closed. Freshness for time-sensitive topics requires two publication dates within 30 days, extracted from explicit metadata; fetching an old page today does not make it fresh.
3. The model plans an angle against those excerpts. A missing source, false premise or insufficient research must stop the plan. The second request produces structured blocks: facts, interpretation, guidance or code. Factual and instructional blocks require source IDs and exact supporting excerpts. Category prompts distinguish tutorials, AI/ML explanation, editorial film/TV writing, games and science. No universal article word count or mandatory code/table format.
4. Deterministic checks validate the response schema, evidence IDs and exact excerpts, numerical claims, citation integrity, basic Markdown, repetition, obvious dangerous configurations and category mismatch. The small 650-character/three-block floor rejects stubs; it is not an 800-word padding target. Links are rendered from fetched sources by application code, never accepted from the model. Internal evidence quotes are not published.
5. A separate model request reviews the **whole** article, including metadata and every block, against the retrieved text across ten dimensions. Every dimension and every block must pass; missing/duplicate block assessments fail. One revision is allowed, then the full gates run again. Failures are rejected without a new database row. After a final quality rejection, a normal run retains a private rejection report so the actual draft/evidence/reviewer feedback can be inspected; dry runs still write nothing. No score can override a critical failure.
6. Eligible articles default to an ordinary admin-visible `draft`, with `coming_soon=false` and no publication date. An opt-in `BLOG_AUTO_PUBLISH=true` allows eligible articles to publish. `--draft` always overrides it. Cybersecurity and detected operational DevOps instructions remain drafts for human review even if all model checks pass.
7. Original category SVG illustrations replace random remote photographs. They explicitly identify themselves as editorial illustrations, not official artwork. Existing cover images are untouched. No image API or license assumption is required.
8. A private evidence report records topic, model, source text/hashes/dates, plan, blocks, review and revision count. The report must save before the new article is created. Reports use the dedicated `blog_research` disk with no HTTP serving route. No database migration was added and old articles are never edited.

## What the gates do not prove

**This is not a fully fact-checked publishing system.** Exact excerpts establish provenance, not semantic entailment. A real quotation can accompany a false paraphrase. The semantic reviewer is another call to the same model; agreement is not independent verification, and adversarial source content can still influence it. The model reviews contradictions and hidden facts in interpretation blocks, but that check is not a formal proof. Two source pages can come from the same organisation; they are not necessarily independent evidence. A trusted domain may still contain errors or stale pages, and source dates may be missing or misleading.

The tests prove that failed checks block publication; they do not measure the accuracy of a live model's judgements. Numeric checking and dangerous-command patterns are intentionally conservative and cannot cover every hazard. Human review is essential for security advice, production credits and any disputed or consequential factual assertion. Keep auto-publishing off until representative **live** research/draft/review runs have been manually audited.

Catalogue coverage is deliberately limited. Some pages redirect, exceed the byte cap, block automation or expose insufficient text. The command then rejects the topic; it does not silently use memory. Supply a final approved URL or improve the catalogue in code. It does not automatically try many replacement topics in one run. Topic similarity is heuristic; substantially different titles about the same subject can evade it. No automatic rewrite of the three older problematic articles is performed.

## Retrieval and API security

- Exact trusted-host allowlist in `config/blog_agent.php`; HTTPS port 443 only. Reject credentials, query strings, fragments, other protocols, non-approved domains and IP URLs before network access.
- Resolve DNS and reject private/reserved/mixed-address responses. Pin the validated address with `CURLOPT_RESOLVE` on a new cURL handle. Disable proxies and all redirects. A redirect must be reviewed as a separate candidate URL; it is not followed automatically.
- Verify TLS against the normal CA trust store. Five-second connect timeout, twelve-second source timeout, and a 512 KiB limit enforced on decompressed chunks. Extract at most 14,000 characters per source. Never execute page scripts or load XML network entities.
- Research requests carry no API credentials. Source and draft data are explicitly untrusted in model prompts. The API client only sends its bearer key to the configured approved Groq/OpenAI endpoint, with redirects disabled.
- Three attempts maximum for connection failures, 429s and 5xx responses. Backoff respects `Retry-After` and token-reset headers; a 429 without either waits 60 seconds. Successful responses also pace the next stage when its estimated token need exceeds the reported remainder. Waits longer than 60 seconds abort for a later run. Exhausted request quota stops without retrying. Auth/model/JSON/truncation errors fail immediately. A normal article uses three successful model calls; a revision uses at most two more. No paid research services were added. Existing provider usage/billing still applies to Groq calls.
- Strict structured output is used for the configured GPT-OSS models; other explicitly configured models use JSON mode with the same local schema validation. No silent model switching. The default draft output cap is 3,000 completion tokens, including reasoning; plan/review caps are 1,500. Total source context is bounded to 6,000 characters. A conservative bytes/3 input-token estimate reduces output allowance within a 7,500-token request budget, below the documented 8K Groq free-tier TPM cap. This is a heuristic, not a provider tokenizer or an account quota guarantee. Requests that cannot leave 1,000 output tokens fail before calling the provider; articles are never partially reviewed to squeeze them in. Truncated responses are rejected.
- CLI/log errors contain application-owned codes and allowlisted numeric quota diagnostics (stage, attempts, status, token estimate, remaining quota and reset seconds), never raw provider bodies/headers, keys or prompts. `LOG_CHANNEL=stdout`, already set by Docker, now has a defined log channel.

## Configuration

All settings are read through Laravel config, so config caching works. Do not put real keys in source or in `.env.example`.

| Variable | Default | Meaning |
| --- | --- | --- |
| `AI_API_KEY` | existing value | Preferred private credential. Existing `GROQ_API_KEY` then `OPENAI_API_KEY` remain fallback aliases. |
| `AI_API_URL` | inferred from selected key | Existing Groq/OpenAI chat-completions endpoint; explicit value is preserved and must be an approved endpoint. |
| `AI_MODEL` | `openai/gpt-oss-120b` for Groq | Existing value is preserved. No key rotation or model discovery occurs. |
| `BLOG_AUTO_PUBLISH` | `false` | Opt in only after live editorial review. |
| `BLOG_MAX_TOKENS` | `3000` | Draft completion ceiling, bounded to 1,000–10,000 and further limited by the request budget. |
| `BLOG_REQUEST_TOKEN_BUDGET` | `7500` | Conservative estimated total input/output budget; tune only against the actual account limit. |
| `BLOG_RESEARCH_CHARS` | `6000` | Total source text sent per stage, divided across the retrieved sources. |

Retrieval allowlists, source counts, retry limits, one-revision cap and freshness window live in `backend/config/blog_agent.php`. Catalogue URLs and categories live in `backend/config/blog_topics.php`. No new required secret is introduced; existing private server credentials work as before.

Optional GitHub `AI_API_KEY` wiring also addresses the earlier deployment request. If that secret is set, the SSH deployment passes it through a private temporary Compose environment file and `docker-compose.ai.yml`, injecting **only** the key into the container. The server `.env`, model, URL, app key and JWT secret are not rewritten by this change. If absent, the overlay is not used, so the existing server `.env` remains the source of AI settings. The original `.env` backup/restore deployment protection remains. Do not add a revoked or unintended key to GitHub: a provided secret takes precedence over a server `.env` key. A later manual container recreation must use the same credential source; plain Compose does not know an optional GitHub secret.

## Commands

```bash
# Existing command, now draft-only unless explicitly configured otherwise.
php artisan blog:generate

# No posts, audit files or command lock writes. Uses live research/API quota.
php artisan blog:generate --dry-run --topic="SSH hardening: testing authentication changes without locking yourself out"

# Force a private draft even when auto-publication was configured.
php artisan blog:generate --draft --topic="Cross-validation and data leakage in machine learning pipelines"

# Read the latest rejected draft's feedback and failed blocks. No API call.
php artisan blog:report
# For a particular run, pass the exact private report path printed by generation.

# Explicit source candidates for a manual topic (repeat --source).
php artisan blog:generate --dry-run --topic="Past Lives: distance and memory" \
  --source="https://a24films.com/films/past-lives" \
  --source="https://a24films.com/notes/2023/06/a-note-from-celine-song"
```

Dry run still reads existing titles for deduplication and makes network/API requests, but it does not save a post/report or obtain a persistent command lock. A normal command uses an owner-aware file-cache lock for 30 minutes. The scheduler also uses `withoutOverlapping(30)`. The stable unique slug protects identical-topic retries. A rejected run returns nonzero and logs reason codes; inspect these instead of assuming a quiet scheduler succeeded.

## Tests and sample output

Run from `backend`:

```bash
php vendor/bin/phpunit
```

Tests use in-memory SQLite, synthetic source transport responses, fake Groq responses and an isolated evidence disk. They never use a production API key or publish a live post. They cover the full save/publication path, revocation/model failures, bounded retries, malformed/truncated output, absent research, source provenance, false film credits, unsupported production claims, invented security statistics, Markdown failures, duplicate prevention, dry runs, safety holds and SSRF controls.

Clearly labelled, renderer-produced simulations:

- [Cybersecurity example](examples/cybersecurity.md)
- [AI/ML example](examples/ai_ml.md)
- [Film/TV example](examples/film_tv.md)

The samples use mocked evidence and a mocked accepting reviewer. They demonstrate style and rendering only. They are not represented as independently verified research, and are not inserted into the blog database.

## Safe Azure rollout — only after approval

No migration, volume deletion, reseeding or secret rotation is needed for V2. Do not use `migrate:fresh`, `docker compose down -v`, or replace the production `.env` with `.env.example`.

1. Before deploying, on the VM, verify the running container and make a consistent SQLite backup inside the persistent data volume:

```bash
sudo docker ps --filter name=backend-api
sudo docker exec backend-api php -r '$db = new PDO("sqlite:".getenv("DB_DATABASE")); $db->exec("PRAGMA busy_timeout=10000"); $dir = "/var/data/backups"; if (!is_dir($dir)) mkdir($dir, 0700, true); $path = $dir."/before-blog-v2-".gmdate("Ymd-His").".sqlite"; $db->exec("VACUUM INTO ".$db->quote($path)); echo "Backup created: ".$path.PHP_EOL;'
```

Stop if the backup fails. Copy that backup to your normal off-VM backup destination as well. Preserve the existing `.env` privately if present; do not print its contents. Confirm `BLOG_AUTO_PUBLISH` is absent or `false` (the default), using `sudo nano /home/azureuser/My-Portfolio/backend/.env` only if an existing override needs adjustment. Keep the current key/model/URL values.

2. Review/merge the intended changes into local `main`. **Only after deployment approval**, push that reviewed branch:

```bash
git push origin main
```

The existing GitHub Actions workflow builds the frontend category assets and backend, preserves named volumes and the server environment, and runs its normal health checks. Backend regression tests now run before deployment with test-only credentials and an in-memory database. The existing workflow still recreates the backend container and runs its pre-existing migrations/startup behaviour; V2 does not replace that deployment design. Review those existing operational behaviours before rollout rather than assuming zero downtime.

3. On the VM, verify config presence without exposing the key, then inspect the schedule:

```bash
sudo docker exec -w /var/www/html backend-api php artisan config:clear
sudo docker exec -w /var/www/html backend-api php artisan tinker --execute='dump(["ai_key_present" => filled(config("blog_agent.api_key")), "model" => config("blog_agent.model"), "auto_publish" => config("blog_agent.auto_publish")]);'
sudo docker exec -w /var/www/html backend-api php artisan schedule:list
```

Expected: `ai_key_present=true`, your working model, `auto_publish=false`, and `blog:generate` at 09:00 in the existing Laravel application timezone. The timezone was deliberately not changed. No scheduler daemon was added; the host must continue invoking Laravel's scheduler.

4. Run the research preview, then explicitly save one draft if it passes:

```bash
sudo docker exec -w /var/www/html backend-api php artisan blog:generate --dry-run --topic="Cross-validation and data leakage in machine learning pipelines"
sudo docker exec -w /var/www/html backend-api php artisan blog:generate --draft --topic="Cross-validation and data leakage in machine learning pipelines"
sudo docker logs --since 30m backend-api 2>&1 | grep 'blog_agent'
```

If that topic already exists, choose another narrow topic. The private report is under `/var/data/storage/app/private/blog-agent/reports/` with the supplied persistent storage setting. Review the draft in Admin → Blog Posts and compare it to the evidence report and original sources. Re-running an already-saved topic is intentionally rejected; this command never overwrites the draft.

5. Verify the existing scheduler driver. If none is installed, edit the root crontab and add the following **once**, preserving other jobs:

```bash
sudo crontab -l
sudo crontab -e
# Add only if an equivalent schedule:run entry is absent:
* * * * * /usr/bin/docker exec -w /var/www/html backend-api php artisan schedule:run >> /var/log/portfolio-scheduler.log 2>&1
```

6. Leave draft-only enabled during evaluation. After adequate human review, enabling `BLOG_AUTO_PUBLISH=true` in the existing private server `.env` and clearing Laravel config allows eligible future articles to publish at the existing daily time. Operational safety holds still apply. This is a separate operator decision, not part of the deployment performed here.

## Troubleshooting

| Reason | Action |
| --- | --- |
| `api_credentials_missing` | Restore the existing private server credential or configure the optional GitHub secret and deploy through its workflow. Do not paste a key into logs/chat. |
| `api_key_invalid_or_revoked` | Check the credential privately in the provider dashboard. No automatic rotation occurs. |
| `api_model_unavailable` | Verify the currently configured model against provider documentation; the agent does not change it automatically. |
| `api_rate_limited` / `api_retry_later` | Inspect the printed `Provider diagnostics` stage/reset/wait fields and wait for the provider's quota window. Do not repeatedly restart generation. |
| `api_daily_request_limit` / `api_quota_exhausted` | The provider reports exhausted quota. Check the account limits/reset window; short retries cannot restore quota. |
| `api_request_exceeds_token_limit` | The estimated next request exceeds the reported token limit. Adjust the request budget against your actual provider allowance. |
| `api_context_budget_exceeded` | Choose a narrower article or increase the request budget only if your account permits it. The complete draft must fit in the review; its claims are not silently omitted. |
| `research_insufficient_sources:source_tls_failed` | Repair the OS/PHP CA trust configuration. Never disable TLS verification. Docker explicitly installs `ca-certificates`. |
| `source_redirect_blocked` | Review and configure the final canonical URL if its host is approved. |
| `research_fresh_evidence_required` | Supply at least two relevant recent dated sources or choose an evergreen angle. |
| `quality_rejected:*` | Review the source material and returned reason codes. Do not bypass the gate by increasing a score. |
| `topic_duplicate` / `article_duplicate` | Review the existing draft/post instead of generating another copy. |

## Reference documentation

- [Groq structured output support](https://console.groq.com/docs/structured-outputs)
- [Groq limits and retry headers](https://console.groq.com/docs/rate-limits)
- [cURL DNS pinning](https://curl.se/libcurl/c/CURLOPT_RESOLVE.html)

These explain provider/transport behaviour. They are not evidence for any generated article.

### Inspecting a quality rejection

API failures, including rate limits during any stage, do not create a final rejected-draft report. For these failures use the printed provider diagnostics. `blog:report` may show an older quality rejection or no report; it is not an API failure history.

`review_block_3_unsupported_or_unsafe` refers to the fourth structured content block (the review index is zero-based). It is not an API key/quota error, and it does not independently prove that the claim is false: the reviewer found insufficient support or a safety concern. After this diagnostics update, failed normal runs print a unique private report path. On the server, inspect it with:

```bash
sudo docker exec -w /var/www/html backend-api php artisan blog:report
```

The report command defaults to the latest rejection, or accepts the exact `reports/rejected-...json` path printed by generation. It displays model feedback and one-based block numbers without saving/publishing anything or making an API call. Raw terminal formatting is disabled and the configured API key is redacted if echoed in feedback. The reports remain on the unserved private disk and are never returned by public blog endpoints. Earlier failed runs that predate this change cannot be recovered; generate once with the updated version to capture one. The quality gates and one-revision limit have not been relaxed.
