<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Notifications\ReportStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/reports",
     *     summary="Get list of reports",
     *     tags={"Reports"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for title or content",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"pending", "in_progress", "resolved"})
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="Filter by category",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="urgency",
     *         in="query",
     *         description="Filter by urgency",
     *         required=false,
     *         @OA\Schema(type="string", enum={"Low", "Medium", "High", "Critical"})
     *     ),
     *     @OA\Parameter(
     *         name="partner_id",
     *         in="query",
     *         description="Filter by partner ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
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
        $user = Auth::user();
        // Start with a query that the PartnerScope will automatically filter.
        $query = Report::query();

        // For regular users, they should only see their own reports.
        // The PartnerScope already limits them to their tenancy (null partner_id),
        // so we add an additional check for their user_id.
        if ($user->isGeneralUser() && !$request->has('partner_slug')) {
            $query->where('user_id', $user->id);
        }

        // Super Admins need to see everything, so we can bypass the scope if they are not filtering.
        // Or let them filter by partner_id
        if ($user->isSuperAdmin() && $request->filled('partner_id')) {
             $query = Report::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('partner_id', $request->input('partner_id'));
        } elseif ($user->isSuperAdmin() && !$request->filled('partner_id')) {
            $query = Report::withoutGlobalScope(\App\Scopes\PartnerScope::class);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('content', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('urgency')) {
            $query->where('urgency', $request->input('urgency'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }
        
        // ... other filters ...

        if ($request->has('partner_slug')) {
            $partner = \App\Models\Partner::where('slug', $request->partner_slug)->first();
            if ($partner) {
                // Branch Web: Filter by this partner's ID
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                      ->where('partner_id', $partner->id);
            } else {
                // Partner not found, return empty
                $query->whereRaw('1 = 0');
            }
        } else {
            // Main Web: Filter by partner_id = null (Global Reports)
            // Unless user is Super Admin, then show all (or filtered by partner_id if provided above)
            if (!$user->isSuperAdmin()) {
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class)
                      ->whereNull('partner_id');
            } else {
                // Super Admin: Ensure PartnerScope is removed so they can see everything
                // The previous block already handled removing the scope, but we ensure it here too just in case
                $query->withoutGlobalScope(\App\Scopes\PartnerScope::class);
            }
        }

        if ($user->isGeneralUser() && !$request->has('partner_slug')) {
            $query->where('user_id', $user->id);
        }

        $reports = $query->with('user')->latest()->paginate(10);

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json($reports);
        }

        return \Inertia\Inertia::render('Reports/Index', [
            'reports' => $reports
        ]);
    }

    public function store(Request $request)
    {
        // Admins cannot create reports
        if (Auth::user()->isPartnerAdmin() || Auth::user()->isSuperAdmin()) {
            return response()->json(['message' => 'Admins cannot create reports.'], 403);
        }

        $request->validate([
            'title' => 'required',
            'category' => 'required',
            'urgency' => 'required|in:Low,Medium,High,Critical',
            'content' => 'required',
            'attachment' => 'nullable|file|mimes:jpg,png,pdf,doc,docx|max:2048',
            'partner_id' => 'nullable|exists:partners,id',
        ]);
        
        $user = Auth::user();

        // If user belongs to a partner, the report must be for that partner.
        if ($user->partner_id && $request->partner_id != $user->partner_id) {
            return response()->json(['message' => 'You can only create reports for your own organization.'], 403);
        }

        $report = new Report();
        $report->user_id = $user->id;
        $report->partner_id = $user->partner_id; // A user can only create a report for their own tenancy
        $report->title = $request->title;
        $report->category = $request->category;
        $report->urgency = $request->urgency;
        $report->content = $request->content;

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $report->attachment = $path;
        }

        $report->save();

        // Notify Admins
        if ($report->partner_id) {
            $admins = \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('partner_id', $report->partner_id)->where('role', 'partner_admin')->get();
        } else {
            $admins = \App\Models\User::withoutGlobalScope(\App\Scopes\PartnerScope::class)->where('role', 'super_admin')->get();
        }
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewReport($report));

        return response()->json([
            'message' => 'Report created successfully',
            'report' => $report
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/reports/{id}",
     *     summary="Get a specific report",
     *     tags={"Reports"},
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
     *         description="Report not found"
     *     )
     * )
     */
    public function show(Report $report)
    {
        \Illuminate\Support\Facades\Gate::authorize('view-report', $report);

        $report->load('user');

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json($report);
        }

        return \Inertia\Inertia::render('Reports/Show', [
            'report' => $report
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/reports/{id}",
     *     summary="Update a report",
     *     tags={"Reports"},
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
     *             @OA\Property(property="status", type="string", enum={"pending", "in_progress", "resolved"}),
     *             @OA\Property(property="admin_note", type="string"),
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="urgency", type="string", enum={"Low", "Medium", "High", "Critical"}),
     *             @OA\Property(property="content", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Report updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="report", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function update(Request $request, Report $report)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage-report', $report);

        $user = Auth::user();

        if ($user->isPartnerAdmin() || $user->isSuperAdmin()) {
            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,resolved',
                'admin_note' => 'nullable|string',
            ]);
            $report->update($validated);
            // Notify user about status update
            // $report->user->notify(new ReportStatusUpdated($report)); 
        } else {
            // General user, check time limit
            if ($report->created_at->diffInMinutes(now()) > 15) {
                return response()->json(['message' => 'You can no longer edit this report.'], 403);
            }
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'urgency' => 'required|in:Low,Medium,High,Critical',
                'content' => 'required|string',
                'attachment' => 'nullable|file|mimes:jpg,png,pdf,doc,docx|max:2048',
            ]);
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $validated['attachment'] = $path;
            }
            $report->update($validated);
        }

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/reports/{id}",
     *     summary="Delete a report",
     *     tags={"Reports"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Report deleted successfully",
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
    public function destroy(Report $report)
    {
        // Only the author can delete, and only within 15 minutes. Admins cannot delete.
        if ($report->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($report->created_at->diffInMinutes(now()) > 15) {
            return response()->json(['message' => 'You can no longer delete this report.'], 403);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
