<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'api');
    }

    public function test_settings_updates_are_returned_by_the_public_settings_endpoint(): void
    {
        $settings = ['home_name' => 'Updated name', 'home_description' => 'New introduction', 'about_bio' => 'New biography', 'social_email' => 'contact@example.test'];
        $this->postJson('/api/settings', ['settings' => $settings])->assertOk();
        $this->getJson('/api/settings')->assertOk()->assertJson($settings);
    }

    public function test_project_with_blank_description_saves_and_populates_skills(): void
    {
        $project = $this->postJson('/api/projects', ['title' => 'Sample', 'description' => '', 'tech_stack' => ['React', 'Docker']])->assertCreated();
        $id = $project->json('id');
        $this->putJson('/api/projects/'.$id, ['description' => null])->assertOk()->assertJsonPath('description', '');
        $this->getJson('/api/skills/derived')->assertOk()->assertJsonFragment(['name' => 'React']);
    }

    public function test_qualification_validates_start_date_and_allows_blank_description(): void
    {
        $this->postJson('/api/experiences', ['company' => 'University', 'role' => 'Degree'])->assertUnprocessable()->assertJsonValidationErrors('start_date');
        $this->postJson('/api/experiences', ['company' => 'University', 'role' => 'Degree', 'start_date' => '2025-01-01', 'description' => ''])->assertCreated()->assertJsonPath('description', '');
    }

    public function test_blog_publish_sets_date_and_title_edits_preserve_public_url(): void
    {
        $created = $this->postJson('/api/blogs', ['title' => 'First title', 'content' => 'Article', 'status' => 'draft'])->assertCreated();
        $updated = $this->putJson('/api/blogs/'.$created->json('id'), ['title' => 'Updated title', 'status' => 'published'])->assertOk()->assertJsonPath('slug', $created->json('slug'));
        $this->assertNotNull($updated->json('published_at'));
        $this->getJson('/api/blogs/'.$created->json('slug'))->assertOk()->assertJsonPath('content', 'Article');
        $this->putJson('/api/blogs/'.$created->json('id'), ['content' => ''])->assertUnprocessable();
    }
}
