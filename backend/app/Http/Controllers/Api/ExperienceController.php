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
            'company'    => 'required|string|max:255',
            'role'       => 'required|string|max:255',
            'description'=> 'required|string',
            'location'   => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
            'current'    => 'boolean',
            'tech_stack' => 'nullable|array',
            'order'      => 'integer',
        ]);

        return response()->json(Experience::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $exp = Experience::findOrFail($id);
        $exp->update($request->all());
        return response()->json($exp);
    }

    public function destroy($id)
    {
        Experience::findOrFail($id)->delete();
        return response()->json(['message' => 'Experience deleted']);
    }
}
