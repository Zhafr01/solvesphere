<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/friends",
     *     summary="Get list of friends and pending requests",
     *     tags={"Friends"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="friends", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="pending_requests", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="sent_requests", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        $user = Auth::user();

        // Get accepted friends
        $friends = DB::table('friends')
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->join('users', function ($join) use ($user) {
                $join->on('users.id', '=', DB::raw("CASE WHEN user_id = {$user->id} THEN friend_id ELSE user_id END"));
            })
            ->select('users.id', 'users.name', 'users.email', 'users.profile_picture', 'friends.id as friendship_id')
            ->get();

        // Get pending requests received
        $pendingRequests = DB::table('friends')
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->join('users', 'users.id', '=', 'friends.user_id')
            ->select('users.id', 'users.name', 'users.email', 'users.profile_picture', 'friends.id as friendship_id', 'friends.created_at')
            ->get();

        // Get pending requests sent
        $sentRequests = DB::table('friends')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->join('users', 'users.id', '=', 'friends.friend_id')
            ->select('users.id', 'users.name', 'users.email', 'users.profile_picture', 'friends.id as friendship_id', 'friends.created_at')
            ->get();

        return response()->json([
            'friends' => $friends,
            'pending_requests' => $pendingRequests,
            'sent_requests' => $sentRequests
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/friends",
     *     summary="Send a friend request",
     *     tags={"Friends"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"friend_id"},
     *             @OA\Property(property="friend_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Friend request sent",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id|different:user_id',
        ]);

        $userId = Auth::id();
        $friendId = $request->friend_id;

        // Check if friendship already exists
        $exists = DB::table('friends')
            ->where(function ($query) use ($userId, $friendId) {
                $query->where('user_id', $userId)->where('friend_id', $friendId);
            })
            ->orWhere(function ($query) use ($userId, $friendId) {
                $query->where('user_id', $friendId)->where('friend_id', $userId);
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Friend request already sent or you are already friends.'], 400);
        }

        DB::table('friends')->insert([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Notify user
        $friend = User::find($friendId);
        if ($friend) {
            $friend->notify(new \App\Notifications\NewFriendRequest(Auth::user()));
        }

        return response()->json(['message' => 'Friend request sent successfully.'], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/friends/{id}",
     *     summary="Accept or Reject friend request",
     *     tags={"Friends"},
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
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"accepted", "rejected"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Friend request updated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $friendship = DB::table('friends')->where('id', $id)->first();

        if (!$friendship) {
            return response()->json(['message' => 'Friend request not found.'], 404);
        }

        if ($friendship->friend_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($request->status === 'rejected') {
            DB::table('friends')->where('id', $id)->delete();
            return response()->json(['message' => 'Friend request rejected.']);
        }

        DB::table('friends')->where('id', $id)->update([
            'status' => 'accepted',
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Friend request accepted.']);
    }

    /**
     * @OA\Delete(
     *     path="/api/friends/{id}",
     *     summary="Unfriend or Cancel request",
     *     tags={"Friends"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Friend removed",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        
        $friendship = DB::table('friends')
            ->where('id', $id)
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->first();

        if (!$friendship) {
            return response()->json(['message' => 'Friendship not found or unauthorized.'], 404);
        }

        DB::table('friends')->where('id', $id)->delete();

        return response()->json(['message' => 'Friend removed successfully.']);
    }

    /**
     * @OA\Get(
     *     path="/api/friends/search",
     *     summary="Search users to add as friend",
     *     tags={"Friends"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Search results",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="object")
     *         )
     *     )
     * )
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $userId = Auth::id();

        if (empty($query)) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->where('id', '!=', $userId)
            ->where('role', 'general_user') // Only search general users? Or allow searching admins too?
            ->take(10)
            ->get()
            ->map(function ($user) use ($userId) {
                // Check friendship status
                $friendship = DB::table('friends')
                    ->where(function ($q) use ($userId, $user) {
                        $q->where('user_id', $userId)->where('friend_id', $user->id);
                    })
                    ->orWhere(function ($q) use ($userId, $user) {
                        $q->where('user_id', $user->id)->where('friend_id', $userId);
                    })
                    ->first();

                $user->friendship_status = $friendship ? $friendship->status : null;
                $user->friendship_id = $friendship ? $friendship->id : null;
                $user->is_sender = $friendship ? ($friendship->user_id === $userId) : false;
                
                return $user;
            });

        return response()->json($users);
    }
}
