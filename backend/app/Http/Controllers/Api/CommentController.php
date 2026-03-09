<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // Public: post a comment (saved as unapproved)
    public function store(Request $request, $blogId)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email',
            'body'    => 'required|string|max:2000',
        ]);

        $comment = Comment::create([
            ...$validated,
            'blog_id'  => $blogId,
            'approved' => false,
        ]);

        return response()->json(['message' => 'Comment submitted and awaiting approval.', 'data' => $comment], 201);
    }

    // Admin: list all comments for a blog
    public function index($blogId)
    {
        return response()->json(
            Comment::where('blog_id', $blogId)->orderBy('created_at', 'desc')->get()
        );
    }

    // Admin: list ALL comments across all posts
    public function all()
    {
        return response()->json(
            Comment::with('blog:id,title,slug')->orderBy('created_at', 'desc')->get()
        );
    }

    // Admin: approve
    public function approve($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['approved' => true]);
        return response()->json($comment);
    }

    // Admin: delete
    public function destroy($id)
    {
        Comment::findOrFail($id)->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
