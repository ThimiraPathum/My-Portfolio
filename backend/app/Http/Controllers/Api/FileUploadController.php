<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        Log::debug('Upload attempt:', [
            'has_file' => $request->hasFile('file'),
            'mime' => $request->file('file')?->getMimeType(),
            'ext' => $request->file('file')?->getClientOriginalExtension(),
            'size' => $request->file('file')?->getSize(),
        ]);

        $request->validate([
            'file' => 'required|file|max:51200|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,webm,pdf',
            'type' => 'nullable|string|in:image,video,document',
        ]);

        $file = $request->file('file');
        $type = $request->input('type', 'image');
        $folder = 'images';
        if ($type === 'video') $folder = 'videos';
        if ($type === 'document') $folder = 'documents';
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
