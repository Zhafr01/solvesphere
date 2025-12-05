<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\PartnerRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerRatingController extends Controller
{
    public function store(Request $request, string $slug)
    {
        $partner = Partner::where('slug', $slug)->firstOrFail();

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $existingRating = PartnerRating::where('user_id', Auth::id())
            ->where('partner_id', $partner->id)
            ->first();

        if ($existingRating) {
            $existingRating->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
        } else {
            PartnerRating::create([
                'user_id' => Auth::id(),
                'partner_id' => $partner->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
        }

        return response()->json(['message' => 'Rating submitted successfully']);
    }
}
