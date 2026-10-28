<?php

namespace App\Services\BlogAgent;

use App\Models\Blog;
use Illuminate\Support\Str;

class TopicSelector
{
    public function select(?string $manual, array $sources = []): array
    {
        $catalogue = config('blog_agent.topics');
        if ($manual === null && $sources) {
            throw new AgentException('source_requires_topic');
        }
        if ($manual !== null) {
            $title = trim($manual);
            if ($this->normalize($title) === '' || mb_strlen($title) > 220) {
                throw new AgentException('topic_invalid');
            }
            $match = collect($catalogue)->first(fn ($entry) => collect($entry['keywords'])->contains(fn ($keyword) => str_contains(strtolower($title), $keyword)));
            $topic = ['title' => $title, 'category' => $match['category'] ?? $this->category($title), 'sources' => $sources ?: ($match['sources'] ?? [])];
        } else {
            $topic = collect($catalogue)->shuffle()->first(fn ($entry) => ! $this->duplicate($entry['title']));
            if (! $topic) {
                throw new AgentException('topics_exhausted');
            }
        }
        $topic['key'] = 'agent-'.substr(hash('sha256', $this->normalize($topic['title'])), 0, 32);
        if ($this->duplicate($topic['title'], $topic['key'])) {
            throw new AgentException('topic_duplicate');
        }
        $topic['time_sensitive'] = (bool) preg_match('/\b(20\d{2}|latest|current|upcoming|next|expected|release|launch|news|today|versus|vs\.?|best|new in|season \d+)\b/i', $topic['title']);
        $topic['outdated'] = preg_match_all('/\b20\d{2}\b/', $topic['title'], $years) && min($years[0]) < (int) date('Y');

        return $topic;
    }

    public function duplicate(string $title, ?string $key = null): bool
    {
        if ($key && Blog::where('slug', $key)->exists()) {
            return true;
        }
        $normal = $this->normalize($title);
        $tokens = array_unique(explode(' ', $normal));
        foreach (Blog::pluck('title') as $existing) {
            $other = $this->normalize($existing);
            similar_text($normal, $other, $similarity);
            $otherTokens = array_unique(explode(' ', $other));
            $overlap = count(array_intersect($tokens, $otherTokens)) / max(1, min(count($tokens), count($otherTokens)));
            if ($normal === $other || $similarity >= 86 || (count($tokens) >= 3 && count($otherTokens) >= 3 && $overlap >= 0.8)) {
                return true;
            }
        }

        return false;
    }

    private function normalize(string $title): string
    {
        $words = explode(' ', str_replace('-', ' ', Str::slug($title)));

        return implode(' ', array_values(array_diff($words, ['a', 'an', 'the', 'to', 'in', 'of', 'for', 'and', 'with'])));
    }

    private function category(string $title): string
    {
        foreach ([
            'film_tv' => 'film|movie|television|cinema|series|director|screenplay',
            'cybersecurity' => 'security|hacking|authentication|firewall|tls|ssh',
            'ai_ml' => 'machine learning|llm|neural|model|ai|embedding',
            'devops' => 'devops|cloud|docker|linux|azure|aws|kubernetes',
            'games' => 'game|gaming|engine|gameplay|unreal|unity',
            'science' => 'science|space|quantum|physics|telescope|research',
            'databases_tools' => 'database|sql|git|redis|tool',
            'web_mobile' => 'web|mobile|react|android|ios|typescript|laravel',
        ] as $category => $terms) {
            if (preg_match('/\b('.$terms.')\b/i', $title)) {
                return $category;
            }
        }

        return 'software';
    }
}
