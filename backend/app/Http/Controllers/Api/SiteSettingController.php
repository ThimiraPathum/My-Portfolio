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
        return response()->json(SiteSetting::allAsMap());
    }

    // Admin: bulk update settings
    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        SiteSetting::setMany($data['settings']);

        return response()->json(['message' => 'Settings updated', 'settings' => SiteSetting::allAsMap()]);
    }
}
