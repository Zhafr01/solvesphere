<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\PartnerScope;

class Report extends Model
{
    use HasFactory;

    protected static function booted()
    {
        static::addGlobalScope(new PartnerScope);
    }

    protected $fillable = [
        'user_id',
        'partner_id',
        'category',
        'urgency',
        'title',
        'content',
        'attachment',
        'status',
        'admin_note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
