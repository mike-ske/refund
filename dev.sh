#!/usr/bin/env bash
# Starts the API (port 8000) and the website (port 5173). Ctrl+C stops both.
cd "$(dirname "$0")"
trap 'kill 0' INT TERM EXIT
(cd backend && php artisan serve --port=8000) &
(cd frontend && npm run dev) &
wait
