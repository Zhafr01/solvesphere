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

// Mock Auth
$superAdmin = User::where('role', 'super_admin')->first();
if (!$superAdmin) {
    echo "No Super Admin found.\n";
    exit;
}
Auth::login($superAdmin);

echo "Logged in as: " . $superAdmin->name . " (ID: " . $superAdmin->id . ")\n";

$query = 'done';

echo "Searching for: '$query'\n";

$messagesQuery = Message::where(function ($q) use ($superAdmin) {
    $q->where('sender_id', $superAdmin->id)
      ->orWhere('receiver_id', $superAdmin->id);
})
->whereRaw('LOWER(message) LIKE ?', ['%' . strtolower($query) . '%'])
->orderBy('created_at', 'desc');

echo "SQL: " . $messagesQuery->toSql() . "\n";
print_r($messagesQuery->getBindings());

$messages = $messagesQuery->get();

echo "Found " . $messages->count() . " messages.\n";

foreach ($messages as $msg) {
    echo " - [ID: {$msg->id}] {$msg->message} (Sender: {$msg->sender_id}, Receiver: {$msg->receiver_id})\n";
}

// Check if any message exists with 'done' regardless of user
$allMessages = Message::where('message', 'LIKE', '%done%')->get();
echo "Total messages in DB matching 'done': " . $allMessages->count() . "\n";
foreach ($allMessages as $msg) {
    echo " - [ID: {$msg->id}] {$msg->message} (Sender: {$msg->sender_id}, Receiver: {$msg->receiver_id})\n";
}
