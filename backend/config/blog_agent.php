<?php

$key = env('AI_API_KEY') ?: (env('GROQ_API_KEY') ?: env('OPENAI_API_KEY'));
$groq = str_starts_with((string) $key, 'gsk_') || (! $key && ! env('OPENAI_API_KEY'));

return [
    'api_key' => $key,
    'api_url' => env('AI_API_URL') ?: ($groq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'),
    'model' => env('AI_MODEL') ?: ($groq ? 'openai/gpt-oss-120b' : 'gpt-4o-mini'),
    'auto_publish' => (bool) env('BLOG_AUTO_PUBLISH', false),
    'max_tokens' => (int) env('BLOG_MAX_TOKENS', 3000),
    'request_token_budget' => (int) env('BLOG_REQUEST_TOKEN_BUDGET', 7500),
    'research_chars' => (int) env('BLOG_RESEARCH_CHARS', 6000),
    'api_attempts' => 3,
    'max_revisions' => 1,
    'retry_delay' => 2,
    'max_retry_wait' => 60,
    'min_sources' => 2,
    'max_sources' => 4,
    'source_timeout' => 12,
    'max_source_bytes' => 524288,
    'max_source_chars' => 14000,
    'fresh_days' => 30,
    'lock_store' => 'file',
    // Exact hosts only. Adding a host is a code-reviewed trust decision.
    'source_hosts' => [
        'man.openbsd.org', 'www.openssh.com', 'docs.docker.com', 'docs.github.com',
        'www.rfc-editor.org', 'developer.mozilla.org', 'react.dev', 'laravel.com',
        'fastapi.tiangolo.com', 'scikit-learn.org', 'pytorch.org', 'arxiv.org',
        'research.google', 'www.postgresql.org', 'www.sqlite.org', 'git-scm.com',
        'docs.godotengine.org', 'godotengine.org', 'a24films.com', 'www.netflix.com',
        'www.riotgames.com', 'science.nasa.gov', 'www.esa.int', 'developer.android.com',
    ],
    'topics' => require __DIR__.'/blog_topics.php',
];
