#!/bin/sh
set -eu

DB_PATH="${DB_DATABASE:-/var/data/database.sqlite}"
STORAGE_PATH="${LARAVEL_STORAGE_PATH:-/var/data/storage}"
PORT_VALUE="${PORT:-80}"

mkdir -p "$(dirname "$DB_PATH")"
mkdir -p \
  "$STORAGE_PATH/app/public" \
  "$STORAGE_PATH/app/private" \
  "$STORAGE_PATH/framework/cache/data" \
  "$STORAGE_PATH/framework/sessions" \
  "$STORAGE_PATH/framework/views" \
  /app/bootstrap/cache

touch "$DB_PATH"

sed -i "s/Listen 80/Listen ${PORT_VALUE}/g" /etc/apache2/ports.conf
sed -i "s/:80/:${PORT_VALUE}/g" /etc/apache2/sites-available/000-default.conf

php artisan config:clear
php artisan migrate --force --seed
php artisan storage:link || true

chown -R www-data:www-data "$STORAGE_PATH" /app/bootstrap/cache "$(dirname "$DB_PATH")"

exec apache2-foreground
