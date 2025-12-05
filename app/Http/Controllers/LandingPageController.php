<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\ForumTopic;
use App\Models\Partner;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/landing-page",
     *     summary="Get landing page data",
     *     tags={"Public"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="partner", type="object", nullable=true),
     *             @OA\Property(property="partners", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="news", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="topics", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $host = $request->getHost();
        $partner = Partner::where('domain', $host)->first();

        $partners = [];
        $news = [];
        $topics = [];

        if (!$partner) {
            // This is the main site, load global content and active partners
            $partners = Partner::whereIn('status', ['approved', 'active'])->get();
            $news = News::whereNull('partner_id')->latest()->take(3)->get();
            $topics = ForumTopic::whereNull('partner_id')->latest()->take(5)->get();
        } else {
            // This is a partner-specific domain, load their content
            $news = $partner->news()->latest()->take(3)->get();
            $topics = $partner->forumTopics()->latest()->take(5)->get();
        }


        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'partner' => $partner,
                'partners' => $partners,
                'news' => $news,
                'topics' => $topics,
            ]);
        }
        
        return \Inertia\Inertia::render('Home', [
            'partner' => $partner,
            'partners' => $partners,
            'news' => $news,
            'topics' => $topics,
        ]);
    }
}
