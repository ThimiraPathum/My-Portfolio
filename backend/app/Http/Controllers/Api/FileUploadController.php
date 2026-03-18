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
            $disk = config('filesystems.default', 'public');
            $type = $request->input('type', 'image');
            $uploadedFile = $request->file('file');
            $contentLength = (int) $request->server('CONTENT_LENGTH', 0);
            $postMaxSizeBytes = $this->toBytes((string) ini_get('post_max_size'));
            
            // Log only metadata that does not force Symfony to read the temp file path.
            Log::info('Upload Request Received', [
                'type' => $type,
                'has_file' => $request->hasFile('file'),
                'file_name' => $uploadedFile?->getClientOriginalName(),
                'file_client_mime' => $uploadedFile?->getClientMimeType(),
                'file_size' => $uploadedFile?->getSize(),
                'file_error' => $uploadedFile?->getError(),
                'file_is_valid' => $uploadedFile?->isValid(),
                'content_length' => $contentLength,
                'post_max_size' => ini_get('post_max_size'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'disk' => $disk,
            ]);

            if ($contentLength > 0 && $postMaxSizeBytes > 0 && $contentLength > $postMaxSizeBytes) {
                return response()->json([
                    'message' => 'The uploaded payload exceeds the server post_max_size limit.',
                    'errors' => [
                        'file' => [
                            'The uploaded payload exceeds the server post_max_size limit.'
                        ]
                    ]
                ], 422);
            }

            if (!$request->hasFile('file')) {
                return response()->json([
                    'message' => 'No file found in request payload.',
                    'errors' => ['file' => ['No file found in request payload']]
                ], 422);
            }

            if (!$uploadedFile || !$uploadedFile->isValid()) {
                $errorMessage = match ($uploadedFile?->getError()) {
                    UPLOAD_ERR_INI_SIZE => 'The file exceeds the server upload_max_filesize limit.',
                    UPLOAD_ERR_FORM_SIZE => 'The file exceeds the form upload size limit.',
                    UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded.',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                    UPLOAD_ERR_NO_TMP_DIR => 'The server is missing a temporary upload directory.',
                    UPLOAD_ERR_CANT_WRITE => 'The server could not write the uploaded file to disk.',
                    UPLOAD_ERR_EXTENSION => 'A server extension stopped the file upload.',
                    default => 'The uploaded file is invalid or incomplete.',
                };

                return response()->json([
                    'message' => $errorMessage,
                    'errors' => ['file' => [$errorMessage]]
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

            $validator = \Illuminate\Support\Facades\Validator::make(
                array_merge($request->all(), ['file' => $uploadedFile]),
                $rules
            );

            if ($validator->fails()) {
                Log::warning('Upload validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $uploadedFile;
            $folder = 'images';
            if ($type === 'video') $folder = 'videos';
            if ($type === 'document') $folder = 'documents';
            
            $path = $file->store("uploads/{$folder}", $disk);

            if (!$path) {
                throw new \Exception('Disk storage failed - check directory permissions');
            }

            return response()->json([
                'url'  => $this->buildFileUrl($disk, $path),
                'path' => $path,
                'disk' => $disk,
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
        Storage::disk(config('filesystems.default', 'public'))->delete($request->path);
        return response()->json(['message' => 'File deleted']);
    }

    private function buildFileUrl(string $disk, string $path): string
    {
        if ($disk === 'public') {
            return '/storage/' . ltrim($path, '/');
        }

        return Storage::disk($disk)->url($path);
    }

    private function toBytes(string $value): int
    {
        $value = trim($value);
        if ($value === '') {
            return 0;
        }

        $number = (int) $value;
        $unit = strtolower(substr($value, -1));

        return match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
