<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\PartnerScope;

class ForumTopic extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::addGlobalScope(new PartnerScope);
    }

    protected $fillable = [
        'user_id',
        'partner_id',
        'title',
        'content',
        'category',
        'status',
        'best_answer_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function comments()
    {
        return $this->hasMany(ForumComment::class, 'topic_id');
    }

    public function bestAnswer()
    {
        return $this->belongsTo(ForumComment::class, 'best_answer_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'forum_topic_likes')->withTimestamps();
    }
}
