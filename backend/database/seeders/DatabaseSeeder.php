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
            ['email' => 'admin@thimiradev.me'],
            [
                'name' => 'Thimira Pathum',
                'password' => bcrypt('password123'),
            ]
        );

        // Create sample skills (Fix: Removed 'proficiency', using 'level' instead)
        Skill::firstOrCreate(['name' => 'PHP'], ['level' => 90, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'Laravel'], ['level' => 85, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'React'], ['level' => 80, 'category' => 'Frontend']);
        Skill::firstOrCreate(['name' => 'MySQL'], ['level' => 85, 'category' => 'Database']);

        // Create sample project
        Project::firstOrCreate(
            ['title' => 'Portfolio Website'],
            [
                'description' => 'Full-stack portfolio built with Laravel & React',
                'technologies' => 'Laravel, React, MySQL, Tailwind CSS',
                'link' => 'https://thimiradev.me',
            ]
        );
    }
}
