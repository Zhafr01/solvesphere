<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\Request;

class PartnerSiteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/partners/{slug}",
     *     summary="Get partner site data",
     *     tags={"Partner Site"},
     *     @OA\Parameter(
     *         name="slug",
     *         in="path",
     *         required=true,
     *         description="Partner slug",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="partner", type="object"),
     *             @OA\Property(property="news", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="topics", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Partner not found or inactive"
     *     )
     * )
     */
    public function index(Request $request, string $slug)
    {
        $partner = Partner::where('slug', $slug)->firstOrFail();

        // Ensure the partner is active
        if (!in_array($partner->status, ['active', 'approved'])) {
            if ($request->wantsJson() && !$request->inertia()) {
                return response()->json(['message' => 'Partner not found or inactive'], 404);
            }
            abort(404);
        }

        $news = $partner->news()->latest()->take(3)->get();
        $topics = $partner->forumTopics()->latest()->take(5)->get();
        $reports = $partner->reports()->latest()->take(5)->get();

        $stats = [
            'total_users' => $partner->users()->count(),
            'total_news' => $partner->news()->count(),
            'total_topics' => $partner->forumTopics()->count(),
            'total_reports' => $partner->reports()->count(),
        ];

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'partner' => $partner,
                'news' => $news,
                'topics' => $topics,
                'reports' => $reports,
                'stats' => $stats,
            ]);
        }

        return \Inertia\Inertia::render('Partners/Show', [
            'partner' => $partner,
            'news' => $news,
            'topics' => $topics,
            'reports' => $reports,
            'stats' => $stats,
        ]);
    }
}
