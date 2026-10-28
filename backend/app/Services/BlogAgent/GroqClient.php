<?php

namespace App\Services\BlogAgent;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Sleep;

class GroqClient
{
    private ?array $lastLimits = null;

    private int $lastResponseAt = 0;

    public function ready(): void
    {
        if (! config('blog_agent.api_key')) {
            throw new AgentException('api_credentials_missing');
        }
        $url = config('blog_agent.api_url');
        if (! in_array($url, ['https://api.groq.com/openai/v1/chat/completions', 'https://api.openai.com/v1/chat/completions'], true)) {
            throw new AgentException('api_endpoint_invalid');
        }
    }

    public function json(string $stage, string $system, array $data): array
    {
        $this->ready();
        $model = config('blog_agent.model');
        $schema = Schemas::get($stage);
        $catalog = null;
        if ($stage === 'draft' || ($stage === 'review' && isset($data['sources'], $data['draft']))) {
            $evidence = new EvidenceCatalog;
            $catalog = $evidence->build($data['sources'] ?? []);
            if (count(array_unique(array_column($catalog, 'source_id'))) < 2) {
                throw new AgentException('research_insufficient_passages');
            }
            $data['sources'] = $evidence->context($data['sources'], $catalog);
            foreach (['previous_draft', 'draft'] as $key) {
                if (isset($data[$key])) {
                    $data[$key] = $evidence->references($data[$key], $catalog);
                }
            }
            if ($stage === 'draft') {
                $schema = Schemas::draftReferences();
            }
        }
        $strict = in_array($model, ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'], true);
        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $system.($strict ? "\nReturn only JSON matching the requested schema." : "\nReturn only JSON matching this schema: ".json_encode($schema))],
                ['role' => 'user', 'content' => json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)],
            ],
            'temperature' => 0.3,
            'max_completion_tokens' => $stage === 'draft' ? min(10000, max(1000, (int) config('blog_agent.max_tokens'))) : 1500,
            'response_format' => $strict
                ? ['type' => 'json_schema', 'json_schema' => ['name' => $stage, 'strict' => true, 'schema' => $schema]]
                : ['type' => 'json_object'],
        ];
        if ($strict) {
            $payload['reasoning_effort'] = 'low';
        }
        // A conservative English/code heuristic, not an exact provider tokenizer.
        // Do not silently drop parts of an article to make its review fit.
        $estimatedInput = (int) ceil(strlen(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) / 3);
        $available = min(32000, max(2000, (int) config('blog_agent.request_token_budget'))) - $estimatedInput;
        if ($available < 1000) {
            throw new AgentException('api_context_budget_exceeded');
        }
        $payload['max_completion_tokens'] = min($payload['max_completion_tokens'], $available);
        $estimatedTotal = $estimatedInput + $payload['max_completion_tokens'];
        $this->paceNextStage($stage, $estimatedTotal);
        $attempts = min(3, max(1, (int) config('blog_agent.api_attempts')));
        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            try {
                $response = Http::withToken(config('blog_agent.api_key'))->acceptJson()
                    ->connectTimeout(8)->timeout(60)
                    ->withOptions(['verify' => true, 'allow_redirects' => false])
                    ->post(config('blog_agent.api_url'), $payload);
            } catch (ConnectionException) {
                if ($attempt === $attempts) {
                    throw new AgentException('api_connection_failed', diagnostics: ['stage' => $stage, 'attempts' => $attempt]);
                }
                $this->pause($attempt);

                continue;
            }
            $details = $this->rateDetails($response, $stage, $estimatedTotal) + ['attempts' => $attempt];
            if ($response->status() === 429 || $response->serverError()) {
                if (($details['remaining_requests'] ?? null) === 0) {
                    throw new AgentException('api_daily_request_limit', diagnostics: $details);
                }
                if ($response->json('error.code') === 'insufficient_quota') {
                    throw new AgentException('api_quota_exhausted', diagnostics: $details);
                }
                if ($attempt === $attempts) {
                    throw new AgentException($response->status() === 429 ? 'api_rate_limited' : 'api_unavailable', diagnostics: $details);
                }
                $wait = $details['retry_after_seconds'] ?? null;
                if ($response->status() === 429) {
                    // Some compatible responses omit Retry-After. Use token reset
                    // headers when available, otherwise allow a whole minute.
                    $reset = $details['reset_tokens_seconds'] ?? null;
                    $wait = max($wait ?? ($reset === null ? 60 : 0), $reset ?? 0);
                }
                $wait ??= 0;
                if ($wait > min(60, config('blog_agent.max_retry_wait'))) {
                    throw new AgentException('api_retry_later', diagnostics: $details + ['wait_seconds' => $wait]);
                }
                $this->pause($attempt, $wait, $stage);

                continue;
            }
            if (! $response->successful()) {
                $reason = match ($response->status()) {
                    401 => 'api_key_invalid_or_revoked',
                    403 => 'api_access_denied',
                    404 => 'api_model_unavailable',
                    default => 'api_request_rejected',
                };
                if (in_array($response->json('error.code'), ['model_decommissioned', 'model_not_found'], true)) {
                    $reason = 'api_model_unavailable';
                }
                throw new AgentException($reason, diagnostics: $details);
            }
            if ($response->json('choices.0.finish_reason') !== 'stop') {
                throw new AgentException('api_incomplete_response');
            }
            $raw = $response->json('choices.0.message.content');
            if (! is_string($raw) || strlen($raw) > 100000) {
                throw new AgentException('api_invalid_json');
            }
            try {
                $result = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw new AgentException('api_invalid_json');
            }
            if (! Schemas::valid($result, $schema)) {
                throw new AgentException('api_schema_invalid');
            }

            $this->lastLimits = $details;
            $this->lastResponseAt = now()->timestamp;

            return $stage === 'draft' ? (new EvidenceCatalog)->resolve($result, $catalog) : $result;
        }
        throw new AgentException('api_unavailable');
    }

    private function pause(int $attempt, int $minimum = 0, ?string $stage = null): void
    {
        $seconds = max($minimum, min(30, (int) config('blog_agent.retry_delay') * (2 ** ($attempt - 1))));
        if ($seconds > 0) {
            if (! app()->runningUnitTests()) {
                Log::info('blog_agent.waiting_for_provider', ['stage' => $stage, 'seconds' => $seconds]);
            }
            Sleep::for($seconds)->seconds();
        }
    }

    private function paceNextStage(string $stage, int $estimatedTotal): void
    {
        if ($this->lastLimits === null) {
            return;
        }
        $details = array_replace($this->lastLimits, ['stage' => $stage, 'requested_tokens_estimate' => $estimatedTotal, 'attempts' => 0]);
        $elapsed = max(0, now()->timestamp - $this->lastResponseAt);
        if (($details['remaining_requests'] ?? null) === 0 && $elapsed < ($details['reset_requests_seconds'] ?? 86400)) {
            throw new AgentException('api_daily_request_limit', diagnostics: $details);
        }
        if (isset($details['token_limit']) && $estimatedTotal > $details['token_limit']) {
            throw new AgentException('api_request_exceeds_token_limit', diagnostics: $details);
        }
        if (! isset($details['remaining_tokens']) || $details['remaining_tokens'] >= $estimatedTotal) {
            return;
        }
        $wait = max(0, ($details['reset_tokens_seconds'] ?? 60) - $elapsed);
        if ($wait > min(60, config('blog_agent.max_retry_wait'))) {
            throw new AgentException('api_retry_later', diagnostics: $details + ['wait_seconds' => $wait]);
        }
        if ($wait > 0) {
            $this->pause(0, $wait, $stage);
        }
    }

    /** Only allowlisted numeric quota fields, never response bodies or arbitrary headers. */
    private function rateDetails(Response $response, string $stage, int $estimatedTotal): array
    {
        $details = ['stage' => $stage, 'http_status' => $response->status(), 'requested_tokens_estimate' => $estimatedTotal];
        foreach (['token_limit' => 'x-ratelimit-limit-tokens', 'remaining_tokens' => 'x-ratelimit-remaining-tokens',
            'remaining_requests' => 'x-ratelimit-remaining-requests'] as $name => $header) {
            $value = $response->header($header);
            if (preg_match('/^\d{1,12}$/', $value)) {
                $details[$name] = (int) $value;
            }
        }
        foreach (['reset_tokens_seconds' => 'x-ratelimit-reset-tokens', 'reset_requests_seconds' => 'x-ratelimit-reset-requests'] as $name => $header) {
            $seconds = $this->duration($response->header($header));
            if ($seconds !== null) {
                $details[$name] = $seconds;
            }
        }
        $retry = $response->header('Retry-After');
        $seconds = $this->duration($retry);
        if ($seconds === null && strlen($retry) <= 64 && preg_match('/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/', $retry)) {
            $timestamp = strtotime($retry);
            $seconds = $timestamp === false ? null : max(0, $timestamp - now()->timestamp);
        }
        if ($seconds !== null) {
            $details['retry_after_seconds'] = $seconds;
        }

        return $details;
    }

    private function duration(string $value): ?int
    {
        if (strlen($value) > 40 || $value === '') {
            return null;
        }
        if (preg_match('/^\d+(?:\.\d+)?$/', $value)) {
            return (int) min(604800, ceil((float) $value));
        }
        if (! preg_match('/^(?:\d+(?:\.\d+)?(?:ms|s|m|h|d))+$/', $value)) {
            return null;
        }
        preg_match_all('/(\d+(?:\.\d+)?)(ms|s|m|h|d)/', $value, $parts, PREG_SET_ORDER);
        $seconds = 0;
        foreach ($parts as $part) {
            $seconds += (float) $part[1] * ['ms' => 0.001, 's' => 1, 'm' => 60, 'h' => 3600, 'd' => 86400][$part[2]];
        }

        return (int) min(604800, ceil($seconds));
    }
}
