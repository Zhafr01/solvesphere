<?php

use App\Models\User;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Mock Auth as Super Admin
$superAdmin = User::where('role', 'super_admin')->first();
if (!$superAdmin) {
    echo "No Super Admin found.\n";
    exit;
}
Auth::login($superAdmin);
$userId = $superAdmin->id;
echo "Logged in as: " . $superAdmin->name . " (ID: " . $superAdmin->id . ")\n";

// Test Queries
$queries = ['anja', 'pixel'];

foreach ($queries as $query) {
    echo "\n--------------------------------------------------\n";
    echo "Testing Query: '$query'\n";
    echo "--------------------------------------------------\n";

    // 1. Search Messages
    $messagesQuery = Message::where(function ($q) use ($userId) {
        $q->where('sender_id', $userId)
          ->orWhere('receiver_id', $userId);
    })
    ->where('message', 'LIKE', '%' . $query . '%')
    ->orderBy('created_at', 'desc');

    $messages = $messagesQuery->get();
    echo "Found " . $messages->count() . " raw messages.\n";

    $messages = $messages->map(function ($message) use ($userId) {
        $otherUserId = $message->sender_id === $userId ? $message->receiver_id : $message->sender_id;
        $otherUser = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)->find($otherUserId);

        if (!$otherUser) {
            echo "  [Warning] User $otherUserId not found for message {$message->id}\n";
            return null;
        }

        return [
            'id' => $message->id,
            'message' => $message->message,
            'other_user_name' => $otherUser->name,
        ];
    })
    ->filter()
    ->values();

    echo "Mapped " . $messages->count() . " messages.\n";
    foreach ($messages as $m) {
        echo "  - Msg: {$m['message']} (User: {$m['other_user_name']})\n";
    }

    // 2. Search Users
    $user = Auth::user();
    $usersQuery = User::withoutGlobalScope(\App\Scopes\PartnerScope::class)
        ->where('name', 'LIKE', '%' . $query . '%')
        ->where('id', '!=', $userId);

    // Role logic (Super Admin sees all, so no extra filters)
    
    $userResults = $usersQuery->take(5)->get()->map(function($u) {
        return [
            'id' => 'user-' . $u->id,
            'message' => 'User Match',
            'other_user_name' => $u->name,
        ];
    });

    echo "Found " . $userResults->count() . " users.\n";
    foreach ($userResults as $u) {
        echo "  - User: {$u['other_user_name']}\n";
    }

    $results = $messages->merge($userResults)->values();
    echo "Total Results: " . $results->count() . "\n";
}
