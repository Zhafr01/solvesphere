<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Report;
use App\Models\ForumTopic;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/dashboard",
     *     summary="Get dashboard data",
     *     tags={"Dashboard"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="news", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="forumTopics", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="reports", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $newsQuery = News::latest()->take(5);
        $forumTopicsQuery = ForumTopic::latest()->take(5);
        $reportsQuery = Report::latest()->take(5);

        $stats = [
            'total_users' => \App\Models\User::count(),
            'total_reports' => Report::withoutGlobalScope(\App\Scopes\PartnerScope::class)->whereNull('partner_id')->count(),
            'total_topics' => ForumTopic::withoutGlobalScope(\App\Scopes\PartnerScope::class)->whereNull('partner_id')->count(),
            'total_news' => News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->whereNull('partner_id')->count(),
        ];

        if ($request->has('partner_slug')) {
            $partner = \App\Models\Partner::where('slug', $request->partner_slug)->first();
            if ($partner) {
                $newsQuery = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->where('partner_id', $partner->id)->latest()->take(5);
                $forumTopicsQuery = ForumTopic::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->where('partner_id', $partner->id)->latest()->take(5);
                
                // For stats, we need to bypass scope and filter by partner
                $stats['total_users'] = \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->where('role', '!=', 'partner_admin')
                    ->where(function ($q) use ($partner) {
                        $q->where('partner_id', $partner->id)
                          ->orWhere(function ($sub) use ($partner) {
                              $sub->whereNull('partner_id')
                                  ->where(function ($interaction) use ($partner) {
                                      $interaction->whereHas('forumTopics', fn($t) => $t->where('partner_id', $partner->id))
                                            ->orWhereHas('reports', fn($r) => $r->where('partner_id', $partner->id))
                                            ->orWhereHas('forumComments.topic', fn($ct) => $ct->where('partner_id', $partner->id));
                                  });
                          });
                    })
                    ->count();
                $stats['total_reports'] = Report::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('partner_id', $partner->id)->count();
                $stats['total_topics'] = ForumTopic::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('partner_id', $partner->id)->count();
                $stats['total_news'] = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('partner_id', $partner->id)->count();

                if (auth('sanctum')->check()) {
                   $userRating = \App\Models\PartnerRating::where('user_id', auth('sanctum')->id())
                       ->where('partner_id', $partner->id)
                       ->first();
                }
            }
        } else {
            // Main Dashboard
            if ($user->isSuperAdmin()) {
                // Super Admin sees ALL data
                $newsQuery = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->latest()->take(5);
                $forumTopicsQuery = ForumTopic::withoutGlobalScope(\App\Scopes\PartnerScope::class)->latest()->take(5);
                $reportsQuery = Report::withoutGlobalScope(\App\Scopes\PartnerScope::class)->latest()->take(5);
            } else {
                // Others see only Global Data (partner_id = null)
                $newsQuery = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->whereNull('partner_id')->latest()->take(5);
                $forumTopicsQuery = ForumTopic::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->whereNull('partner_id')->latest()->take(5);
                $reportsQuery = Report::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->whereNull('partner_id')->latest()->take(5);
            }
        }

        // The PartnerScope will automatically filter these queries based on the authenticated user
        $news = $newsQuery->get();
        $forumTopics = $forumTopicsQuery->get();
        $reports = $reportsQuery->get();

        $total_partners = 0;
        $pending_partners = 0;
        $total_users = 0;

        // Super Admins are not affected by the scope, so their queries fetch global data.
        if ($user->isSuperAdmin()) {
            // Use `withoutGlobalScope` to get true totals for super admin view, if the user model itself is scoped
            $total_partners = \App\Models\Partner::count();
            $pending_partners = \App\Models\Partner::where('status', 'pending')->count();
             // We need to bypass the scope to get ALL users for the super admin
            $total_users = \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                ->where(function ($q) {
                    $q->whereNull('partner_id')
                      ->orWhere(function ($sub) {
                          $sub->whereNotNull('partner_id')
                              ->where(function ($interaction) {
                                  $interaction->whereHas('forumTopics', fn($t) => $t->whereNull('partner_id'))
                                        ->orWhereHas('reports', fn($r) => $r->whereNull('partner_id'))
                                        ->orWhereHas('forumComments.topic', fn($ct) => $ct->whereNull('partner_id'));
                              });
                      });
                })
                ->count();
            
            // Overwrite the scoped stats with global stats for super admin
            $stats['total_users'] = $total_users;
            $stats['total_partners'] = $total_partners;
            $stats['pending_partners'] = $pending_partners;

        }

        return response()->json([
            'news' => $news,
            'forumTopics' => $forumTopics,
            'reports' => $reports,
            'stats' => $stats,
            'total_partners' => $total_partners,
            'pending_partners' => $pending_partners,
            'total_users' => $total_users,
            'user_rating' => $userRating ?? null,
        ]);
    }
}