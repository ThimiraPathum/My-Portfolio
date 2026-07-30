<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // Public: list published blogs
    public function index()
    {
        $blogs = Blog::where('status', 'published')
            ->orWhere('coming_soon', true)
            ->orderByRaw('COALESCE(published_at, created_at) DESC')
            ->get(['id','title','slug','excerpt','content','cover_image','status','coming_soon','published_at','created_at']);

        return response()->json($blogs);
    }

    // Public: show single blog with approved comments
    public function show($slug)
    {
        $blog = Blog::where('slug', $slug)
            ->with(['comments' => fn($q) => $q->where('approved', true)->orderBy('created_at')])
            ->firstOrFail();
        return response()->json($blog);
    }

    // Admin: list all (including drafts)
    public function adminIndex()
    {
        return response()->json(Blog::orderBy('created_at', 'desc')->get());
    }

    // Admin: create
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'excerpt'     => 'nullable|string',
            'content'     => 'nullable|string',
            'cover_image' => 'nullable|string',
            'status'      => 'in:draft,published',
            'coming_soon' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $blog = Blog::create($validated);
        return response()->json($blog, 201);
    }

    // Admin: update
    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'excerpt'     => 'nullable|string',
            'content'     => 'nullable|string',
            'cover_image' => 'nullable|string',
            'status'      => 'nullable|string|in:draft,published',
            'coming_soon' => 'nullable|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $blog->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $blog->update($validated);
        return response()->json($blog);
    }

    // Admin: delete
    public function destroy($id)
    {
        Blog::findOrFail($id)->delete();
        return response()->json(['message' => 'Blog deleted']);
    }
}
