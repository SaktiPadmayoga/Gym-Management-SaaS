FROM postgres:16-alpine

# Install useful utilities
RUN apk add --no-cache \
    postgresql-contrib \
    pgbackrest

# Copy initialization script
COPY init/init.sql /docker-entrypoint-initdb.d/001-init.sql

# Expose PostgreSQL port
EXPOSE 5432

# Default command
CMD ["postgres"]