<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Support\Facades\Cache;

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

        // For API, we revoke tokens instead of "logging out" a session
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        // If we want to revoke ALL tokens:
        // $user->tokens()->delete();

        $user->delete();

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

    /**
     * @OA\Post(
     *     path="/api/profile/password-code",
     *     summary="Send verification code for password change",
     *     tags={"Profile"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password"},
     *             @OA\Property(property="current_password", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Code sent")
     * )
     */
    public function sendPasswordCode(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
        ]);

        $code = rand(100000, 999999);
        
        // Use Cache instead of Session for API reliability
        // Key: password_verification_code_USERID
        // Expiry: 10 minutes (600 seconds)
        Cache::put('password_verification_code_' . $request->user()->id, $code, now()->addMinutes(10));

        \Illuminate\Support\Facades\Mail::to($request->user())->send(new \App\Mail\PasswordVerificationMail($code));

        return response()->json(['message' => 'Verification code sent to your email. Check your logs if testing locally.']);
    }

    /**
     * @OA\Post(
     *     path="/api/profile/password",
     *     summary="Update password using verification code",
     *     tags={"Profile"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password", "new_password", "new_password_confirmation", "verification_code"},
     *             @OA\Property(property="current_password", type="string"),
     *             @OA\Property(property="new_password", type="string"),
     *             @OA\Property(property="new_password_confirmation", type="string"),
     *             @OA\Property(property="verification_code", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password updated")
     * )
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'new_password' => ['required', 'confirmed', \App\Helpers\PasswordHelper::getValidationRules()],
            'verification_code' => ['required'],
        ]);

        $cacheKey = 'password_verification_code_' . $request->user()->id;
        $cachedCode = Cache::get($cacheKey);

        if (!$cachedCode) {
            return response()->json(['message' => 'Verification code expired or invalid.'], 422);
        }

        if ($request->verification_code != $cachedCode) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        $request->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password),
        ]);

        // Clear cache
        Cache::forget($cacheKey);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
