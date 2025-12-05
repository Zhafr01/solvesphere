.PHONY: setup test clean deploy

--- Development & Setup Commands ---

Setup: Install all PHP and NPM dependencies

setup:
@echo "--- Installing Dependencies (PHP & Node) ---"
composer install
npm install

Build Assets: Compile frontend assets (CSS/JS via Vite/Webpack)

build: setup
@echo "--- Compiling Frontend Assets ---"
npm run build

--- Testing Commands ---

Test: Run all PHPUnit tests

test: build
@echo "--- Running PHPUnit Tests ---"
php artisan migrate:fresh --env=testing
./vendor/bin/phpunit

--- Deployment Commands (Local Mockup) ---

Deploy: Mocks the deployment process

deploy: test
@echo "--- Starting Local Deployment Mock ---"
@echo "This target should be replaced with your actual deployment script."
@echo "Example: ssh user@server 'cd /var/www/sipenda && php artisan deploy'"