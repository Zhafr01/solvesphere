<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for login/admin routes if needed, but usually we want to block everything except specific admin access
        // Ideally we allow login so admins can get in, but block other actions.
        // OR we block login for non-admins.
        
        $isMaintenance = Setting::where('key', 'maintenance_mode')->value('value') === '1';

        if ($isMaintenance) {
            // Allow if user is super_admin
            if (Auth::check() && Auth::user()->role === 'super_admin') {
                return $next($request);
            }

            // If not logged in, or not super admin, return 503
            // But we might want to allow login requests to proceed so we can check if they are admin
            if ($request->is('api/login') || $request->is('login')) {
                return $next($request);
            }
            
             // Also allow public assets or specific endpoints?
             // For API only app:
            return response()->json(['message' => 'System is in maintenance mode. Please try again later.'], 503);
        }

        return $next($request);
    }
}
