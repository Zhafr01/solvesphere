<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/profile",
     *     summary="Get user profile",
     *     tags={"Profile"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     */
    public function edit(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'mustVerifyEmail' => $request->user() instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/profile",
     *     summary="Update user profile",
     *     tags={"Profile"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="profile_picture", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     )
     * )
     */
    public function update(ProfileUpdateRequest $request)
    {
        \Illuminate\Support\Facades\Log::info('Profile update request data:', $request->all());
        \Illuminate\Support\Facades\Log::info('Has file profile_picture: ' . ($request->hasFile('profile_picture') ? 'yes' : 'no'));

        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profiles', 'public');
            $request->user()->profile_picture = '/storage/' . $path;
            \Illuminate\Support\Facades\Log::info('Profile picture stored at: ' . $path);
        }

        $request->user()->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $request->user(),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/profile",
     *     summary="Delete user account",
     *     tags={"Profile"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"password"},
     *             @OA\Property(property="password", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Account deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Account deleted successfully']);
    }
    public function show($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $currentUser = Auth::user();

        $friendship = \Illuminate\Support\Facades\DB::table('friends')
            ->where(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $currentUser->id)->where('friend_id', $user->id);
            })
            ->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('user_id', $user->id)->where('friend_id', $currentUser->id);
            })
            ->first();

        $friendStatus = 'none';
        if ($friendship) {
            if ($friendship->status === 'accepted') {
                $friendStatus = 'friends';
            } elseif ($friendship->status === 'pending') {
                $friendStatus = $friendship->user_id === $currentUser->id ? 'pending_sent' : 'pending_received';
            }
        }

        // Add counts
        $user->friends_count = \Illuminate\Support\Facades\DB::table('friends')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })
            ->where('status', 'accepted')
            ->count();
            
        $user->topics_count = $user->forumTopics()->count();
        $user->comments_count = $user->forumComments()->count();

        return response()->json([
            'user' => $user,
            'friend_status' => $friendStatus,
            'friendship_id' => $friendship ? $friendship->id : null
        ]);
    }
}
