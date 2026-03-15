FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    curl git zip unzip libpq-dev libsqlite3-dev libxml2-dev libonig-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql pdo_sqlite mbstring xml bcmath

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN a2enmod rewrite

# Set working directory
WORKDIR /app

# Copy .env FIRST as requested
COPY backend/.env /app/.env

# Copy remaining backend files
COPY backend/ /app/

# Set Apache document root to Laravel's public folder
ENV APACHE_DOCUMENT_ROOT /app/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set environment variables directly to override any cached .env
ENV APP_ENV=production
ENV APP_DEBUG=true
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/database/database.sqlite
ENV LOG_CHANNEL=stdout
ENV APP_KEY=base64:V29Tfl5/5HTDXIqn2DPaOMvt/m3C6wq/gsfkKgbVaDk=
ENV JWT_SECRET=GtMNiJzftWTGFxN009IIl9pLm74woAZfjBcvMEIIT

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Final Permissions fix
RUN mkdir -p /app/database /app/storage /app/bootstrap/cache && \
    chmod -R 777 /app/database /app/storage /app/bootstrap/cache && \
    chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/database

# Start Apache with runtime port substitution, config clearing, and automated migrations
CMD ["sh", "-c", "sed -i \"s/Listen 80/Listen ${PORT:-80}/g\" /etc/apache2/ports.conf && sed -i \"s/:80/:${PORT:-80}/g\" /etc/apache2/sites-available/000-default.conf && php artisan config:clear && php artisan migrate --force --seed && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/database && apache2-foreground"]
