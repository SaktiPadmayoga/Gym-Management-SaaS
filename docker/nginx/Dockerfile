FROM nginx:1.26-alpine

# Copy custom nginx configuration
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose port HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]