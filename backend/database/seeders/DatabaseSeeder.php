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

        // Create sample skills
        Skill::firstOrCreate(['name' => 'PHP'], ['proficiency' => 90, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'Laravel'], ['proficiency' => 85, 'category' => 'Backend']);
        Skill::firstOrCreate(['name' => 'React'], ['proficiency' => 80, 'category' => 'Frontend']);
        Skill::firstOrCreate(['name' => 'MySQL'], ['proficiency' => 85, 'category' => 'Database']);

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
