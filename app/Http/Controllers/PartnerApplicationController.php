<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\User;
use App\Notifications\NewPartnerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartnerApplicationController extends Controller
{
    public function create()
    {
        return \Inertia\Inertia::render('Partner/Apply');
    }

    /**
     * @OA\Post(
     *     path="/api/apply-partner",
     *     summary="Apply to become a partner",
     *     tags={"Partner Application"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "domain", "description", "logo"},
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="domain", type="string"),
     *                 @OA\Property(property="website", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="logo", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Application submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:partners,domain',
            'logo' => 'required|image',// Removed max size limit
            'website' => 'nullable|url',
            'description' => 'required|string',
        ];

        $validated = $request->validate($rules);

        $path = $request->file('logo')->store('partners', 'public');

        $partner = Partner::create([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'domain' => $validated['domain'],
            'logo' => $path,
            'website' => $request->website,
            'description' => $validated['description'],
            'status' => 'pending',
            'user_id' => Auth::id(),
        ]);

        // Link user to partner
        $user = Auth::user();
        $user->partner_id = $partner->id;
        $user->save();

        // Notify Super Admins
        $superAdmins = User::where('role', 'super_admin')->get();
        \Illuminate\Support\Facades\Notification::send($superAdmins, new NewPartnerApplication($partner));

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'message' => 'Application submitted successfully. Please wait for approval.',
                'partner' => $partner
            ], 201);
        }

        return redirect()->route('dashboard')->with('success', 'Application submitted successfully. Please wait for approval.');
    }
}
