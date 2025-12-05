<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/api/documentation');

// Keep auth routes if they are needed for some reason, but usually API auth is handled via API routes.
// For now, we'll comment them out or remove them as per the request to be API-only.
// require __DIR__.'/auth.php';


Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
