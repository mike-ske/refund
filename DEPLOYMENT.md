# Production deployment

This project is prepared for three HTTPS hosts:

- API: `api.allocationrefundprogram.com`
- Main website: `allocationrefundprogram.com`
- Admin website: `app.allocationrefundprogram.com`

The requested public-site address `allcoationrefundprogram.com` is spelled differently from the main domain. The CORS configuration allows both spellings; add the misspelled domain as an alias of the main site in your hosting panel if you want it to open the same frontend. Set the canonical site address to `allocationrefundprogram.com`.

## 1. Configure DNS and HTTPS

At your DNS provider, point the root domain and the `api` and `app` subdomains to the hosting account using the records supplied by your host. Add `allcoationrefundprogram.com` as an alias if that address is also required. Enable and verify HTTPS certificates for every address before switching the production frontend build live.

## 2. Create the MySQL database

In cPanel **MySQL Databases**, create the production database and database user, then grant that user all privileges on that database. Use the exact database name, username, password, and host shown by cPanel; shared hosts often add an account prefix to the first two values.

The production template is [backend/.env.production.example](backend/.env.production.example). Copy it to `backend/.env` on the server, fill in the real database and mail values, and set a unique production admin email and password. Generate a new `APP_KEY` on the server with `php artisan key:generate --force`. Keep `.env` outside every public document root and never upload it into `backend/public`.

## 3. Build and install the Laravel API

Upload the `backend` source to a private directory. Point the `api` subdomain document root directly at that install's `public` directory. Do not point it at the backend project root. The host must provide PHP 8.3 or newer and the extensions required by Composer, including PDO MySQL, OpenSSL, Mbstring, Tokenizer, XML, and Ctype.

Using cPanel Terminal or SSH in the backend directory, install production dependencies:

```sh
composer install --no-dev --optimize-autoloader --no-interaction
```

Make `storage` and `bootstrap/cache` writable by PHP. Initialize the database using **one** of the following paths.

### Empty production database

Run migrations and create the configured admin and program email/settings records without synthetic demo applicants:

```sh
php artisan migrate --force
php artisan db:seed --class=AdminSeeder --force
php artisan db:seed --class=AdminPortalSeeder --force
```

### Import existing records

If the production site must start with the current local applicants and demo accounts, make a protected MySQL backup and import it into the empty hosting database **before** running migrations. Keep the backup outside the web root and remove it from the server after import. For example, from a trusted terminal:

```sh
mysqldump -u LOCAL_DB_USER -p --single-transaction --no-tablespaces LOCAL_DB_NAME > /secure/path/allocation-refund.sql
mysql -h CPANEL_DB_HOST -u CPANEL_DB_USER -p CPANEL_DB_NAME < /secure/path/allocation-refund.sql
```

The import includes the migrations table and application records. Then run `php artisan migrate --force` on the server to apply any newer migrations. Run the two seed commands above to create or reset the configured production admin and initialize templates/settings. Create and verify a unique production admin, then deactivate demo admin accounts before opening the admin portal publicly. Do not run the full `DatabaseSeeder` in production; it creates 120 synthetic demo users.

For a host without Composer or SSH, run `composer install --no-dev --optimize-autoloader` locally using a compatible PHP version, then upload the resulting `vendor` directory too. Do not upload local `.env` files, database files, tests, or development secrets.

After editing `.env` and initializing the database, cache the production configuration:

```sh
php artisan config:cache
php artisan route:cache
```

Configure your provider's SMTP credentials in `.env` before relying on application and status emails. The production template uses SMTP over TLS on port 465; change the scheme and port if your mail provider specifies different settings.

## 4. Build and upload both frontends

The production API URL is set in [frontend/.env.production](frontend/.env.production). From `frontend`, run:

```sh
npm ci
npm run build
```

Upload the **contents** of `frontend/dist` to the document root for both `allocationrefundprogram.com` and `app.allocationrefundprogram.com`. Use the same build for each host; React routes the public site and `/admin/*` portal. The included `.htaccess` supports page refreshes on Apache/cPanel. Add the misspelled site domain as an alias to the main site's document root if it should serve the same pages.

## Local development

The frontend's `.env.development` targets `http://localhost:8000/api`. Keep the local MySQL service running and configure `backend/.env` with local MySQL credentials. Start both applications from the project root with `./dev.sh`. Local mail defaults to Laravel's log mailer; use the SMTP settings only when you intend to send real email.

## Deployment checks

Before launch, confirm the API health by loading `https://api.allocationrefundprogram.com/api/program`, submit a test application from the HTTPS public site, check the email log/admin view, and sign in at `https://app.allocationrefundprogram.com/admin/login`. Also refresh a nested public route and an `/admin/*` route to confirm Apache serves the React app. These checks require DNS, HTTPS, database, and SMTP values from the hosting account and cannot be completed from this workspace alone.
