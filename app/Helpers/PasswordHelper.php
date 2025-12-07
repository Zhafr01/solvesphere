<?php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Validation\Rules\Password;

class PasswordHelper
{
    public static function getValidationRules()
    {
        $minLength = Setting::where('key', 'minPasswordLength')->value('value') ?? 8;
        $requireSpecialChar = Setting::where('key', 'requireSpecialChar')->value('value') ?? true;
        
        // Convert to boolean if it's stored as '1' or '0' string
        $requireSpecialChar = filter_var($requireSpecialChar, FILTER_VALIDATE_BOOLEAN);

        $rules = Password::min((int) $minLength);

        if ($requireSpecialChar) {
            $rules->symbols();
        }

        return $rules;
    }
}
