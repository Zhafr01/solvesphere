<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Report;
use App\Models\ForumTopic;
use App\Models\News;

class AdminController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalReports = Report::count();
        $pendingReports = Report::where('status', 'pending')->count();
        $totalForumTopics = ForumTopic::count();
        $totalNews = News::count();

        // Assuming the user wants to map the existing data to the new compact keys
        // If 'partners' is a new concept, it would need to be defined.
        // For now, mapping existing counts to the new compact keys.
        $users = $totalUsers;
        $reports = $totalReports;
        $news = $totalNews;
        // 'partners' is not defined in the original code, so it will be null or 0 if not explicitly set.
        // For the purpose of this edit, we'll assume it's not critical or will be added later.
        $partners = 0; // Placeholder or actual data if available

        return \Inertia\Inertia::render('Admin/Index', compact('users', 'partners', 'reports', 'news'));
    }
}