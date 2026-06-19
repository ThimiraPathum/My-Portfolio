<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index()
    {
        return response()->json(Skill::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'level'    => 'integer|min:0|max:100',
            'icon'     => 'nullable|string',
            'order'    => 'integer',
        ]);

        return response()->json(Skill::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $skill = Skill::findOrFail($id);
        $skill->update($request->all());
        return response()->json($skill);
    }

    public function destroy($id)
    {
        Skill::findOrFail($id)->delete();
        return response()->json(['message' => 'Skill deleted']);
    }
}
