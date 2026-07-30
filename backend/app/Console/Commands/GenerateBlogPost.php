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
        $topicPrompt = $customTopic
            ? "Topic: {$customTopic}"
            : "Topic: Pick an exciting, modern topic in Software Engineering, DevOps, MLOps, System Architecture, Linux, or Web Development.";

        $systemPrompt = "You are an expert technical blog writer and senior software engineer. You write engaging, highly informative tech articles for developers. Return ONLY a valid JSON object with the following keys:\n"
            . "- \"title\": a catchy, professional technical blog post title\n"
            . "- \"excerpt\": a 2-3 sentence summary capturing the key takeaway of the article\n"
            . "- \"content\": a comprehensive, well-structured article written in clean Markdown format including headings (##), code snippets (```), bullet points, and practical insights.\n\n"
            . "Do not wrap the JSON response in backticks or Markdown block formatting.";

        $userPrompt = "Please write a fresh, unique technical blog post.\n{$topicPrompt}";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(60)->post($apiUrl, [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'temperature' => 0.7,
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

            $blog = Blog::create([
                'title'        => $title,
                'slug'         => $slug,
                'excerpt'      => $excerpt,
                'content'      => $content,
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
