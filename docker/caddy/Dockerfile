# Build custom Caddy with Cloudflare DNS plugin
# Plugin ini diperlukan agar Caddy bisa DNS challenge untuk wildcard SSL
FROM caddy:2-builder-alpine AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare

FROM caddy:2-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

EXPOSE 80 443
