<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SuperAdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/super-admin/partners",
     *     summary="Get list of partners",
     *     tags={"Super Admin"},
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
        $partners = Partner::with('latestSubscription')->latest()->paginate(10);
        
        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json($partners);
        }

        return \Inertia\Inertia::render('SuperAdmin/Partners/Index', [
            'partners' => $partners
        ]);
    }

    public function create()
    {
        return \Inertia\Inertia::render('SuperAdmin/Partners/Create');
    }

    /**
     * @OA\Post(
     *     path="/api/super-admin/partners",
     *     summary="Create a new partner",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "domain", "logo"},
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="domain", type="string"),
     *                 @OA\Property(property="logo", type="string", format="binary"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="status", type="string", enum={"active", "inactive"})
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Partner created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:partners',
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $path = $request->file('logo')->store('partners', 'public');

        $partner = Partner::create([
            'name' => $request->name,
            'domain' => $request->domain,
            'logo' => $path,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'message' => 'Partner created successfully',
                'partner' => $partner
            ], 201);
        }

        return redirect()->route('super-admin.partners.index')->with('success', 'Partner created successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/super-admin/partners/{id}",
     *     summary="Get a specific partner",
     *     tags={"Super Admin"},
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
     *         response=404,
     *         description="Partner not found"
     *     )
     * )
     */
    public function show(Partner $partner)
    {
        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json($partner);
        }
        // Usually show is not used for partners in super admin, but if needed:
        return response()->json($partner); 
    }

    public function edit(Partner $partner)
    {
        return \Inertia\Inertia::render('SuperAdmin/Partners/Edit', [
            'partner' => $partner
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/super-admin/partners/{id}",
     *     summary="Update a partner",
     *     tags={"Super Admin"},
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
     *             @OA\Property(property="domain", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, Partner $partner)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:partners,domain,' . $partner->id,
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $partner->update($request->only(['name', 'domain', 'description', 'status']));

        if ($request->hasFile('logo')) {
            $request->validate([
                'logo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            
            // Delete old logo
            if ($partner->logo) {
                Storage::disk('public')->delete($partner->logo);
            }

            $path = $request->file('logo')->store('partners', 'public');
            $partner->update(['logo' => $path]);
        }

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'message' => 'Partner updated successfully',
                'partner' => $partner
            ]);
        }

        return redirect()->route('super-admin.partners.index')->with('success', 'Partner updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/super-admin/partners/{id}",
     *     summary="Delete a partner",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function destroy(Partner $partner)
    {
        if ($partner->logo) {
            Storage::disk('public')->delete($partner->logo);
        }
        
        // Use query builder to bulk update users associated with this partner
        \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
            ->where('partner_id', $partner->id)
            ->update(['role' => 'general_user', 'partner_id' => null]);
            
        $partner->delete();

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json(['message' => 'Partner deleted successfully']);
        }

        return redirect()->route('super-admin.partners.index')->with('success', 'Partner deleted successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/super-admin/partners/{id}/approve",
     *     summary="Approve a partner",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner approved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     )
     * )
     */
    public function approve(Partner $partner)
    {
        $partner->update(['status' => 'active']);

        // Assign partner_admin role to the applicant
        if ($partner->user_id) {
            $user = \App\Models\User::find($partner->user_id);
            if ($user) {
                $user->role = 'partner_admin';
                $user->partner_id = $partner->id;
                $user->save();
            }
        }

        // Create initial subscription
        \App\Models\Subscription::create([
            'partner_id' => $partner->id,
            'status' => 'pending',
            'start_date' => now(),
            'end_date' => now()->addMonth(),
        ]);

        // Send welcome message from Super Admin to Partner Admin
        if ($partner->user_id) {
            \App\Models\Message::create([
                'sender_id' => \Illuminate\Support\Facades\Auth::id(),
                'receiver_id' => $partner->user_id,
                'message' => "Congratulations! Your partner application for {$partner->name} has been approved. Welcome to SolveSphere!",
                'is_read' => false,
            ]);
        }

        // Notify user (optional, but good practice)
        // $user->notify(new PartnerApplicationAccepted($partner));

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json([
                'message' => 'Partner approved successfully',
                'partner' => $partner
            ]);
        }

        return redirect()->back()->with('success', 'Partner approved successfully');
    }
    /**
     * @OA\Post(
     *     path="/api/super-admin/partners/{id}/reject",
     *     summary="Reject a partner application",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner rejected successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function reject(Partner $partner)
    {
        if ($partner->logo) {
            Storage::disk('public')->delete($partner->logo);
        }
        
        // Use query builder to bulk update users associated with this partner
        \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
            ->where('partner_id', $partner->id)
            ->update(['role' => 'general_user', 'partner_id' => null]);

        $partner->delete();

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json(['message' => 'Partner application rejected successfully']);
        }

        return redirect()->back()->with('success', 'Partner application rejected successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/super-admin/partners/{id}/suspend",
     *     summary="Suspend a partner",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner suspended successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     )
     * )
     */
    public function suspend(Partner $partner)
    {
        $partner->update(['status' => 'inactive']);

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json([
                'message' => 'Partner suspended successfully',
                'partner' => $partner
            ]);
        }

        return redirect()->back()->with('success', 'Partner suspended successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/super-admin/partners/{id}/activate",
     *     summary="Activate (Unsuspend) a partner",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partner activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="partner", type="object")
     *         )
     *     )
     * )
     */
    public function activate(Partner $partner)
    {
        $partner->update(['status' => 'active']);

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json([
                'message' => 'Partner activated successfully',
                'partner' => $partner
            ]);
        }

        return redirect()->back()->with('success', 'Partner activated successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/super-admin/dashboard",
     *     summary="Get super admin dashboard stats",
     *     tags={"Super Admin"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_partners", type="integer"),
     *             @OA\Property(property="pending_partners", type="integer"),
     *             @OA\Property(property="total_users", type="integer")
     *         )
     *     )
     * )
     */
    public function dashboard()
    {
        return response()->json([
            'total_partners' => Partner::whereIn('status', ['active', 'approved'])->count(),
            'pending_partners' => Partner::where('status', 'pending')->count(),
            'total_users' => \App\Models\User::count(),
        ]);
    }

    public function updateSubscription(Request $request, Partner $partner)
    {
        $request->validate([
            'status' => 'required|in:active,rejected,pending',
        ]);

        $subscription = $partner->latestSubscription;

        if (!$subscription) {
            return response()->json(['message' => 'No subscription found'], 404);
        }

        $subscription->update([
            'status' => $request->status,
        ]);

        if ($request->status === 'active') {
             // Extend end_date if needed, or just set it.
             // For now, let's assume it was set on creation/renewal.
        }

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json([
                'message' => 'Subscription updated successfully',
                'subscription' => $subscription
            ]);
        }

        return redirect()->back()->with('success', 'Subscription updated successfully');
    }
}
