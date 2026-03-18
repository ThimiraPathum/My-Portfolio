# Portfolio Deployment Notes

The disappearing photos are caused by deployment storage, not the React UI.

This backend uploads files to Laravel's local filesystem and currently uses SQLite. On Render, any data written inside the running container is ephemeral. When the service restarts or redeploys, local uploads and a local SQLite database can be reset.

## What Changed

- The Docker image now supports moving SQLite and Laravel storage to external paths with `DB_DATABASE` and `LARAVEL_STORAGE_PATH`.
- New uploads now save a stable media path instead of an absolute Render URL with a cache-busting query string.
- The upload controller now uses the configured filesystem disk, so media can be moved off local storage later without controller changes.

## Recovery

If the files already disappeared from Render, the service cannot recover them by itself. You need one of these:

- Re-upload the original images from your computer.
- Restore them from a backup.
- Copy them from a local development folder if you still have them, such as `backend/storage/app/public/uploads`.

## Prevent It Again

### Option 1: Stay on Render Free

Recommended:

- Use Render Postgres instead of SQLite.
- Use an external object store for uploads, such as an S3-compatible bucket.
- Set `FILESYSTEM_DISK=s3` plus the matching AWS/S3 environment variables in Render.

### Option 2: Upgrade Render and Use a Persistent Disk

If you move to a paid Render service with disk support, use:

- `DB_DATABASE=/var/data/database.sqlite`
- `LARAVEL_STORAGE_PATH=/var/data/storage`

and mount the disk at `/var/data`.
