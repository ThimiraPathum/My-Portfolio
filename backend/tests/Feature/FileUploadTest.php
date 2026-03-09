<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;

class FileUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_upload_image()
    {
        Storage::fake('public');

        // Create an admin user and authenticate
        $user = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($user);

        $file = UploadedFile::fake()->image('avatar.jpg');

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
