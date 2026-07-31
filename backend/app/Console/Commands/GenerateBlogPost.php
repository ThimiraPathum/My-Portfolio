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

                // ─── Game Engines ───────────────────────────────────────────
                "Unreal Engine 5: Lumen and Nanite Explained for Developers",
                "Unity vs Unreal Engine: Which Should You Learn in 2026",
                "Godot 4: The Open Source Game Engine Taking Over Indie Dev",
                "CryEngine Deep Dive: What Makes It Different from Unreal",
                "Amazon Lumberyard to O3DE: The Open 3D Engine Journey",
                "GameMaker Studio 2: Still Relevant for 2D Game Development",
                "RPG Maker: Building Story-Driven Games Without Code",
                "Bevy: The Rust-Based Game Engine You Should Know About",
                "Source Engine Legacy: How Valve Changed Game Development",
                "id Tech 7: The Engine Behind DOOM Eternal",
                "Frostbite Engine: EA's Proprietary Powerhouse Explained",
                "REDengine 4: How CD Projekt Red Built Cyberpunk 2077",
                "AnvilNext: The Engine Behind Assassin's Creed Games",
                "IW Engine: Call of Duty's Core Technology Explained",
                "Creation Engine 2: Starfield and the Future of Bethesda Games",

                // ─── Released Games Reviews ──────────────────────────────────
                "Elden Ring: Why FromSoftware's Open World Changed Gaming",
                "The Last of Us Part I Remake: Is It Worth It on PC",
                "God of War Ragnarok: A Deep Dive into Story and Combat",
                "Cyberpunk 2077 Phantom Liberty: Redemption Arc Complete",
                "Baldur's Gate 3: How Larian Studios Redefined RPGs",
                "Red Dead Redemption 2: Still the Best Open World in 2026",
                "Hollow Knight: Why This Indie Game Became a Masterpiece",
                "Hades: Roguelike Game Design Done Perfectly",
                "Stardew Valley: How One Developer Built a Beloved Game",
                "Minecraft: The Endless Sandbox That Defined a Generation",
                "The Witcher 3 Wild Hunt: A Technical and Narrative Breakdown",
                "Death Stranding: Kojima's Divisive Masterpiece Revisited",
                "Dark Souls Trilogy: How Difficulty Became a Design Philosophy",
                "Horizon Forbidden West: Open World Evolution on PS5",
                "Spider-Man 2: Insomniac's Technical Marvel on PS5",
                "Alan Wake 2: Remedy's Most Ambitious Game Yet",
                "Starfield: What Went Right and What Went Wrong",
                "Hogwarts Legacy: Building an Open World Wizarding Game",
                "Dave the Diver: Why the Internet Fell in Love with This Game",
                "Lies of P: The Best Soulslike Not Made by FromSoftware",

                // ─── Upcoming Games ─────────────────────────────────────────
                "GTA VI: Everything We Know About Rockstar's Next Game",
                "Elder Scrolls VI: What Fans Are Expecting from Bethesda",
                "Fable Reboot: Microsoft's Ambitious RPG Revival",
                "Hollow Knight Silksong: The Most Anticipated Indie Sequel",
                "Death Stranding 2: Kojima's Next Connected World",
                "Ghost of Tsushima 2: What Sony's Sequel Needs to Deliver",
                "Monster Hunter Wilds: Capcom's Biggest Hunt Yet",
                "Avowed: Obsidian's First-Person RPG in the Pillars World",
                "Metroid Prime 4: Nintendo's Long-Awaited Return to Samus",
                "Perfect Dark Reboot: The Spy Shooter Coming Back",

                // ─── AI & Machine Learning ───────────────────────────────────
                "How Large Language Models Actually Work Under the Hood",
                "RAG vs Fine-Tuning: Choosing the Right AI Strategy",
                "Vector Databases Explained: Pinecone Weaviate and Chroma",
                "LangChain vs LlamaIndex: Which Framework Should You Use",
                "Running Local LLMs with Ollama: A Complete Setup Guide",
                "Groq vs OpenAI API: Speed Cost and Quality Compared",
                "AI Agents Explained: How They Plan Execute and Remember",
                "LangGraph: Building Stateful Multi-Step AI Workflows",
                "Embeddings Explained: How AI Understands Meaning in Text",
                "Stable Diffusion: How AI Image Generation Works",
                "GPT-4o vs Claude 3.5: A Developer's Honest Comparison",
                "Building a RAG System from Scratch with Python",
                "AI in Code Review: GitHub Copilot Cursor and Beyond",
                "Reinforcement Learning from Human Feedback Explained",
                "The Transformer Architecture: Attention Is All You Need",
                "Multimodal AI: When Models Can See Hear and Read",
                "AI Safety and Alignment: Why It Matters for Developers",
                "Edge AI: Running Models on Device with TensorFlow Lite",
                "Hugging Face: The GitHub of Machine Learning Explained",
                "Neural Networks from Scratch: Understanding Backpropagation",

                // ─── DevOps & Infrastructure ─────────────────────────────────
                "Docker vs Podman: Container Tools Compared in 2026",
                "Kubernetes for Beginners: Pods Nodes and Clusters Explained",
                "GitHub Actions vs GitLab CI: Which Pipeline Should You Use",
                "Terraform vs Ansible: Infrastructure as Code Compared",
                "Linux for Developers: Essential Commands You Must Know",
                "Nginx vs Caddy: Modern Web Server Comparison",
                "Monitoring with Prometheus and Grafana: A Practical Guide",
                "Zero Downtime Deployments: Blue Green and Canary Explained",
                "Service Mesh with Istio: What It Is and When You Need It",
                "HashiCorp Vault: Secrets Management for Modern Apps",
                "ArgoCD: GitOps Continuous Delivery for Kubernetes",
                "Logging at Scale: ELK Stack vs Loki vs Datadog",
                "SRE vs DevOps: What Is the Difference and Does It Matter",
                "Self-Hosted vs Cloud: When to Run Your Own Infrastructure",
                "CI/CD Pipeline Design: Best Practices for Fast Delivery",
                "Linux Namespaces and Cgroups: How Containers Actually Work",
                "Arch Linux for Developers: Why It Is Worth the Setup",
                "SSH Hardening: Securing Your Server the Right Way",
                "Reverse Proxy Deep Dive: How Nginx Handles Your Traffic",
                "Database Backups: Strategies Every Developer Must Know",

                // ─── Web Development ─────────────────────────────────────────
                "React 19: What Is New and Should You Upgrade Now",
                "Next.js vs Remix: Choosing the Right React Framework",
                "TypeScript Tips Every Developer Should Know in 2026",
                "Tailwind CSS vs CSS Modules: Styling Approaches Compared",
                "FastAPI: The Python Backend Framework Taking Over",
                "Laravel 12: What Is New in PHP's Most Popular Framework",
                "GraphQL vs REST: Which API Design Should You Choose",
                "WebSockets vs Server-Sent Events: Real-Time Web Explained",
                "Vite vs Webpack: Why the Build Tool Ecosystem Shifted",
                "tRPC: End-to-End Type Safety Without GraphQL",
                "Framer Motion: Building Animations in React That Feel Good",
                "Supabase vs Firebase: Open Source vs Google's Platform",
                "Prisma ORM: Modern Database Access for Node Developers",
                "Edge Functions: Running Code Closer to Your Users",
                "Web Performance in 2026: Core Web Vitals and Beyond",

                // ─── TV Series ───────────────────────────────────────────────
                "Breaking Bad: Why It Remains the Gold Standard of TV Drama",
                "The Last of Us HBO Series: Adapting a Game Perfectly",
                "Severance Season 2: Apple TV's Best Show Gets Better",
                "Black Mirror: Every Episode Ranked by Tech Relevance",
                "Succession: A Masterclass in Character Writing",
                "The Bear: How a Cooking Show Became the Most Stressful TV",
                "Chernobyl Miniseries: How HBO Made the Perfect Docudrama",
                "Dark Netflix: The Most Complex Time Travel Story Ever Told",
                "Arcane: How Riot Games Made the Best Video Game Adaptation",
                "House of the Dragon: Game of Thrones Prequel Reviewed",
                "Shogun 2024: The Historical Drama That Won Everything",
                "True Detective Night Country: Arctic Horror Done Right",
                "Invincible Season 2: Amazon's Best Animated Series",
                "The Boys: Superhero Satire at Its Most Brutal",
                "Andor: Why It Is the Best Star Wars Content in Decades",
                "Silo: Apple TV's Dystopian Mystery Explained",
                "Fallout Series: How Amazon Nailed the Game Adaptation",
                "3 Body Problem Netflix: Science Fiction at Its Most Ambitious",
                "Ripley: How Netflix Made the Perfect Slow Burn Thriller",
                "Mr Robot: The Most Technically Accurate Hacker Show Ever",

                // ─── Films ───────────────────────────────────────────────────
                "Oppenheimer: Nolan's Technical Filmmaking Masterclass",
                "Dune Part Two: Denis Villeneuve's Sci-Fi Vision Complete",
                "Everything Everywhere All at Once: Multiverse Done Right",
                "The Batman 2022: A Detective Story That Redefined the Character",
                "Top Gun Maverick: Practical Filmmaking in the CGI Age",
                "Interstellar Revisited: The Science Behind the Film",
                "Inception: Christopher Nolan's Dream Architecture Explained",
                "Mad Max Fury Road: How Practical Effects Changed Action Films",
                "Blade Runner 2049: Why It Is the Best Sci-Fi Film of the Decade",
                "Parasite: Bong Joon-ho's Layered Storytelling Technique",
                "The Shawshank Redemption: Why It Tops Every Film List",
                "2001 A Space Odyssey: Kubrick's Vision Still Ahead of Its Time",
                "Alien: How Ridley Scott Built the Perfect Horror Sci-Fi Film",
                "Avatar The Way of Water: Technical Achievement vs Storytelling",
                "Past Lives: The Quiet Film Everyone Needs to Watch",

                // ─── Science & Space ─────────────────────────────────────────
                "James Webb Telescope: What It Has Revealed About the Universe",
                "Black Holes Explained: From Theory to the First Real Image",
                "SpaceX Starship: The Rocket That Could Change Everything",
                "Quantum Computing Explained: What It Means for Developers",
                "CRISPR Gene Editing: What Is Possible and What Is Ethical",
                "Dark Matter and Dark Energy: What We Know in 2026",
                "The Fermi Paradox: Where Is Everyone in the Universe",
                "Nuclear Fusion Breakthrough: Is Clean Energy Finally Here",
                "Mars Colonization: The Engineering Challenges Ahead",
                "Neuralink and Brain Computer Interfaces: Current State",
                "Exoplanets: How We Find Worlds Around Other Stars",
                "The Multiverse Theory: Science or Science Fiction",
                "Artemis Program: Humanity's Return to the Moon",
                "Gravitational Waves: How We Listen to the Universe",
                "Artificial General Intelligence: How Close Are We Really",

                // ─── Cameras & Photography ───────────────────────────────────
                "Sony A7R V vs Canon R5 Mark II: Full Frame Mirrorless Compared",
                "Fujifilm X100VI: Why Every Street Photographer Wants It",
                "DJI Osmo Pocket 3: The Best Compact Video Camera in 2026",
                "iPhone 16 Pro Camera: Computational Photography Explained",
                "Understanding Lens Aperture: A Developer's Visual Guide",
                "RAW vs JPEG: When It Matters and When It Does Not",
                "Cinematic Color Grading: LUTs and DaVinci Resolve Basics",
                "Anamorphic Lenses: Why Filmmakers Love That Look",
                "GoPro Hero 13: Action Camera Technology Deep Dive",
                "Sony FX3: The Cinema Camera Built for One-Person Crews",
                "Mirrorless vs DSLR: Why the Industry Shifted Completely",
                "Drone Cinematography: DJI Mavic 3 Pro for Filmmakers",
                "Vintage Lenses on Modern Cameras: A Practical Guide",
                "Light and Shadow in Photography: The Fundamentals",
                "Video Codecs Explained: H.264 H.265 and ProRes Compared",

                // ─── Cybersecurity ───────────────────────────────────────────
                "How SQL Injection Works and How to Prevent It",
                "JWT Authentication: Common Mistakes and How to Fix Them",
                "Zero Trust Security: The Architecture Every Team Needs",
                "Ethical Hacking Roadmap: Where to Start in 2026",
                "OWASP Top 10: The Most Critical Web Security Risks Explained",
                "Penetration Testing Tools: Nmap Burp Suite and Metasploit",
                "How HTTPS Works: TLS Handshake Explained Simply",
                "Password Hashing: Bcrypt Argon2 and Why MD5 Is Dead",
                "Supply Chain Attacks: The New Frontier of Cybersecurity",
                "Bug Bounty Hunting: How to Get Started and Get Paid",

                // ─── Mobile Development ──────────────────────────────────────
                "Flutter vs React Native: Cross Platform Development in 2026",
                "Swift vs Kotlin: Native Mobile Development Compared",
                "Android Jetpack Compose: The Future of Android UI",
                "iOS 18 Features Every Developer Should Know About",
                "Building Offline-First Mobile Apps: Strategies and Tools",
                "Mobile App Performance: What Slows Your App and How to Fix It",
                "PWA vs Native App: When Progressive Web Apps Are Enough",

                // ─── Databases ───────────────────────────────────────────────
                "PostgreSQL vs MySQL: Which Database Should You Choose",
                "Redis Explained: Caching Sessions and Real-Time Data",
                "MongoDB vs PostgreSQL: Document vs Relational Compared",
                "SQLite in Production: When the Simple Choice Is the Right One",
                "Database Indexing Explained: Why Your Queries Are Slow",
                "TimescaleDB: PostgreSQL for Time-Series Data",
                "Database Sharding: Scaling Beyond a Single Server",

                // ─── Open Source & Tools ─────────────────────────────────────
                "Neovim in 2026: Is It Worth Switching from VS Code",
                "Git Internals: How Version Control Actually Works",
                "tmux: The Terminal Multiplexer Every Developer Needs",
                "Obsidian: Building a Second Brain for Developers",
                "Raycast vs Alfred: The Best Productivity Launcher on Mac",
                "Figma for Developers: Enough Design Skills to Be Dangerous",
                "Linear vs Jira: Modern Project Management for Dev Teams",
                "Warp Terminal: The AI-Powered Terminal Worth Trying",

            ];

            // Shuffle so every run picks from a different category
            $shuffled = $topics;
            shuffle($shuffled);

            // Get all existing blog titles from the database
            $existingTitles = Blog::pluck('title')
                ->map(fn($t) => strtolower(trim($t)))
                ->toArray();

            // Pick the first topic not yet written
            $topic = collect($shuffled)->first(function ($t) use ($existingTitles) {
                return !in_array(strtolower(trim($t)), $existingTitles);
            });

            // Stop if all topics are exhausted
            if (!$topic) {
                $this->info('✓ All topics have been written. Add new topics to continue.');
                return Command::SUCCESS;
            }

            $this->info("→ Selected topic: {$topic}");
        }

        $systemPrompt = 'You are a technical blog writer for a developer portfolio site. You MUST output ONLY a valid JSON object using this exact JSON schema: {"title": "string", "excerpt": "string", "content": "string", "tags": ["string", "string"]}.

