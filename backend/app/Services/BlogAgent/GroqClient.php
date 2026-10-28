<?php

namespace App\Services\BlogAgent;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class GroqClient
{
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
        $attempts = min(3, max(1, (int) config('blog_agent.api_attempts')));
        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            try {
                $response = Http::withToken(config('blog_agent.api_key'))->acceptJson()
                    ->connectTimeout(8)->timeout(60)
                    ->withOptions(['verify' => true, 'allow_redirects' => false])
                    ->post(config('blog_agent.api_url'), $payload);
            } catch (ConnectionException) {
                if ($attempt === $attempts) {
                    throw new AgentException('api_connection_failed');
                }
                $this->pause($attempt);

                continue;
            }
            if ($response->status() === 429 || $response->serverError()) {
                if ($attempt === $attempts) {
                    throw new AgentException($response->status() === 429 ? 'api_rate_limited' : 'api_unavailable');
                }
                $retryAfter = $response->header('Retry-After');
                $wait = is_numeric($retryAfter) ? (int) ceil((float) $retryAfter) : max(0, (strtotime($retryAfter ?: '') ?: time()) - time());
                if ($wait > min(60, config('blog_agent.max_retry_wait'))) {
                    throw new AgentException('api_retry_later');
                }
                $this->pause($attempt, $wait);

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
                throw new AgentException($reason);
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

            return $result;
        }
        throw new AgentException('api_unavailable');
    }

    private function pause(int $attempt, int $minimum = 0): void
    {
        $seconds = max($minimum, min(30, (int) config('blog_agent.retry_delay') * (2 ** ($attempt - 1))));
        if ($seconds > 0) {
            sleep($seconds);
        }
    }
}
