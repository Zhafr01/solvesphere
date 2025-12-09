<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/settings/system-info",
     *     summary="Get system info",
     *     tags={"Settings"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="php_version", type="string"),
     *             @OA\Property(property="laravel_version", type="string"),
     *             @OA\Property(property="server_os", type="string"),
     *             @OA\Property(property="database_connection", type="string"),
     *             @OA\Property(property="disk_free_space", type="string")
     *         )
     *     )
     * )
     */
    public function getSystemInfo()
    {
        // 1. Get Logs (Last 50 lines)
        $logFile = storage_path('logs/laravel.log');
        $logs = [];
        if (file_exists($logFile)) {
            $file = file($logFile);
            $logs = array_slice($file, -50);
            $logs = array_reverse($logs); // Newest first
        }

        // 2. Database Size
        try {
            $dbName = DB::connection()->getDatabaseName();
            $dbSize = DB::select("SELECT round(sum(data_length + index_length) / 1024 / 1024, 2) as 'size' FROM information_schema.tables WHERE table_schema = ?", [$dbName]);
            $dbSizeMb = $dbSize[0]->size . ' MB';
        } catch (\Exception $e) {
            $dbSizeMb = 'Unknown';
        }

        // 3. CPU Load (Unix only)
        $load = 'N/A';
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            $load = isset($load[0]) ? $load[0] : 'N/A';
        }

        return response()->json([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'os' => php_uname('s') . ' ' . php_uname('r'),
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Apache/Nginx',
            'db_connection' => DB::connection()->getDatabaseName(),
            'db_driver' => DB::connection()->getDriverName(),
            'db_size' => $dbSizeMb,
            'disk_free_space' => disk_free_space('/') ? round(disk_free_space('/') / 1024 / 1024 / 1024, 2) . ' GB' : 'Unknown',
            'disk_total_space' => disk_total_space('/') ? round(disk_total_space('/') / 1024 / 1024 / 1024, 2) . ' GB' : 'Unknown',
            'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
            'cpu_load' => $load,
            'user_count' => \App\Models\User::count(),
            'partner_count' => \App\Models\Partner::count(),
            'logs' => $logs
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/settings/clear-cache",
     *     summary="Clear system cache",
     *     tags={"Settings"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Cache cleared",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function clearCache()
    {
        try {
            Artisan::call('optimize:clear');
            return response()->json(['message' => 'System cache cleared successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to clear cache.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/settings/download-logs",
     *     summary="Download system logs",
     *     tags={"Settings"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Log file download",
     *         @OA\MediaType(
     *             mediaType="application/octet-stream",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Log file not found")
     * )
     */
    public function downloadLogs()
    {
        $logFile = storage_path('logs/laravel.log');

        if (!file_exists($logFile)) {
            return response()->json(['message' => 'Log file not found.'], 404);
        }

        return response()->download($logFile);
    }

    /**
     * @OA\Get(
     *     path="/api/settings",
     *     summary="Get settings by group",
     *     tags={"Settings"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="group",
     *         in="query",
     *         description="Settings group (general, security, notification)",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Key-value settings",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     */
    public function getSettings(Request $request)
    {
        $group = $request->query('group');
        $query = Setting::query();
        
        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->get()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * @OA\Post(
     *     path="/api/settings",
     *     summary="Update settings",
     *     tags={"Settings"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="group", type="string", description="Settings group"),
     *             @OA\AdditionalProperties(type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Settings updated",
     *         @OA\JsonContent(@OA\Property(property="message", type="string"))
     *     )
     * )
     */
    public function updateSettings(Request $request)
    {
        $data = $request->all();
        $group = $request->input('group', 'general');

        // Remove group from data if it exists in the body mixed with settings
        unset($data['group']);

        foreach ($data as $key => $value) {
            // Check if value is boolean and convert to string '1' or '0' if needed, or keep as boolean for JSON
            // Since we use text column, we might want to cast to string. 
            // Better to json_encode arrays, and keep booleans as '1'/'0' or 'true'/'false'.
            // Let's stick to storing exactly what we get if possible, or stringify.
            
            // For boolean checkboxes:
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $group]
            );
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
