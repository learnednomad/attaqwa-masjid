#!/bin/sh

echo "Starting Masjid At-Taqwa Platform..."

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  cd /app/packages/db && npx prisma migrate deploy
fi

# Start supervisord to manage both services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf