<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('cover_image')->nullable();
            $table->string('status')->default('published');
            $table->timestamp('published_at')->nullable();
            $table->boolean('coming_soon')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('blogs'); }
};
