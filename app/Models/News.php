<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\PartnerScope;

class News extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::addGlobalScope(new PartnerScope);
    }

    protected $fillable = [
        'admin_id',
        'partner_id',
        'report_id',
        'title',
        'content',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected $appends = ['is_liked_by_auth_user', 'likes_count'];

    public function user()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'news_likes');
    }

    public function getIsLikedByAuthUserAttribute()
    {
        if (!\Illuminate\Support\Facades\Auth::check()) {
            return false;
        }
        return $this->likes()->where('user_id', \Illuminate\Support\Facades\Auth::id())->exists();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }
}
