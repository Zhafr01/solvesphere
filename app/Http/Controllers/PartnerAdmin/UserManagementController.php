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
    public function index()
    {
        $users = User::where('partner_id', Auth::user()->partner_id)
            ->where('role', 'general_user')
            ->latest()
            ->paginate(10);

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
}
