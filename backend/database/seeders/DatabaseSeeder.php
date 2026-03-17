<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create or update admin user
        User::updateOrCreate(
            ['email' => 'pathumt675@gmail.com'],
            [
                'name' => 'Thimira Pathum',
                'password' => 'thimirAP12335.',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@thimiradev.me'],
            [
                'name' => 'Admin Backup',
                'password' => 'Admin@123',
            ]
        );

        $skills = [
            ['name' => 'PHP', 'category' => 'Backend', 'level' => 92, 'icon' => 'php', 'order' => 1],
            ['name' => 'Laravel', 'category' => 'Backend', 'level' => 90, 'icon' => 'laravel', 'order' => 2],
            ['name' => 'React', 'category' => 'Frontend', 'level' => 88, 'icon' => 'react', 'order' => 3],
            ['name' => 'TypeScript', 'category' => 'Frontend', 'level' => 84, 'icon' => 'typescript', 'order' => 4],
            ['name' => 'Tailwind CSS', 'category' => 'Frontend', 'level' => 86, 'icon' => 'tailwind', 'order' => 5],
            ['name' => 'MySQL', 'category' => 'Database', 'level' => 85, 'icon' => 'database', 'order' => 6],
            ['name' => 'Docker', 'category' => 'DevOps', 'level' => 76, 'icon' => 'docker', 'order' => 7],
            ['name' => 'REST APIs', 'category' => 'Architecture', 'level' => 89, 'icon' => 'api', 'order' => 8],
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(['name' => $skill['name']], $skill);
        }

        $projects = [
            [
                'title' => 'Portfolio Website',
                'description' => 'Full-stack portfolio built with Laravel, React, and an admin CMS for managing public content.',
                'tech_stack' => ['Laravel', 'React', 'SQLite', 'Tailwind CSS'],
                'github_url' => 'https://github.com/thimira/portfolio',
                'live_url' => 'https://thimiradev.me',
                'category' => 'Web Platform',
                'featured' => true,
                'coming_soon' => false,
                'order' => 1,
                'gallery' => [],
            ],
            [
                'title' => 'AI Study Planner',
                'description' => 'A planning dashboard that turns course goals into weekly learning sprints with reminders and analytics.',
                'tech_stack' => ['React', 'TypeScript', 'Node.js', 'OpenAI API'],
                'github_url' => 'https://github.com/thimira/ai-study-planner',
                'live_url' => 'https://study-planner-demo.example.com',
                'category' => 'AI Product',
                'featured' => true,
                'coming_soon' => false,
                'order' => 2,
                'gallery' => [],
            ],
            [
                'title' => 'Creator Analytics Suite',
                'description' => 'Dashboard for tracking content performance, campaign timing, and conversion notes across social channels.',
                'tech_stack' => ['Laravel', 'Vue', 'MySQL', 'Chart.js'],
                'github_url' => 'https://github.com/thimira/creator-analytics',
                'live_url' => null,
                'category' => 'Dashboard',
                'featured' => false,
                'coming_soon' => true,
                'order' => 3,
                'gallery' => [],
            ],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(['title' => $project['title']], $project);
        }

        $blogs = [
            [
                'title' => 'Designing a Portfolio CMS That You Will Actually Use',
                'slug' => 'designing-a-portfolio-cms',
                'excerpt' => 'What makes a small personal CMS useful instead of becoming abandoned admin clutter.',
                'content' => "## Why this matters\nA portfolio CMS should reduce friction, not add ceremony.\n\n## Practical rules\n- Keep edits close to the final output.\n- Prefer a few strong controls over endless settings.\n- Make publishing, drafts, and uploads reliable.\n\n## Result\nA smaller, sharper admin panel is easier to trust and maintain.",
                'status' => 'published',
                'coming_soon' => false,
            ],
            [
                'title' => 'Shipping Better Upload Flows in Laravel and React',
                'slug' => 'better-upload-flows-laravel-react',
                'excerpt' => 'Common failure points in file uploads and how to fix them without hiding the real errors.',
                'content' => "## Failure modes\nUploads usually fail before your app logic sees the file.\n\n## What to harden\n- PHP upload limits\n- temp file handling\n- user-facing validation messages\n- public storage links\n\n## Outcome\nWhen uploads fail, the admin should see the exact reason immediately.",
                'status' => 'draft',
                'coming_soon' => false,
            ],
            [
                'title' => 'Case Study: Building Internal Tools for Faster Content Ops',
                'slug' => 'internal-tools-content-ops',
                'excerpt' => 'A draft case study about reducing manual work in publishing and content maintenance.',
                'content' => "## Context\nInternal tools create leverage when they remove repeated admin work.\n\n## Focus\nThis post will cover workflow design, editor ergonomics, and practical metrics.",
                'status' => 'draft',
                'coming_soon' => true,
            ],
        ];

        foreach ($blogs as $blogData) {
            Blog::updateOrCreate(['slug' => $blogData['slug']], $blogData);
        }

        $blogMap = Blog::query()->whereIn('slug', collect($blogs)->pluck('slug'))->get()->keyBy('slug');
        $comments = [
            [
                'blog_slug' => 'designing-a-portfolio-cms',
                'name' => 'Kasun Perera',
                'email' => 'kasun@example.com',
                'body' => 'This is the first portfolio admin setup I have seen that focuses on actual maintenance work instead of flashy widgets.',
                'approved' => true,
            ],
            [
                'blog_slug' => 'designing-a-portfolio-cms',
                'name' => 'Nadeesha Silva',
                'email' => 'nadeesha@example.com',
                'body' => 'Would love a follow-up post on how you structure project case studies inside the CMS.',
                'approved' => false,
            ],
            [
                'blog_slug' => 'better-upload-flows-laravel-react',
                'name' => 'Ravindu Jay',
                'email' => 'ravindu@example.com',
                'body' => 'The point about PHP dropping files before Laravel sees them saved me hours on Render.',
                'approved' => true,
            ],
        ];

        foreach ($comments as $comment) {
            $blog = $blogMap->get($comment['blog_slug']);
            if (!$blog) {
                continue;
            }

            Comment::updateOrCreate(
                [
                    'blog_id' => $blog->id,
                    'email' => $comment['email'],
                ],
                [
                    'name' => $comment['name'],
                    'body' => $comment['body'],
                    'approved' => $comment['approved'],
                ]
            );
        }

        $experiences = [
            [
                'company' => 'Open Learning Lab',
                'role' => 'Full Stack Development Track',
                'description' => 'Built portfolio-grade applications, API integrations, and production-style admin tooling with a focus on reliable delivery.',
                'location' => 'Remote',
                'start_date' => '2024-01-10',
                'end_date' => '2024-11-20',
                'current' => false,
                'tech_stack' => ['Laravel', 'React', 'MySQL', 'Docker'],
                'order' => 1,
                'certificate_url' => null,
            ],
            [
                'company' => 'AWS Academy',
                'role' => 'Cloud Foundations Certificate',
                'description' => 'Studied cloud architecture basics, deployment planning, identity management, and cost-aware infrastructure decisions.',
                'location' => 'Online',
                'start_date' => '2025-02-01',
                'end_date' => '2025-04-15',
                'current' => false,
                'tech_stack' => ['AWS', 'IAM', 'Networking'],
                'order' => 2,
                'certificate_url' => null,
            ],
            [
                'company' => 'Independent Research',
                'role' => 'AI Product Prototyping',
                'description' => 'Ongoing exploration of AI-assisted workflows, prompt design, evaluation loops, and practical product integrations.',
                'location' => 'Sri Lanka',
                'start_date' => '2025-07-01',
                'end_date' => null,
                'current' => true,
                'tech_stack' => ['OpenAI API', 'TypeScript', 'Prompt Engineering'],
                'order' => 3,
                'certificate_url' => null,
            ],
        ];

        foreach ($experiences as $experience) {
            Experience::updateOrCreate(
                [
                    'company' => $experience['company'],
                    'role' => $experience['role'],
                ],
                $experience
            );
        }

        SiteSetting::setMany([
            'site_title' => 'Thimira Pathum | Full Stack Developer',
            'hero_title' => 'Building Digital Experiences',
            'hero_subtitle' => 'Full Stack Developer & AI Enthusiast',
            'about_me' => 'I am a passionate developer...',
            'contact_email' => 'pathumt675@gmail.com',
        ]);
    }
}
