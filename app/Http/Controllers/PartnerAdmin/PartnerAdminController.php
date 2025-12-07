<?php

namespace App\Http\Controllers\PartnerAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class PartnerAdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/partner-admin/partner-admins",
     *     summary="Get list of partner admins",
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
        $admins = User::where('partner_id', Auth::user()->partner_id)
            ->where('role', 'partner_admin')
            ->latest()
            ->paginate(10);

        return response()->json($admins);
    }

    /**
     * @OA\Post(
     *     path="/api/partner-admin/partner-admins",
     *     summary="Create a new partner admin",
     *     tags={"Partner Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "password_confirmation"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Partner Admin created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="admin", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', \App\Helpers\PasswordHelper::getValidationRules()],
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'partner_admin',
            'partner_id' => Auth::user()->partner_id,
        ]);

        return response()->json([
            'message' => 'Partner Admin created successfully',
            'admin' => $admin
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/partner-admin/partner-admins/{id}",
     *     summary="Get a specific partner admin",
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
     *         description="Successful operation",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function show(User $partnerAdmin)
    {
        if ($partnerAdmin->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($partnerAdmin);
    }

    /**
     * @OA\Put(
     *     path="/api/partner-admin/partner-admins/{id}",
     *     summary="Update a partner admin",
     *     tags={"Partner Admin"},
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
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner Admin updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="admin", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function update(Request $request, User $partnerAdmin)
    {
        if ($partnerAdmin->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $partnerAdmin->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $partnerAdmin->name = $request->name;
        $partnerAdmin->email = $request->email;

        if ($request->filled('password')) {
            $partnerAdmin->password = Hash::make($request->password);
        }

        $partnerAdmin->save();

        return response()->json([
            'message' => 'Partner Admin updated successfully',
            'admin' => $partnerAdmin
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/partner-admin/partner-admins/{id}",
     *     summary="Delete a partner admin",
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
     *         description="Partner Admin deleted successfully",
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
    public function destroy(User $partnerAdmin)
    {
        if ($partnerAdmin->partner_id !== Auth::user()->partner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($partnerAdmin->id === Auth::id()) {
            return response()->json(['message' => 'You cannot delete yourself'], 403);
        }

        $partnerAdmin->delete();

        return response()->json(['message' => 'Partner Admin deleted successfully']);
    }
}
