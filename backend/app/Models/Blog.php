<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blog extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'cover_image', 'status', 'coming_soon',
    ];

    protected $casts = [
        'coming_soon' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($blog) {
            if (!$blog->slug) {
                $blog->slug = Str::slug($blog->title) . '-' . Str::random(5);
            }
        });
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
