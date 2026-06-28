FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    gd \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy source code ke dalam image
COPY src/ .

# Buat struktur direktori yang dibutuhkan oleh Laravel (karena diabaikan oleh Git)
RUN mkdir -p bootstrap/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache

# Install PHP dependencies menggunakan Composer (menggunakan --prefer-source untuk menghindari error unduhan zip GitHub)
RUN composer install --no-interaction --optimize-autoloader --no-dev --prefer-source

# Fix permissions untuk www-data
RUN chown -R www-data:www-data /var/www/html

# Entrypoint script — memastikan storage directories exist setelah volume di-mount
COPY docker/php/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]