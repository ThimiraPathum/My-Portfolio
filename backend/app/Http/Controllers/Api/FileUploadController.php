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
        $type = $request->input('type', 'image');
        
        Log::debug('Upload attempt:', [
            'has_file' => $request->hasFile('file'),
            'type_sent' => $type,
            'mime' => $request->file('file')?->getMimeType(),
            'ext' => $request->file('file')?->getClientOriginalExtension(),
            'size' => $request->file('file')?->getSize(),
        ]);

        // Define base rules
        $rules = [
            'file' => 'required|file',
            'type' => 'nullable|string|in:image,video,document',
        ];

        // Refine rules based on type to be more robust
        if ($type === 'video') {
            $rules['file'] .= '|max:102400|mimes:mp4,mov,avi,webm,m4v'; // 100MB for video
        } elseif ($type === 'document') {
            $rules['file'] .= '|max:20480|mimes:pdf,doc,docx,txt'; // 20MB for docs
        } else {
            // Default to image
            $rules['file'] .= '|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,bmp'; // 10MB for images
        }

        try {
            $request->validate($rules);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Upload validation failed:', [
                'errors' => $e->errors(),
                'request_type' => $type,
                'file_info' => [
                    'mime' => $request->file('file')?->getMimeType(),
                    'ext' => $request->file('file')?->getClientOriginalExtension(),
                ]
            ]);
            throw $e;
        }

        $file = $request->file('file');
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
