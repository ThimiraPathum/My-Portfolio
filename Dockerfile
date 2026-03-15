FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    curl \
    git \
    zip \
    unzip \
    libpq-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql pdo_sqlite

WORKDIR /app

COPY backend/ /app/

RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
