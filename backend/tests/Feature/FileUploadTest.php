<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;

class FileUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_video_files_cannot_be_uploaded_as_video(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'api')
            ->postJson('/api/upload', [
                'file' => UploadedFile::fake()->create('page.html', 1, 'text/html'),
                'type' => 'video',
            ])->assertUnprocessable()->assertJsonValidationErrors('file');
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_can_upload_image()
    {
        Storage::fake('public');

        // Create an admin user and authenticate
        $user = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($user);

        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/upload', [
            'file' => $file,
            'type' => 'image',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['url', 'path']);

        Storage::disk('public')->assertExists('uploads/images/' . $file->hashName());
    }
}
