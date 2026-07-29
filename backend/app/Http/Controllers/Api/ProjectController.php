<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return response()->json(Project::orderBy('order')->get());
    }

    public function show($id)
    {
        return response()->json(Project::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'image_url'      => 'nullable|string',
            'gallery'        => 'nullable|array',
            'video_url'      => 'nullable|string',
            'tech_stack'     => 'nullable|array',
            'github_url'     => 'nullable|string',
            'live_url'       => 'nullable|string',
            'category'       => 'nullable|string',
            'featured'       => 'boolean',
            'coming_soon'    => 'boolean',
            'order'          => 'integer',
            'timeline_order' => 'integer|nullable',
            'milestone_year' => 'string|nullable|max:50',
            'visual_layout'  => 'string|nullable|in:left-text,right-text,auto',
        ]);

        $project = Project::create($validated);
        return response()->json($project, 201);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->all());
        return response()->json($project);
    }

    public function destroy($id)
    {
        Project::findOrFail($id)->delete();
        return response()->json(['message' => 'Project deleted']);
    }
}
