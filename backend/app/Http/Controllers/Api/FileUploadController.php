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
        try {
            $type = $request->input('type', 'image');
            
            // Log entry
            Log::info('Upload Request Received', [
                'type' => $type,
                'has_file' => $request->hasFile('file'),
                'file_name' => $request->file('file')?->getClientOriginalName(),
                'file_mime' => $request->file('file')?->getMimeType(),
                'file_size' => $request->file('file')?->getSize(),
            ]);

            if (!$request->hasFile('file')) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => ['file' => ['No file found in request payload']]
                ], 422);
            }

            // Define rules based on type
            $rules = [
                'type' => 'nullable|string|in:image,video,document',
            ];

            if ($type === 'video') {
                // More permissive for videos
                $rules['file'] = 'required|file|max:102400'; 
            } elseif ($type === 'document') {
                $rules['file'] = 'required|file|max:20480|mimes:pdf,doc,docx,txt,zip';
            } else {
                // Use 'image' rule - it's more robust than specifying mimes manually
                $rules['file'] = 'required|image|max:15360'; 
            }

            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                Log::warning('Upload validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $folder = 'images';
            if ($type === 'video') $folder = 'videos';
            if ($type === 'document') $folder = 'documents';
            
            // Use 'public' disk. Ensure storage:link is run on the server if possible.
            $path = $file->store("uploads/{$folder}", 'public');

            if (!$path) {
                throw new \Exception('Disk storage failed - check directory permissions');
            }

            return response()->json([
                'url'  => Storage::disk('public')->url($path),
                'path' => $path,
            ]);

        } catch (\Exception $e) {
            Log::error('Critical Upload Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage(),
                'error_type' => get_class($e)
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        $request->validate(['path' => 'required|string']);
        Storage::disk('public')->delete($request->path);
        return response()->json(['message' => 'File deleted']);
    }
}
