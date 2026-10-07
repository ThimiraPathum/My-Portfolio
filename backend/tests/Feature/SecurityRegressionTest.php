<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['jwt.secret' => str_repeat('test-only-secret', 4), 'jwt.ttl' => 60, 'jwt.refresh_ttl' => 120]);
    }

    public function test_public_registration_cannot_create_an_admin(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Visitor', 'email' => 'visitor@example.test',
            'password' => 'long-password', 'password_confirmation' => 'long-password',
        ])->assertForbidden();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_non_admin_cannot_access_admin_resources(): void
    {
        $user = User::factory()->create(['role' => 'viewer']);
        $this->actingAs($user, 'api')->getJson('/api/messages')->assertForbidden();
        $this->postJson('/api/projects', ['title' => 'Unauthorized'])->assertForbidden();
    }

    public function test_public_blog_endpoints_do_not_expose_drafts(): void
    {
        $draft = Blog::create(['title' => 'Draft', 'slug' => 'draft', 'status' => 'draft', 'content' => 'Private content']);
        $teaser = Blog::create(['title' => 'Soon', 'slug' => 'soon', 'status' => 'draft', 'coming_soon' => true, 'content' => 'Private teaser content']);
        $this->getJson('/api/blogs/'.$draft->slug)->assertNotFound();
        $this->getJson('/api/blogs/'.$teaser->slug)->assertNotFound();
        $this->getJson('/api/blogs')->assertOk()->assertJsonCount(1)->assertJsonMissingPath('0.content');
        $this->postJson('/api/blogs/'.$draft->id.'/comments', [
            'name' => 'Reader', 'email' => 'reader@example.test', 'body' => 'Hello',
        ])->assertNotFound();
    }

    public function test_public_comments_hide_pending_comments_and_email_addresses(): void
    {
        $blog = Blog::create(['title' => 'Published', 'slug' => 'published', 'status' => 'published', 'content' => 'Public article']);
        foreach ([true, false] as $approved) {
            Comment::create(['blog_id' => $blog->id, 'name' => 'Reader', 'email' => 'private@example.test', 'body' => $approved ? 'Visible' : 'Pending', 'approved' => $approved]);
        }
        $this->getJson('/api/blogs/'.$blog->id.'/comments')->assertOk()->assertJsonCount(1)->assertJsonMissingPath('0.email')->assertJsonMissing(['body' => 'Pending']);
        $this->getJson('/api/blogs/published')->assertOk()->assertJsonCount(1, 'comments')->assertJsonMissingPath('comments.0.email');
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'api')->getJson('/api/admin/comments')->assertOk()->assertJsonCount(2)->assertJsonPath('0.email', 'private@example.test');
    }

    public function test_expired_token_can_refresh_but_invalid_token_cannot(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($user);
        $this->travel(61)->minutes();
        auth()->forgetGuards();
        $response = $this->withToken($token)->postJson('/api/auth/refresh')->assertOk()->assertJsonPath('user.id', $user->id);
        auth()->forgetGuards();
        $this->withToken($response->json('access_token'))->getJson('/api/messages')->assertOk();
        auth()->forgetGuards();
        $this->withToken('invalid-token')->postJson('/api/auth/refresh')->assertUnauthorized();
        $this->travelBack();
    }

    public function test_seeding_preserves_existing_admin_password(): void
    {
        $oldEmail = getenv('ADMIN_EMAIL');
        $oldPassword = getenv('ADMIN_PASSWORD');
        putenv('ADMIN_EMAIL=seed@example.test');
        putenv('ADMIN_PASSWORD=initial-password');
        try {
            $user = User::factory()->create(['email' => 'seed@example.test', 'password' => Hash::make('changed-password')]);
            $this->seed(DatabaseSeeder::class);
            $this->assertTrue(Hash::check('changed-password', $user->fresh()->password));
        } finally {
            putenv($oldEmail === false ? 'ADMIN_EMAIL' : 'ADMIN_EMAIL='.$oldEmail);
            putenv($oldPassword === false ? 'ADMIN_PASSWORD' : 'ADMIN_PASSWORD='.$oldPassword);
        }
    }

    public function test_refresh_rejects_missing_and_out_of_window_tokens(): void
    {
        $this->postJson('/api/auth/refresh')->assertUnauthorized();
        $token = auth('api')->login(User::factory()->create(['role' => 'admin']));
        $this->travel(121)->minutes();
        auth()->forgetGuards();
        $this->withToken($token)->postJson('/api/auth/refresh')->assertUnauthorized();
        $this->travelBack();
    }
}
