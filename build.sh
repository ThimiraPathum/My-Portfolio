#!/bin/bash
cd backend
composer install --optimize-autoloader
php artisan config:cache
