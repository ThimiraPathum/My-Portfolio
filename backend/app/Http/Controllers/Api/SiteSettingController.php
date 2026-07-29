<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    // Public: get all settings as key→value map
    public function index()
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('site_settings')) {
            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            } catch (\Throwable $e) {
                // Ignore error and serve defaults
            }
        }
        return response()->json(SiteSetting::allAsMap());
    }

    // Admin: bulk or flat update settings
    public function update(Request $request)
    {
        $payload = $request->input('settings', $request->all());

        if (!is_array($payload)) {
            return response()->json(['message' => 'Invalid settings payload format.'], 422);
        }

        // Filter valid setting key-value pairs
        $settingsToUpdate = [];
        foreach ($payload as $key => $value) {
            if (is_string($key) && (is_string($value) || is_null($value))) {
                $settingsToUpdate[$key] = $value;
            }
        }

        SiteSetting::setMany($settingsToUpdate);

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => SiteSetting::allAsMap()
        ]);
    }

    // Admin: update a single setting key
    public function updateSingle(Request $request, string $key)
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
        ]);

        SiteSetting::setMany([$key => $validated['value'] ?? '']);

        return response()->json([
            'message' => "Setting '{$key}' updated successfully",
            'key' => $key,
            'value' => SiteSetting::get($key),
            'settings' => SiteSetting::allAsMap()
        ]);
    }
}
