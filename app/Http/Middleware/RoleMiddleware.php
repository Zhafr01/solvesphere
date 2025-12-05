<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if ($user->isPartnerAdmin() && (in_array('partner_admin', $roles) || in_array('general_user', $roles))) {
            return $next($request);
        }

        if ($user->isGeneralUser() && in_array('general_user', $roles)) {
            return $next($request);
        }

        abort(403, 'Unauthorized action.');
    }
}
