FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    curl git zip unzip libpq-dev libsqlite3-dev libxml2-dev libonig-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql pdo_sqlite mbstring xml bcmath

RUN printf "file_uploads=On\nupload_max_filesize=120M\npost_max_size=120M\nmemory_limit=256M\nmax_file_uploads=20\n" > /usr/local/etc/php/conf.d/uploads.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN a2enmod rewrite

WORKDIR /app

COPY backend/ /app/

ENV APACHE_DOCUMENT_ROOT /app/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/var/data/database.sqlite
ENV LARAVEL_STORAGE_PATH=/var/data/storage
ENV LOG_CHANNEL=stdout

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p /var/data/storage /app/bootstrap/cache && \
    chmod -R 777 /var/data/storage /app/bootstrap/cache && \
    chown -R www-data:www-data /var/data/storage /app/bootstrap/cache

RUN chmod +x /app/docker-entrypoint.sh

CMD ["sh", "/app/docker-entrypoint.sh"]