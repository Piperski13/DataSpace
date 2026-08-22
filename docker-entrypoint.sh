#!/bin/sh

set -e

echo "Running database migrations..."
npm run db:migrate

echo "Seeding database..."
npm run db:seed

echo "Starting DataSpace..."
exec npm start