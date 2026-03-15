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
        // Create a user if doesn't exist
        User::firstOrCreate(
            ['email' => 'pathumt675@gmail.com'],
            [
                'name' => 'Thimira Pathum',
                'password' => bcrypt('thimirAP12335.'),
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
    }
}
