<?php

namespace App\Providers;

use App\Models\ForumTopic;
use App\Models\Report;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\News;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-news', function (User $user, News $news) {
            if ($user->isSuperAdmin()) {
                return true;
            }

            if ($user->isPartnerAdmin() && $user->partner_id === $news->partner_id) {
                return true;
            }
            
            return $user->id === $news->admin_id;
        });

        Gate::define('manage-forum-topic', function (User $user, ForumTopic $topic) {
            if ($user->isSuperAdmin()) {
                return true;
            }

            if ($user->isPartnerAdmin() && $user->partner_id === $topic->partner_id) {
                return true;
            }

            return $user->id === $topic->user_id;
        });

        Gate::define('view-report', function (User $user, Report $report) {
            if ($user->isSuperAdmin()) {
                return true;
            }
            if ($user->isPartnerAdmin() && $user->partner_id === $report->partner_id) {
                return true;
            }
            return $user->id === $report->user_id;
        });

        Gate::define('manage-report', function (User $user, Report $report) {
            if ($user->isSuperAdmin()) {
                return true;
            }
            if ($user->isPartnerAdmin() && $user->partner_id === $report->partner_id) {
                return true;
            }
            return $user->id === $report->user_id;
        });
    }
}
