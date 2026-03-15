FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    curl git zip unzip libpq-dev libsqlite3-dev libxml2-dev libonig-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql pdo_sqlite mbstring xml bcmath

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration to use the PORT environment variable at runtime
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:${PORT}/g' /etc/apache2/sites-available/000-default.conf

WORKDIR /app

COPY backend/ /app/

# Set Apache document root to Laravel's public folder
ENV APACHE_DOCUMENT_ROOT /app/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p /app/database /app/storage /app/bootstrap/cache && \
    chmod -R 777 /app/database /app/storage /app/bootstrap/cache && \
    chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/database

# Start Apache with runtime port substitution and automated migrations
CMD ["sh", "-c", "sed -i \"s/Listen 80/Listen ${PORT:-80}/g\" /etc/apache2/ports.conf && sed -i \"s/:80/:${PORT:-80}/g\" /etc/apache2/sites-available/000-default.conf && php artisan migrate --force --seed && apache2-foreground"]
