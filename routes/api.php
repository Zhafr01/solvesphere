<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ForumTopicController;
use App\Http\Controllers\ForumCommentController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PartnerApplicationController;
use App\Http\Controllers\SuperAdmin\SuperAdminController;
use App\Http\Controllers\PartnerAdmin\PartnerAdminController;
use App\Http\Controllers\PartnerAdmin\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/landing-page', [App\Http\Controllers\LandingPageController::class, 'index']);
Route::get('/partners/{slug}', [App\Http\Controllers\PartnerSiteController::class, 'index']);
Route::post('/partners/{slug}/register', [App\Http\Controllers\PartnerAuthController::class, 'store']);
Route::post('/partners/{slug}/rate', [App\Http\Controllers\PartnerRatingController::class, 'store']);


// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Profile
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit']);
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/profile', [App\Http\Controllers\ProfileController::class, 'update']); // Add POST route for multipart/form-data
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy']);
    Route::get('/users/{id}/profile', [App\Http\Controllers\ProfileController::class, 'show']);

    // Dashboard & Home
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/home', [App\Http\Controllers\HomeController::class, 'index']);

    // Reports
    Route::apiResource('reports', ReportController::class);

    // Forum
    Route::apiResource('forum-topics', ForumTopicController::class);
    Route::post('/forum-topics/{forumTopic}/like', [ForumTopicController::class, 'like']);
    Route::post('/forum-topics/{forumTopic}/comments', [ForumCommentController::class, 'store']);
    Route::put('/forum-topics/{forumTopic}/comments/{comment}', [ForumCommentController::class, 'update']);
    Route::delete('/forum-topics/{forumTopic}/comments/{comment}', [ForumCommentController::class, 'destroy']);
    Route::post('/forum-topics/{forumTopic}/comments/{comment}/best-answer', [ForumTopicController::class, 'markAsBestAnswer']);
    Route::post('/comments/{comment}/like', [ForumCommentController::class, 'like']);

    // News
    Route::apiResource('news', NewsController::class);
    Route::post('/news/{news}/like', [NewsController::class, 'like']);

    // Chat
    Route::get('/chat/search', [ChatController::class, 'search']);
    Route::get('/chat', [ChatController::class, 'index']);
    Route::get('/chat/{otherUserId}', [ChatController::class, 'show']);
    Route::post('/chat/{otherUserId}', [ChatController::class, 'store']);

    // Friends
    Route::get('/friends', [App\Http\Controllers\FriendController::class, 'index']);
    Route::post('/friends', [App\Http\Controllers\FriendController::class, 'store']);
    Route::put('/friends/{id}', [App\Http\Controllers\FriendController::class, 'update']);
    Route::delete('/friends/{id}', [App\Http\Controllers\FriendController::class, 'destroy']);
    Route::get('/friends/search', [App\Http\Controllers\FriendController::class, 'search']);

    // Partner Application
    Route::post('/apply-partner', [PartnerApplicationController::class, 'store']);


    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);

    // Super Admin
    Route::middleware('role:super_admin')->prefix('super-admin')->name('super-admin.')->group(function () {
        Route::apiResource('partners', SuperAdminController::class);
        Route::post('partners/{partner}/approve', [SuperAdminController::class, 'approve'])->name('partners.approve');
        Route::post('partners/{partner}/reject', [SuperAdminController::class, 'reject'])->name('partners.reject');
        Route::get('dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');

        Route::post('partners/{partner}/subscription', [SuperAdminController::class, 'updateSubscription'])->name('partners.subscription.update');
        
        // User Management
        Route::get('users', [App\Http\Controllers\SuperAdmin\UserController::class, 'index'])->name('users.index');
        Route::post('users/{id}/suspend', [App\Http\Controllers\SuperAdmin\UserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{id}/activate', [App\Http\Controllers\SuperAdmin\UserController::class, 'activate'])->name('users.activate');
        Route::post('users/{id}/ban', [App\Http\Controllers\SuperAdmin\UserController::class, 'ban'])->name('users.ban');
    });

    // Partner Admin
    Route::middleware('role:partner_admin')->prefix('partner-admin')->name('partner-admin.')->group(function () {
        Route::get('subscription', [App\Http\Controllers\SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('subscription', [App\Http\Controllers\SubscriptionController::class, 'store'])->name('subscription.store');

        Route::apiResource('partner-admins', PartnerAdminController::class);
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    });
});
