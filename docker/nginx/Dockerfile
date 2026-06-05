FROM nginx:1.26-alpine

# Copy custom nginx configuration
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy public assets dari Laravel
COPY src/public /var/www/html/public

# Expose port HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]