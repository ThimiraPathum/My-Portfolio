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
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'current' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
}
