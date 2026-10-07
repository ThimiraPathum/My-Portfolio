<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DerivedSkillsTest extends TestCase
{
    use RefreshDatabase;

    public function test_aliases_merge_and_count_unique_projects_without_changing_project_data(): void
    {
        $stack = ['React', 'React 19', 'react.js', 'TailwindCSS', 'MySQL/SQLite', 'CI/CD', 'AI/ML', 'C++', 'S3', ''];
        $project = Project::create(['title' => 'Govimart', 'description' => '', 'tech_stack' => $stack]);
        Project::create(['title' => 'MarketMentor', 'description' => '', 'tech_stack' => ['react v19.2', 'Tailwind CSS v4', 'SQLite', 'REST APIs', 'Sanctum']]);

        $skills = collect($this->getJson('/api/skills/derived')->assertOk()->json())->keyBy('name');
        $this->assertCount(2, $skills['React']['used_in']);
        $this->assertCount(2, $skills['Tailwind CSS']['used_in']);
        $this->assertCount(2, $skills['SQLite']['used_in']);
        $this->assertCount(1, $skills['MySQL']['used_in']);
        foreach (['CI/CD', 'AI/ML', 'C++', 'S3', 'REST APIs', 'Laravel Sanctum'] as $name) {
            $this->assertTrue($skills->has($name));
        }
        $this->assertFalse($skills->has('React 19'));
        $this->assertFalse($skills->has('MySQL/SQLite'));
        $this->assertSame($stack, $project->fresh()->tech_stack);
    }
}
