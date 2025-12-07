<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/news",
     *     summary="Get list of news",
     *     tags={"News"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="partner_id",
     *         in="query",
     *         description="Filter by partner ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = News::query();

        if ($request->has('partner_slug')) {
            $partner = \App\Models\Partner::where('slug', $request->partner_slug)->first();
            if ($partner) {
                // Branch Web: Filter by this partner's ID
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                      ->where('partner_id', $partner->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            // Main Web: Filter by partner_id = null (Global News)
            $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                  ->whereNull('partner_id');
        }

        $news = $query->with('admin')->latest()->paginate(10);

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json($news);
        }

        return \Inertia\Inertia::render('News/Index', [
            'news' => $news
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        // General users cannot create news
        if (!$user->isPartnerAdmin() && !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image',// Removed max size limit
            'partner_id' => 'nullable|exists:partners,id',
        ]);
        
        // If a partner admin is creating news, it must be for their own partner
        if ($user->isPartnerAdmin() && $request->partner_id != $user->partner_id) {
             return response()->json(['message' => 'You can only create news for your own organization.'], 403);
        }

        $news = new News();
        $news->title = $request->title;
        $news->content = $request->content;
        $news->admin_id = $user->id;
        
        // Super Admin can ONLY create Global News
        if ($user->isSuperAdmin()) {
            if ($request->filled('partner_id')) {
                return response()->json(['message' => 'Super Admins cannot create news for specific partners.'], 403);
            }
            $news->partner_id = null;
        } 
        // Partner Admin can ONLY create news for their partner
        else {
            $news->partner_id = $user->partner_id;
        }


        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news', 'public');
            $news->image = $path;
        }

        $news->save();

        return response()->json([
            'message' => 'News created successfully',
            'news' => $news
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/news/{id}",
     *     summary="Get a specific news item",
     *     tags={"News"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="News not found"
     *     )
     * )
     */
    public function show($id)
    {
        // Bypass PartnerScope
        $news = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($id);
        // The PartnerScope already ensures the user can only access news from their tenancy.
        // No explicit authorization check is needed here for viewing.
        $news->load('admin');
        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json($news);
        }
        return \Inertia\Inertia::render('News/Show', [
            'news' => $news
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/news/{id}",
     *     summary="Update a news item",
     *     tags={"News"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="content", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="News updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="news", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $news = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('manage-news', $news);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image',// Removed max size limit
        ]);

        $news->title = $request->title;
        $news->content = $request->content;

        if ($request->hasFile('image')) {
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $path = $request->file('image')->store('news', 'public');
            $news->image = $path;
        }

        $news->save();

        return response()->json([
            'message' => 'News updated successfully',
            'news' => $news
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/news/{id}",
     *     summary="Delete a news item",
     *     tags={"News"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="News deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function destroy($id)
    {
        $news = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('manage-news', $news);

        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();

        return response()->json(['message' => 'News deleted successfully']);
    }

    public function like($id)
    {
        $news = News::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($id);
        $user = Auth::user();

        $like = $news->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $news->likes()->detach($user->id);
            $liked = false;
            $message = 'News unliked successfully';
        } else {
            $news->likes()->attach($user->id);
            $liked = true;
            $message = 'News liked successfully';

            // Notify news author if not self
            if ($news->admin_id !== $user->id) {
                $news->admin->notify(new \App\Notifications\NewLikeNotification($user, 'news', $news));
            }
        }

        return response()->json([
            'message' => $message,
            'liked' => $liked,
            'likes_count' => $news->likes()->count(),
        ]);
    }
}
