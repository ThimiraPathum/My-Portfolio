<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Blog;
use Carbon\Carbon;

class GenerateBlogPost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:generate {--topic= : Optional specific topic for the blog post}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automated AI Blog Agent that generates and publishes a tech blog post';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🤖 AI Blog Agent: Starting blog post generation...');

        $apiKey = env('AI_API_KEY') ?: (env('GROQ_API_KEY') ?: env('OPENAI_API_KEY'));

        if (!$apiKey) {
            $this->error('❌ AI_API_KEY is not set in your .env file!');
            return Command::FAILURE;
        }

        $isGroqKey = str_starts_with($apiKey, 'gsk_') || (bool) env('GROQ_API_KEY');

        $apiUrl = env('AI_API_URL') ?: (
            $isGroqKey
                ? 'https://api.groq.com/openai/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions'
        );

        $model = env('AI_MODEL') ?: (
            $isGroqKey ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'
        );

        $customTopic = $this->option('topic');

        if ($customTopic) {
            $topic = $customTopic;
        } else {
            $topics = [
                "GTA VI and the Evolution of Open-World Game Engines (RAGE Engine)",
                "Achieving Zero-Downtime Deployment with Docker",
                "Advanced Linux Performance Tuning Tips for Developers",
                "Building Scalable REST APIs with Laravel 11",
                "The Future of AI Agents in Automated Content Creation",
                "How Game Engines Are Shaping the Future of Real-Time 3D Graphics",
                "CI/CD Pipeline Design Patterns Every Developer Should Know",
                "Why Arch Linux Is the Best Learning Environment for DevOps Engineers",
                "FastAPI vs Flask vs Django: Choosing the Right Python Framework",
                "LangGraph vs LangChain: Building Stateful AI Workflows",
                "Unreal Engine 5 vs Unity: Which Should You Learn in 2025?",
                "Infrastructure as Code: Terraform vs Pulumi in 2025",
                "Linux Namespaces and cgroups: The Internals Behind Docker",
                "Database Indexing Strategies That Actually Matter at Scale",
                "Running Local LLMs with Ollama: A Practical Developer Guide",
                "Kubernetes for Developers: When You Actually Need It",
                "systemd Mastery: From Service Files to Boot Optimization",
                "Event-Driven Architecture with Redis Pub/Sub and Kafka",
                "MLOps Fundamentals: From Model Training to Production",
                "GitHub Actions vs GitLab CI: A Practical Comparison",
                "Azure vs AWS for Students: Which Cloud to Learn First?",
                "JWT vs Session Auth: Security Tradeoffs Explained",
                "RAG Pipelines Explained: Giving LLMs a Memory",
                "Secrets Management in Production: HashiCorp Vault Deep Dive",
                "Serverless Architecture: Real Benefits and Hidden Costs",
                "Fine-Tuning vs Prompt Engineering: When to Use Each",
                "Monitoring Your Stack: Prometheus, Grafana, and Beyond",
                "Designing for Failure: Resilience Patterns in Distributed Systems",
                "From Student to Junior DevOps Engineer: What Actually Matters",
                "Cost Optimization Strategies for Cloud-Native Apps",
                "Building a Portfolio That Gets You an Internship in 2025",
                "Technical Blogging for Developers: Why You Should Start Today",
                "Open Source Contributions: How to Start and Why It Matters",
            ];
            $topic = $topics[array_rand($topics)];
        }

        $systemPrompt = 'You are an expert tech blog writer. You MUST output ONLY a valid JSON object. Use this exact JSON schema: {"title": "string", "excerpt": "string", "content": "string", "tags": ["string", "string"]}. Ensure all strings are properly escaped (use \n for newlines, \" for quotes inside the content). Do not forget to properly close the "content" string and include the "tags" array at the end.';

        $userPrompt = "Write a comprehensive technical blog post about: {$topic}";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(120)->post($apiUrl, [
                'model'           => $model,
                'messages'        => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'max_tokens'      => 4000,
                'temperature'     => 0.7,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->failed()) {
                $this->error('❌ API Request failed: ' . $response->body());
                return Command::FAILURE;
            }

            $responseData = $response->json();
            $rawContent = $responseData['choices'][0]['message']['content'] ?? '';

            // Clean potential markdown JSON fencing (e.g. ```json ... ```)
            $cleanJson = trim($rawContent);
            $cleanJson = preg_replace('/^```(?:json)?/i', '', $cleanJson);
            $cleanJson = preg_replace('/```$/', '', $cleanJson);
            $cleanJson = trim($cleanJson);

            $parsedData = json_decode($cleanJson, true);

            if (!$parsedData || !isset($parsedData['title']) || !isset($parsedData['content'])) {
                $this->error('❌ Failed to parse JSON from AI response. Raw output: ' . substr($rawContent, 0, 300));
                return Command::FAILURE;
            }

            $title = trim($parsedData['title']);
            $excerpt = trim($parsedData['excerpt'] ?? '');
            $content = trim($parsedData['content']);

            // Unique slug generation
            $baseSlug = Str::slug($title);
            $slug = $baseSlug;

            while (Blog::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-" . Str::random(4);
            }

            // Fetch cover image from Unsplash
            $coverImageUrl = null;
            $unsplashKey = env('UNSPLASH_ACCESS_KEY');

            if ($unsplashKey) {
                try {
                    $query = urlencode($topic);
                    $unsplashResponse = Http::timeout(10)->get("https://api.unsplash.com/photos/random?query={$query}&client_id={$unsplashKey}");

                    if ($unsplashResponse->successful()) {
                        $coverImageUrl = $unsplashResponse->json('urls.regular');
                    }
                } catch (\Throwable $e) {
                    $this->warn('⚠️ Unsplash API call failed: ' . $e->getMessage());
                }
            }

            // Fallback cover image if Unsplash key is not set or API fails
            if (!$coverImageUrl) {
                $coverImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";
            }

            $blog = Blog::create([
                'title'        => $title,
                'slug'         => $slug,
                'excerpt'      => $excerpt,
                'content'      => $content,
                'cover_image'  => $coverImageUrl,
                'status'       => 'published',
                'published_at' => Carbon::now(),
                'coming_soon'  => false,
            ]);

            $this->info("✅ Successfully generated & published new blog post!");
            $this->line("   ID:      {$blog->id}");
            $this->line("   Title:   {$blog->title}");
            $this->line("   Slug:    {$blog->slug}");
            $this->line("   Excerpt: {$blog->excerpt}");

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->error('❌ Error generating blog post: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
