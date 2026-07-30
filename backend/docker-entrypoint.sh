#!/bin/sh
set -e

DB_PATH="${DB_DATABASE:-/var/data/database.sqlite}"
STORAGE_PATH="${LARAVEL_STORAGE_PATH:-/var/data/storage}"
PORT_VALUE="${PORT:-80}"
DOC_ROOT="${APACHE_DOCUMENT_ROOT:-/var/www/html/public}"

mkdir -p "$(dirname "$DB_PATH")"
mkdir -p \
  "$STORAGE_PATH/app/public" \
  "$STORAGE_PATH/app/private" \
  "$STORAGE_PATH/framework/cache/data" \
  "$STORAGE_PATH/framework/sessions" \
  "$STORAGE_PATH/framework/views" \
  /var/www/html/bootstrap/cache 2>/dev/null || true

touch "$DB_PATH"

if [ -f "/etc/apache2/sites-available/000-default.conf" ]; then
    sed -i "s!DocumentRoot .*!DocumentRoot ${DOC_ROOT}!g" /etc/apache2/sites-available/000-default.conf
    sed -i "s/Listen 80/Listen ${PORT_VALUE}/g" /etc/apache2/ports.conf 2>/dev/null || true
    sed -i "s/:80/:${PORT_VALUE}/g" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true
fi

cd /var/www/html 2>/dev/null || cd /app 2>/dev/null || true

if [ ! -d "vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --prefer-dist
fi

php artisan config:clear || true
php artisan migrate --force --seed || true
php artisan storage:link || true

chown -R www-data:www-data "$STORAGE_PATH" bootstrap/cache "$(dirname "$DB_PATH")" 2>/dev/null || true

exec apache2-foreground
