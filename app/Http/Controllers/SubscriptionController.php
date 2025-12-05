<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->partner_id) {
            return response()->json(['message' => 'No partner associated'], 404);
        }

        $subscription = Subscription::where('partner_id', $user->partner_id)->latest()->first();

        if (request()->wantsJson() && !request()->inertia()) {
            return response()->json($subscription);
        }

        return \Inertia\Inertia::render('Subscription/Index', [
            'subscription' => $subscription
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $user = Auth::user();
        $subscription = Subscription::where('partner_id', $user->partner_id)->latest()->first();

        if (!$subscription) {
             // Should have been created on approval, but just in case
             $subscription = Subscription::create([
                 'partner_id' => $user->partner_id,
                 'status' => 'pending',
                 'start_date' => now(),
                 'end_date' => now()->addMonth(),
             ]);
        }

        $path = $request->file('proof_image')->store('payment_proofs', 'public');

        $subscription->update([
            'proof_image' => $path,
            'status' => 'pending', // Reset to pending if they re-upload? Or maybe 'submitted'? User said "pending" usually.
        ]);

        if ($request->wantsJson() && !$request->inertia()) {
            return response()->json([
                'message' => 'Payment proof uploaded successfully',
                'subscription' => $subscription
            ]);
        }

        return redirect()->back()->with('success', 'Payment proof uploaded successfully');
    }
}
