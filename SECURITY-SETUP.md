# Deployment follow-up

Local `.env` files remain on disk but are no longer tracked by Git. Docker builds exclude environment files. Set deployment secrets in the hosting service or shell environment; do not commit them.

Previously committed secrets remain in Git history. Before deploying, replace the exposed JWT secret, application keys, and AI provider key wherever those values were used. Revoke the old AI key with its provider. JWT rotation signs all users out. Plan APP_KEY rotation carefully if existing encrypted data must remain readable.

- Generate a fresh Laravel key with `php artisan key:generate --show` and save it as `APP_KEY` in your hosting environment.
- Generate a JWT secret with `php artisan jwt:secret --show` and save it as `JWT_SECRET`.
- Docker Compose now requires both values from the shell or a root `.env` file. Render prompts for them instead of shipping a shared key.
- Create the first admin with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `php artisan db:seed --force`. Seeding preserves an existing user's password. Public registration is disabled.

No live credentials were rotated and no deployment was performed as part of these local changes.