Always write blog post content in valid Markdown format inside the "content" field.

Length and depth requirements:
- Every blog post MUST be between 800 and 1200 words minimum
- Never write a post shorter than 800 words
- Cover the topic in depth — do not summarize, explain fully
- Each ## or ### section must have at least 2-3 full paragraphs
- Include real examples, use cases, and practical explanations
- Do not pad with filler — every sentence must add value

Quality & Structure Rules:
- Place comparison tables immediately after the section they summarize, never at the end of the post
- Every list of tips or bullet points MUST have a ### heading above it — never leave bullets floating without a section title
- Always wrap code examples in fenced code blocks with the language specified (e.g. ```python, ```javascript, ```bash) — never plain indented code
- Avoid generic filler advice like "read the documentation" or "evaluate on a validation set" unless you explain specifically HOW
- Include at least one real-world scenario per post with a concrete named example (a company, tool, or project)
- The conclusion must be max 2 paragraphs — do not add new sections like "Future Directions" after the conclusion

Follow formatting rules strictly:
- Use ### for ALL section headings inside the post body
- Only use ## for the main title if needed, but prefer ### for sections
- Never use # (h1) — that is reserved for the page title rendered by the UI
- Keep headings short — max 5 words
- Use **bold** for important terms and key concepts
- Use *italic* for emphasis
- Use `inline code` for file names, commands, variables, and short code
- Use fenced code blocks with the language specified for all code examples
- Use - for unordered lists and 1. 2. 3. for ordered/step lists
- Use > for callouts, tips, and important notes
- Use --- to separate major sections
- Use | tables | like | this | for comparisons and structured data
- Never write plain paragraphs only — every post must have at least:
  - 3 section headings (###)
  - 1 code block
  - 1 list (ordered or unordered)
  - 1 blockquote tip or callout
- Do not wrap the entire response in a code block
- Do not add any HTML tags
- Write for a technical developer audience

Ensure all JSON strings are properly escaped (use \n for newlines, \" for quotes inside the content). Do not forget to properly close the "content" string and include the "tags" array.';

        $userPrompt = "Write a comprehensive technical blog post about: {$topic}";

        try {
            $response = Http::withoutVerifying()->withHeaders([
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

            // Get all images already used in existing blog posts
            $usedImages = Blog::pluck('cover_image')
                ->filter()
                ->map(fn($url) => strtolower(trim($url)))
                ->toArray();

            // Function to fetch a unique image from Unsplash
            $getUniqueImage = function (string $topic) use ($usedImages): string {
                $accessKey = env('UNSPLASH_ACCESS_KEY', '');
                
                if (empty($accessKey)) {
                    // Fallback: use topic-seeded Picsum so same topic = same image
                    // but different topics = different images
                    $seed = abs(crc32($topic));
                    return "https://picsum.photos/seed/{$seed}/1200/630";
                }

                // Clean topic into a search keyword
                $keyword = urlencode(
                    preg_replace('/[^a-zA-Z0-9 ]/', '', 
                        explode(':', $topic)[0]
                    )
                );

                // Try up to 5 pages of Unsplash results to find an unused image
                for ($page = 1; $page <= 5; $page++) {
                    try {
                        $response = Http::withoutVerifying()->get(
                            "https://api.unsplash.com/search/photos", [
                                'query'       => $keyword,
                                'per_page'    => 20,
                                'page'        => $page,
                                'orientation' => 'landscape',
                                'client_id'   => $accessKey,
                            ]
                        );

                        if (!$response->successful()) break;

                        $photos = $response->json('results', []);

                        foreach ($photos as $photo) {
                            $imageUrl = $photo['urls']['regular'] ?? '';
                            if (
                                $imageUrl &&
                                !in_array(strtolower(trim($imageUrl)), $usedImages)
                            ) {
                                $this->info("→ Found unique image: {$imageUrl}");
                                return $imageUrl;
                            }
                        }
                    } catch (\Throwable $e) {
                        break;
                    }
                }

                // Final fallback if all Unsplash results are used
                // Use topic hash so it is at least deterministic and unique per topic
                $seed = abs(crc32($topic));
                return "https://picsum.photos/seed/{$seed}/1200/630";
            };

            // Call it with the selected topic
            $coverImage = $getUniqueImage($topic);

            $blog = Blog::create([
                'title'        => $title,
                'slug'         => $slug,
                'excerpt'      => $excerpt,
                'content'      => $content,
                'cover_image'  => $coverImage,
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
