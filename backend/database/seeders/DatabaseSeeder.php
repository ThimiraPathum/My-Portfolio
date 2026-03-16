<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Skill;
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

        // Create sample skills (Fix: Removed 'proficiency', using 'level' instead)
        Skill::firstOrCreate(['name' => 'PHP'], ['level' => 90, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'Laravel'], ['level' => 85, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'React'], ['level' => 80, 'category' => 'Frontend']);
        Skill::firstOrCreate(['name' => 'MySQL'], ['level' => 85, 'category' => 'Database']);

        // Create sample project (Fix: technologies -> tech_stack, link -> live_url)
        Project::firstOrCreate(
            ['title' => 'Portfolio Website'],
            [
                'description' => 'Full-stack portfolio built with Laravel & React',
                'tech_stack' => ['Laravel', 'React', 'SQLite', 'Tailwind CSS'],
                'live_url' => 'https://thimiradev.me',
            ]
        );

        // Seed Default Settings
        \App\Models\SiteSetting::setMany([
            'site_title' => 'Thimira Pathum | Full Stack Developer',
            'hero_title' => 'Building Digital Experiences',
            'hero_subtitle' => 'Full Stack Developer & AI Enthusiast',
            'about_me' => 'I am a passionate developer...',
            'contact_email' => 'pathumt675@gmail.com',
        ]);
    }
}
