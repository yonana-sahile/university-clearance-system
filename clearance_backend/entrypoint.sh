#!/bin/sh
set -e

if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "db" ] || [ -z "$DB_HOST" ]; then
  echo "ℹ️  Remote database detected — skipping local wait."
else
  echo "⏳ Waiting for local database at $DB_HOST:$DB_PORT..."
  while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    sleep 1
  done
  echo "✅ Database is up."
fi

echo "🛠️  Running migrations..."
python manage.py migrate --noinput

echo "🌱 Seeding data (safe to re-run)..."
python manage.py seed_data || true

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput || true

echo "🚀 Starting server: $@"
exec "$@"
