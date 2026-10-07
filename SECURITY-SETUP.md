# Deployment follow-up

Local `.env` files remain on disk but are no longer tracked by Git. Docker builds exclude environment files. Set deployment secrets in the hosting service or shell environment; do not commit them.

Previously committed secrets remain in Git history. Before deploying, replace the exposed JWT secret, application keys, and AI provider key wherever those values were used. Revoke the old AI key with its provider. JWT rotation signs all users out. Plan APP_KEY rotation carefully if existing encrypted data must remain readable.

- Generate a fresh Laravel key with `php artisan key:generate --show` and save it as `APP_KEY` in your hosting environment.
- Generate a JWT secret with `php artisan jwt:secret --show` and save it as `JWT_SECRET`.
- Docker Compose now requires both values from the shell or a root `.env` file. Render prompts for them instead of shipping a shared key.
- Create the first admin with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `php artisan db:seed --force`. Seeding preserves an existing user's password. Public registration is disabled.

## Recover the failed GitHub Actions deployment

The failed run removed `backend-api` before Compose rejected missing secrets. It did not issue a named-volume deletion. Verify and back up the existing database/uploads volumes on the server before restarting; this repository alone cannot confirm their contents.

1. In the repository's **Settings → Secrets and variables → Actions**, add repository secrets named `APP_KEY` and `JWT_SECRET`. Use the existing application key for recovery if encrypted data must remain readable; plan its rotation separately. Use a fresh JWT secret (existing sessions will need to log in again). Do not paste either value into chat or commit it.
2. Check `backend/.env` on the server. The earlier Git reset may have removed the formerly tracked file. Restore any needed mail, AI, and other settings from a private backup. The updated workflow preserves an existing backend environment file across future source resets; it cannot recover one already lost.
3. Commit/push the workflow and Dockerfile fixes, then run the workflow from that updated commit. Re-running the old failed job uses the old workflow.

The updated workflow passes secrets explicitly to SSH and Compose using a private temporary env file. Missing secrets stop deployment before source updates or container removal. Compose validation and image building finish before container replacement. Existing named volumes are retained. Docker build dependency failures now fail the build.

No live credentials were rotated and no server recovery or deployment was performed by these local changes.
