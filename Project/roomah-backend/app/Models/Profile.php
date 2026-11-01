<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Profile extends Model
{
    /** @use HasFactory<\Database\Factories\ProfileFactory> */
    use HasFactory;
    public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
protected $fillable = [
    'user_id',
    'gender',
    'dob',
    'job',
    'education',
    'city',
    'short_bio',
    'vision',
    'status',
    'candidate_code',
];
}
