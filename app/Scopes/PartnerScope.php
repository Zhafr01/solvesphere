<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Scope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class PartnerScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->isSuperAdmin()) {
                // Super admins can see all content, so don't apply any partner scope.
                return;
            }

            if ($user->partner_id) {
                $builder->where($model->getTable() . '.partner_id', $user->partner_id);
            } else {
                $builder->whereNull($model->getTable() . '.partner_id');
            }
        }
        // If user is not authenticated, no scope is applied.
        // This is for public pages like the main forum index.
        // We will handle tenancy for public partner pages manually in the controller.
    }
}
