FROM php:8.4-apache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y \
    libsqlite3-dev libpq-dev libonig-dev libxml2-dev unzip \
    && docker-php-ext-install pdo pdo_sqlite mbstring xml bcmath \
    && rm -rf /var/lib/apt/lists/*

RUN printf "file_uploads=On\nupload_max_filesize=120M\npost_max_size=120M\nmemory_limit=256M\n" > /usr/local/etc/php/conf.d/uploads.ini

RUN a2enmod rewrite

RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
    && sed -ri -e 's/AllowOverride none/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html
COPY backend/ /var/www/html/

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/var/data/database.sqlite
ENV LOG_CHANNEL=stdout

RUN composer install --no-dev --optimize-autoloader || true

RUN mkdir -p /var/data/storage /var/www/html/bootstrap/cache && \
    chmod -R 777 /var/data/storage /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/data/storage /var/www/html/bootstrap/cache

RUN chmod +x /var/www/html/docker-entrypoint.sh
CMD ["sh", "/var/www/html/docker-entrypoint.sh"]