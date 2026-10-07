<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Support\TechnologyNames;
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

    public function derivedFromProjects()
    {
        $projects = \App\Models\Project::all(['id', 'title', 'tech_stack']);
        
        $skillMap = [];
        
        foreach ($projects as $project) {
            $techs = $project->tech_stack ?? [];
            foreach ($techs as $tech) {
                if (!is_string($tech)) continue;
                foreach (TechnologyNames::expand($tech) as $name) {
                    $key = mb_strtolower($name);
                    if (!isset($skillMap[$key])) {
                        $skillMap[$key] = ['name' => $name, 'used_in' => []];
                    }
                    // Multiple aliases in one project must count only once.
                    $skillMap[$key]['used_in'][$project->id] = [
                        'id' => $project->id,
                        'title' => $project->title,
                    ];
                }
            }
        }
        
        $skills = array_map(function ($skill) {
            $skill['used_in'] = array_values($skill['used_in']);
            return $skill;
        }, array_values($skillMap));
        usort($skills, fn($a, $b) => (count($b['used_in']) <=> count($a['used_in'])) ?: strcasecmp($a['name'], $b['name']));
        
        return response()->json($skills);
    }
}
