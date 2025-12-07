<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();


use App\Models\User;
use App\Models\Message;
use App\Notifications\NewMessage;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;

// Mock Auth
$sender = User::find(29); // zah
Auth::login($sender);

$receiverId = 28; // paul
echo "Sender: " . $sender->name . " (ID: " . $sender->id . ")\n";

// Use existing image
$dummyFilePath = __DIR__ . '/test_proof.jpg';
if (!file_exists($dummyFilePath)) {
    die("Test image not found");
}

$file = new \Illuminate\Http\UploadedFile(
    $dummyFilePath,
    'test_proof.jpg',
    'image/jpeg',
    null,
    true
);

$request = Request::create('/api/chat/' . $receiverId, 'POST', [
    'message' => 'Controller Test Message with Image'
]);
$request->files->set('image', $file);

$controller = new ChatController();

try {
    echo "Calling ChatController::store...\n";
    $response = $controller->store($request, $receiverId);
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Content: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "Controller Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

