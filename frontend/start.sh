#!/bin/sh
set -e

# Replace PORT in nginx config
sed -i "s/\${PORT}/${PORT:-80}/g" /etc/nginx/conf.d/default.conf

echo "Starting nginx on port ${PORT:-80}"
exec nginx -g 'daemon off;'
