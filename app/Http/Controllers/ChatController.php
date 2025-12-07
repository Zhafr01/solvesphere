<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([]);
        }

        // Get IDs from messages
        $sentIds = DB::table('messages')
            ->where('sender_id', $userId)
            ->pluck('receiver_id')
            ->toArray();

        $receivedIds = DB::table('messages')
            ->where('receiver_id', $userId)
            ->pluck('sender_id')
            ->toArray();

        $messageIds = array_unique(array_merge($sentIds, $receivedIds));

        // Get IDs from friends
        $friendIds = DB::table('friends')
            ->selectRaw("CASE WHEN user_id = ? THEN friend_id ELSE user_id END as id", [$userId])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->pluck('id')
            ->toArray();

        // Get Admin IDs based on role
        $adminIds = [];
        $user = Auth::user();
        
        if ($user->isSuperAdmin()) {
            // Super Admin sees all Partner Admins AND applicants (users with pending partner)
            $adminIds = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                ->where(function($query) {
                    $query->where('role', 'partner_admin')
                          ->orWhereHas('partner', function($q) {
                              $q->where('status', 'pending');
                          });
                })
                ->pluck('id')
                ->toArray();
        } elseif ($user->isPartnerAdmin()) {
            // Partner Admin sees Super Admins and other Partner Admins from SAME partner
            $superAdminIds = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                ->where('role', 'super_admin')
                ->pluck('id')
                ->toArray();
                
            $partnerAdminIds = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                ->where('role', 'partner_admin')
                ->where('partner_id', $user->partner_id)
                ->where('id', '!=', $user->id)
                ->pluck('id')
                ->toArray();
                
            $adminIds = array_merge($superAdminIds, $partnerAdminIds);
        } else {
             // General User sees Partner Admins (if partner)
             // We EXCLUDE Super Admins as per request.
             if ($user->partner_id) {
                 $adminIds = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
                    ->where('role', 'partner_admin')
                    ->where('partner_id', $user->partner_id)
                    ->pluck('id')
                    ->toArray();
             } else {
                 // If no partner, they see no admins (or maybe support if we had that role, but for now empty)
                 $adminIds = [];
             }
        }

        $allIds = array_unique(array_merge($messageIds, $friendIds, $adminIds));

        if (empty($allIds)) {
            return response()->json([]);
        }

        $conversations = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
            ->whereIn('id', $allIds)
            ->get()
            ->map(function ($user) use ($userId) {
                $lastMessage = Message::where(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $userId)->where('receiver_id', $user->id);
                })->orWhere(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $userId);
                })->latest()->first();

                $unreadCount = Message::where('sender_id', $user->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', 0)
                    ->count();

                $user->last_message = $lastMessage;
                $user->unread_count = $unreadCount;
                
                return $user;
            })
            ->sortByDesc(function ($user) {
                return $user->last_message ? $user->last_message->created_at : null;
            })
            ->values();

        return response()->json($conversations);
    }

    /**
     * @OA\Get(
     *     path="/api/chat/{otherUserId}",
     *     summary="Get messages with a specific user",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="otherUserId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="object")
     *         )
     *     )
     * )
     */
    public function show($otherUserId)
    {
        $userId = Auth::id();
        $user = Auth::user();

        // Bypass scope to allow fetching users from other tenancies (for friends chat)
        $otherUser = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($otherUserId);

        // Prevent Partner Admin <-> Partner Admin chat if different partners
        if (
            $user->role === 'partner_admin' && 
            $otherUser->role === 'partner_admin' && 
            $user->partner_id !== $otherUser->partner_id
        ) {
            return response()->json(['message' => 'You can only chat with administrators from your own organization.'], 403);
        }

        // Prevent General User <-> Super Admin chat
        if (
            $user->role === 'general_user' && $otherUser->role === 'super_admin'
        ) {
             // Allow if user is an applicant (has pending partner)
             $isApplicant = $user->partner_id && \App\Models\Partner::where('id', $user->partner_id)->where('status', 'pending')->exists();
             
             if (!$isApplicant) {
                 return response()->json(['message' => 'You cannot chat with Super Admins.'], 403);
             }
        }

        // Authorize the chat
        // $isFriend = $user->friends()->where('friend_id', $otherUser->id)->exists();
        // $isSamePartner = ($user->partner_id && $user->partner_id === $otherUser->partner_id);

        // if (!$isFriend && !$isSamePartner && !$user->isSuperAdmin() && !$otherUser->isSuperAdmin()) {
        //     return response()->json(['message' => 'You can only chat with friends or users from your organization.'], 403);
        // }

        $messages = Message::where(function ($query) use ($userId, $otherUser) {
            $query->where('sender_id', $userId)
                ->where('receiver_id', $otherUser->id);
        })->orWhere(function ($query) use ($userId, $otherUser) {
            $query->where('sender_id', $otherUser->id)
                ->where('receiver_id', $userId);
        })
        ->orderBy('created_at', 'asc')
        ->get();

        // Mark messages as read
        Message::where('sender_id', $otherUser->id)
            ->where('receiver_id', $userId)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json($messages);
    }

    /**
     * @OA\Post(
     *     path="/api/chat/{otherUserId}",
     *     summary="Send a message to a user",
     *     tags={"Chat"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="otherUserId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"message"},
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Message sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request, $otherUserId)
    {
        if ($request->hasFile('image') && !$request->file('image')->isValid()) {
             return response()->json([
                 'message' => 'Image upload failed. The file is likely too large. Server limit: ' . ini_get('upload_max_filesize'),
                 'errors' => ['image' => ['The file exceeds the server limit of ' . ini_get('upload_max_filesize')]]
             ], 422);
        }

        $request->validate([
            'message' => 'nullable|string',
            'image' => 'nullable|image', // Removed max size limit
        ]);

        if (!$request->message && !$request->hasFile('image')) {
            return response()->json(['message' => 'Message or image is required.'], 422);
        }

        $user = Auth::user();
        // Bypass scope to allow fetching users from other tenancies (for friends chat)
        $otherUser = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)->findOrFail($otherUserId);

        // Prevent General User <-> Super Admin chat
        if (
            $user->role === 'general_user' && $otherUser->role === 'super_admin'
        ) {
             return response()->json(['message' => 'You cannot chat with Super Admins.'], 403);
        }

        // Authorize the chat
        // $isFriend = $user->friends()->where('friend_id', $otherUser->id)->exists();
        // $isSamePartner = ($user->partner_id && $user->partner_id === $otherUser->partner_id);

        // if (!$isFriend && !$isSamePartner && !$user->isSuperAdmin() && !$otherUser->isSuperAdmin()) {
        //     return response()->json(['message' => 'You can only chat with friends or users from your organization.'], 403);
        // }

        $attachmentPath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('chat_attachments', 'public');
            $attachmentPath = $path;
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $otherUser->id,
            'message' => $request->message ?? '', // Allow empty message if image exists
            'attachment' => $attachmentPath,
        ]);

        // Send notification
        $otherUser->notify(new \App\Notifications\NewMessage($message));

        // Broadcast event here if using websockets

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1',
        ]);

        $query = strtolower($request->input('query'));
        $userId = Auth::id();

        \Illuminate\Support\Facades\Log::info("Chat Search: User $userId searching for '$query'");

        // Search Messages
        $messagesQuery = Message::with(['sender', 'receiver'])
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->whereRaw('LOWER(message) LIKE ?', ['%' . $query . '%'])
            ->orderBy('created_at', 'desc');
        
        $messages = $messagesQuery->get();
        \Illuminate\Support\Facades\Log::info("Chat Search: Found " . $messages->count() . " messages");

        $messages = $messages->map(function ($message) use ($userId) {
            $otherUser = $message->sender_id === $userId ? $message->receiver : $message->sender;

            // If user is deleted or not found (shouldn't happen with foreign keys but safe to check)
            if (!$otherUser) return null;

            return [
                'id' => $message->id,
                'message' => $message->message,
                'created_at' => $message->created_at,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'profile_picture' => $otherUser->profile_picture,
                ],
            ];
        })
        ->filter()
        ->values();

        // Search Users
        $user = Auth::user();
        $usersQuery = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
            ->whereRaw('LOWER(name) LIKE ?', ['%' . $query . '%'])
            ->where('id', '!=', $userId);

        // Get Friend IDs
        $friendIds = DB::table('friends')
            ->selectRaw("CASE WHEN user_id = ? THEN friend_id ELSE user_id END as id", [$userId])
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->pluck('id')
            ->toArray();

        if ($user->role === 'super_admin') {
             $usersQuery->where(function($q) {
                 $q->whereIn('role', ['partner_admin', 'super_admin']);
             });
        } elseif ($user->role === 'partner_admin') {
             $usersQuery->where(function($q) {
                 $q->whereIn('role', ['super_admin', 'partner_admin']);
             });
        } elseif ($user->role === 'general_user') {
             $usersQuery->where(function($q) use ($friendIds) {
                 $q->whereIn('id', $friendIds);
             });
        }
        // Super Admin sees all

        $userResults = $usersQuery->take(5)->get()->map(function($u) {
            return [
                'id' => 'user-' . $u->id,
                'message' => 'User Match',
                'created_at' => now(),
                'other_user' => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'profile_picture' => $u->profile_picture,
                ],
            ];
        });

        $results = $messages->concat($userResults)->values();

        return response()->json($results);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $message = Message::findOrFail($id);

        if ($message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update([
            'message' => $request->message,
        ]);

        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = Message::findOrFail($id);

        if ($message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }
}
