<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\ResetPasswordMail;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class ForgotPasswordController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/forgot-password",
     *     summary="Send password reset link",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Reset link sent")
     * )
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // If user doesn't exist, we still return success to prevent email enumeration
        if (!$user) {
            return response()->json(['message' => 'If an account exists for this email, you will receive a password reset link.']);
        }

        $token = Str::random(60);

        // Store token in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => $token, // In a real app, you might want to hash this
                'created_at' => now()
            ]
        );

        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        try {
            Mail::to($request->email)->send(new ResetPasswordMail($resetUrl));
        } catch (\Exception $e) {
            Log::error('Failed to send reset email: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send reset link. Please try again later.'], 500);
        }

        return response()->json(['message' => 'If an account exists for this email, you will receive a password reset link.']);
    }

    /**
     * @OA\Post(
     *     path="/api/reset-password",
     *     summary="Reset password using token",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token", "email", "password", "password_confirmation"},
     *             @OA\Property(property="token", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password reset successfully")
     * )
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', \App\Helpers\PasswordHelper::getValidationRules()],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired password reset token.'], 422);
        }

        // Check if token is expired (e.g., 60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            return response()->json(['message' => 'Password reset token has expired.'], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->forceFill([
            'password' => Hash::make($request->password)
        ])->save();

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Your password has been reset successfully.']);
    }
}
