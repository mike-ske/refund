#!/usr/bin/env bash
# One-time setup: builds backend/ (a full Laravel app) from the files in backend/, installs frontend/ packages.
set -e
cd "$(dirname "$0")"
command -v php >/dev/null || { echo "PHP 8.2+ is required (https://php.net)"; exit 1; }
command -v composer >/dev/null || { echo "Composer is required (https://getcomposer.org)"; exit 1; }
command -v npm >/dev/null || { echo "Node.js 20+ is required (https://nodejs.org)"; exit 1; }

if [ ! -f backend/artisan ]; then
  read -r -p "Admin email (you'll sign in at /admin/login): " ADMIN_EMAIL
  read -r -s -p "Admin password (8+ characters): " ADMIN_PASSWORD; echo
  read -r -p "MySQL host [127.0.0.1]: " DB_HOST; DB_HOST=${DB_HOST:-127.0.0.1}
  read -r -p "MySQL port [3306]: " DB_PORT; DB_PORT=${DB_PORT:-3306}
  read -r -p "MySQL database (create it first) [allocationdb]: " DB_DATABASE; DB_DATABASE=${DB_DATABASE:-allocationdb}
  read -r -p "MySQL username [root]: " DB_USERNAME; DB_USERNAME=${DB_USERNAME:-root}
  read -r -s -p "MySQL password: " DB_PASSWORD; echo
  mv backend backend-overlay
  composer create-project laravel/laravel backend --no-interaction
  (cd backend && php artisan install:api --no-interaction)
  cp -R backend-overlay/. backend/            # our files go on top of the fresh Laravel app
  rm -rf backend-overlay
  cat backend/env.additions >> backend/.env && rm backend/env.additions
  printf '\nDB_CONNECTION=mysql\nDB_HOST=%s\nDB_PORT=%s\nDB_DATABASE=%s\nDB_USERNAME=%s\nDB_PASSWORD=%s\nADMIN_EMAIL=%s\nADMIN_PASSWORD=%s\n' "$DB_HOST" "$DB_PORT" "$DB_DATABASE" "$DB_USERNAME" "$DB_PASSWORD" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" >> backend/.env
  (cd backend && php artisan migrate --force && php artisan db:seed --force)
fi
(cd frontend && npm install --no-audit --no-fund)
echo; echo "Done. Start both servers with:  ./dev.sh"
echo "Site: http://localhost:5173   Admin: http://localhost:5173/admin/login"
