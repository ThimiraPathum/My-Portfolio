<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title', 'description', 'image_url', 'gallery', 'video_url', 'tech_stack',
        'github_url', 'live_url', 'category', 'featured', 'coming_soon', 'order',
    ];

    protected $casts = [
        'tech_stack'   => 'array',
        'gallery'      => 'array',
        'featured'     => 'boolean',
        'coming_soon'  => 'boolean',
    ];
}
