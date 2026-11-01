# Allocation Refund Program

    refund/
      backend/    Laravel API (Sanctum tokens, MySQL, mail)
      frontend/   React + Vite + Tailwind website (applicants + staff)
      setup.sh    one-time setup      dev.sh   run both locally

## Run locally (Mac / Linux; needs PHP 8.2+, Composer, Node 20+, and MySQL)
    ./setup.sh     # asks for your admin email + password, builds backend/, installs frontend/
    ./dev.sh       # API on :8000, site on :5173
Application form: http://localhost:5173/apply · Staff: http://localhost:5173/admin/login
Locally, emails are written to `backend/storage/logs/laravel.log` instead of being sent.
(On Windows, run the commands inside setup.sh by hand, or use WSL.)

## Two roles, separate logins
- **User (applicant):** account login and registration remain available through `POST /api/login` and `POST /api/register`; applicant submissions can also be made directly through the public form.
- **Admin (staff):** `POST /api/admin/login` → dashboard, applications, users, payouts, email templates/logs, reports, and settings.
Every admin API endpoint is protected by Sanctum and the admin role. Public endpoints include `GET /api/program`, `POST /api/applications`, `POST /api/contact`, and `POST /api/status` (reference + email).

## Before going live
1. Create a MySQL database and configure its connection in `backend/.env`. Set PROGRAM_OPERATOR, PROGRAM_EMAIL, PROGRAM_PHONE (the site shows only what you set), SMTP settings, APP_ENV=production, APP_DEBUG=false, APP_URL=https://api.yourdomain.com, FRONTEND_URL=https://yourdomain.com (this also controls CORS).
2. `frontend/.env`: `VITE_API_URL=https://api.yourdomain.com/api`, then `npm run build` and upload the contents of `frontend/dist/` to the site root (`.htaccess` is included for cPanel/Apache).
3. Backend on a subdomain with its document root at `backend/public`; run `php artisan migrate --force`, `php artisan config:cache`.
4. Optional hero photo: save as `frontend/public/hero.jpg`.

## Admin portal

The staff portal uses one responsive admin layout across Dashboard, Applications, Users, Payouts, Emails, Reports, and Settings. All seven sections read and write through authenticated `/api/admin/*` endpoints. Customer service messages are available from the Dashboard.

### Configure and initialize

1. Set the MySQL connection, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, and mail settings in `backend/.env`. `FRONTEND_URL` controls allowed API origins.
2. Set `VITE_API_URL=http://localhost:8000/api` in `frontend/.env` for local development (or your deployed API base URL).
3. Apply the schema and initialize admin templates/settings:

   ```sh
   cd backend
   php artisan migrate --force
   php artisan db:seed --force
   ```

4. Optional local-only sample applicant records:

   ```sh
   php artisan db:seed --class=DemoApplicationSeeder
   ```

5. Run the frontend and API with `../dev.sh`, or separately with `php artisan serve` and `npm run dev`.

The Users menu manages applicant accounts and includes a 15-second quiet refresh. Deleting an applicant with linked applications requires either suspending the account or confirming anonymization. Email templates support `{{name}}`, `{{reference}}`, `{{status}}`, and `{{message}}`. Every admin change is recorded in the activity log.
# refund
