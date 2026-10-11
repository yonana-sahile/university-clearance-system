#!/bin/sh
set -e

echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  sleep 1
done
echo "✅ Database is up."

echo "🛠️  Running migrations..."
python manage.py migrate --noinput

echo "🌱 Seeding data (safe to re-run)..."
python manage.py seed_data || true

echo "🚀 Starting server: $@"
exec "$@"
