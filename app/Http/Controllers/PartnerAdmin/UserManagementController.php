<?php

namespace App\Http\Controllers\PartnerAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/partner-admin/users",
     *     summary="Get list of users",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
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
        $partnerId = Auth::user()->partner_id;
        
        $query = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
            ->where('role', '!=', 'partner_admin') // Exclude other partner admins
            ->where(function ($q) use ($partnerId) {
                // 1. Users explicitly assigned to this partner
                $q->where('partner_id', $partnerId)
                // 2. OR Global users (User from main site) who have interacted with this partner's content
                  ->orWhere(function ($sub) use ($partnerId) {
                      $sub->whereNull('partner_id')
                          ->where(function ($interaction) use ($partnerId) {
                              // Has created a topic in this partner's forum
                              $interaction->whereHas('forumTopics', function ($t) use ($partnerId) {
                                  $t->where('partner_id', $partnerId);
                              })
                              // OR Has created a report in this partner's scope
                              ->orWhereHas('reports', function ($r) use ($partnerId) {
                                  $r->where('partner_id', $partnerId);
                              })
                              // OR Has commented on a topic belonging to this partner
                              ->orWhereHas('forumComments.topic', function ($ct) use ($partnerId) {
                                  $ct->where('partner_id', $partnerId);
                              });
                          });
                  });
            });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(10);

        return response()->json($users);
    }

    /**
     * @OA\Post(
     *     path="/api/partner-admin/users/{id}/suspend",
     *     summary="Suspend a user",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User suspended successfully",
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
    public function suspend(User $user)
    {
        if ($user->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->update(['status' => 'suspended']);

        return response()->json(['message' => 'User suspended successfully']);
    }

    /**
     * @OA\Post(
     *     path="/api/partner-admin/users/{id}/activate",
     *     summary="Activate a user",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User activated successfully",
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
    public function activate(User $user)
    {
        if ($user->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->update(['status' => 'active']);

        return response()->json(['message' => 'User activated successfully']);
    }

    /**
     * @OA\Post(
     *     path="/api/partner-admin/users/{id}/ban",
     *     summary="Ban a user",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User banned successfully",
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
    public function ban(User $user)
    {
        if ($user->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->update(['status' => 'banned']);

        return response()->json(['message' => 'User banned successfully']);
    }
    /**
     * @OA\Post(
     *     path="/api/partner-admin/users/{id}/promote",
     *     summary="Promote a user to Partner Admin",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User promoted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function promote(User $user)
    {
        // Check if user is already a partner admin for this partner
        if ($user->role === 'partner_admin' && $user->partner_id === Auth::user()->partner_id) {
             return response()->json(['message' => 'User is already an admin for this partner'], 422);
        }

        // We allow promoting any 'general_user' (even if they have no partner_id, effectively recruiting them)
        // OR a user already assigned to this partner.
        // We should probably NOT steal users from other partners, but the query in index() filters those out anyway.
        // Let's add a safety check just in case.
        if ($user->partner_id && $user->partner_id !== Auth::user()->partner_id) {
             return response()->json(['message' => 'User belongs to another partner'], 403);
        }

        $user->update([
            'role' => 'partner_admin',
            'partner_id' => Auth::user()->partner_id
        ]);

        return response()->json(['message' => 'User promoted to Partner Admin successfully']);
    }
}
