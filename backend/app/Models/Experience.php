<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'company',
        'role',
        'description',
        'location',
        'start_date',
        'end_date',
        'current',
        'tech_stack',
        'order',
        'certificate_url',
        'timeline_order',
        'milestone_year',
        'featured',
        'visual_layout',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'current' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'featured' => 'boolean',
    ];
}
