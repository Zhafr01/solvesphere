<?php

namespace App\Http\Controllers;

use App\Models\ForumTopic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ForumTopicController extends Controller
{
    public function index(Request $request)
    {
        // The PartnerScope handles tenancy automatically, but we want to enforce strict separation
        // based on the context (Main Web vs Branch Web).
        $query = ForumTopic::query();

        if ($request->has('partner_slug')) {
            $partner = \App\Models\Partner::where('slug', $request->partner_slug)->first();
            if ($partner) {
                // Branch Web: Filter by this partner's ID
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                      ->where('partner_id', $partner->id);
            } else {
                // Partner not found
                $query->whereRaw('1 = 0');
            }
        } else {
            // Main Web: Filter by partner_id = null (Global Topics)
            // Unless user is Super Admin
            if (!Auth::user()->isSuperAdmin()) {
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                      ->whereNull('partner_id');
            } else {
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class);
            }
        }

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('content', 'like', "%{$searchTerm}%");
            });
        }
        
        $topics = $query->with('user')->withCount('comments')->latest()->paginate(10);

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json($topics);
        }

        return \Inertia\Inertia::render('Forum/Index', [
            'topics' => $topics
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'partner_id' => 'nullable|exists:partners,id',
        ]);

        $user = Auth::user();

        // Users who belong to a partner can only create topics for their own partner
        if ($user->partner_id && $request->partner_id != $user->partner_id) {
            return response()->json(['message' => 'You can only create topics for your own organization.'], 403);
        }

        // Super admins can create topics for any partner or globally
        // Regular users can only create global topics (partner_id will be null)
        $partnerId = $user->isSuperAdmin() ? $request->partner_id : $user->partner_id;

        $topic = ForumTopic::create([
            'user_id' => $user->id,
            'partner_id' => $partnerId,
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category,
        ]);

        return response()->json([
            'message' => 'Topic created successfully',
            'topic' => $topic
        ], 201);
    }
    
    public function show(ForumTopic $forumTopic)
    {
        // PartnerScope handles tenancy.
        $forumTopic->load(['user', 'comments.user', 'comments.likes']);
        
        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json($forumTopic);
        }

        return \Inertia\Inertia::render('Forum/Show', [
            'topic' => $forumTopic
        ]);
    }
    
    public function update(Request $request, ForumTopic $forumTopic)
    {
        Gate::authorize('manage-forum-topic', $forumTopic);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $forumTopic->update($request->only('title', 'content'));

        return response()->json([
            'message' => 'Topic updated successfully',
            'topic' => $forumTopic
        ]);
    }
    
    public function destroy(ForumTopic $forumTopic)
    {
        Gate::authorize('manage-forum-topic', $forumTopic);

        $forumTopic->delete();

        return response()->json(['message' => 'Topic deleted successfully']);
    }

    public function markAsBestAnswer(ForumTopic $forumTopic, $commentId)
    {
        if ($forumTopic->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $forumTopic->comments()->update(['is_best_answer' => false]);
        $forumTopic->comments()->where('id', $commentId)->update(['is_best_answer' => true]);

        return response()->json(['message' => 'Marked as best answer']);
    }

    public function like(Request $request, ForumTopic $forumTopic)
    {
        $user = Auth::user();

        $like = $forumTopic->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $forumTopic->likes()->detach($user->id);
            $liked = false;
            $message = 'Topic unliked successfully';
        } else {
            $forumTopic->likes()->attach($user->id, ['type' => 'like']);
            $liked = true;
            $message = 'Topic liked successfully';

            // Notify topic owner if not self
            if ($forumTopic->user_id !== $user->id) {
                $forumTopic->user->notify(new \App\Notifications\NewLikeNotification($user, 'topic', $forumTopic));
            }
        }

        return response()->json([
            'message' => $message,
            'liked' => $liked,
            'likes_count' => $forumTopic->likes()->count(),
        ]);
    }
}