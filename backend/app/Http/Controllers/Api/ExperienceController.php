<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index()
    {
        return response()->json(Experience::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company'         => 'required|string|max:255',
            'role'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'location'        => 'nullable|string',
            'start_date'      => 'required|date',
            'end_date'        => 'nullable|date',
            'current'         => 'boolean',
            'tech_stack'      => 'nullable|array',
            'order'           => 'integer',
            'certificate_url' => 'nullable|string',
            'credential_link' => 'nullable|string',
            'timeline_order'  => 'integer|nullable',
            'milestone_year'  => 'string|nullable|max:50',
            'featured'        => 'boolean',
            'visual_layout'   => 'string|nullable|in:left-text,right-text,auto',
        ]);

        $validated['description'] = $validated['description'] ?? '';
        return response()->json(Experience::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $exp = Experience::findOrFail($id);
        $validated = $request->validate([
            'company'         => 'sometimes|string|max:255',
            'role'            => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'location'        => 'nullable|string',
            'start_date'      => 'sometimes|required|date',
            'end_date'        => 'nullable|date',
            'current'         => 'boolean',
            'tech_stack'      => 'nullable|array',
            'order'           => 'integer',
            'certificate_url' => 'nullable|string',
            'credential_link' => 'nullable|string',
            'timeline_order'  => 'integer|nullable',
            'milestone_year'  => 'string|nullable|max:50',
            'featured'        => 'boolean',
            'visual_layout'   => 'string|nullable|in:left-text,right-text,auto',
        ]);
        if (array_key_exists('description', $validated) && $validated['description'] === null) {
            $validated['description'] = '';
        }
        $exp->update($validated);
        return response()->json($exp);
    }

    public function destroy($id)
    {
        Experience::findOrFail($id)->delete();
        return response()->json(['message' => 'Experience deleted']);
    }
}
