<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,webm',
            'type' => 'nullable|string|in:image,video',
        ]);

        $file = $request->file('file');
        $folder = $request->input('type', 'image') === 'video' ? 'videos' : 'images';
        $path = $file->store("uploads/{$folder}", 'public');

        return response()->json([
            'url'  => Storage::url($path),
            'path' => $path,
        ]);
    }

    public function delete(Request $request)
    {
        $request->validate(['path' => 'required|string']);
        Storage::disk('public')->delete($request->path);
        return response()->json(['message' => 'File deleted']);
    }
}
