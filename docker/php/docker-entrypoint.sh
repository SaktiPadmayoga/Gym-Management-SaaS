#!/bin/sh
set -e

# Pastikan direktori storage Laravel ada (Docker volume mungkin kosong saat pertama di-mount)
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/logs

# Fix permissions
chown -R www-data:www-data /var/www/html/storage

echo "[entrypoint] Storage directories ensured."

# Jalankan command asli (php-fpm)
exec "$@"
