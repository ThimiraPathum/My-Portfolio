<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['blog_id', 'name', 'email', 'body', 'approved'];
    protected $hidden = ['email'];

    protected $casts = ['approved' => 'boolean'];

    public function blog()
    {
        return $this->belongsTo(Blog::class);
    }
}
