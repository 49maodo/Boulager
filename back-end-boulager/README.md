## README API Boulangerie

## Installation Instructions
1. Clone the repository:
2. Navigate to the project directory:
3. Install Composer dependencies:
```bash
  composer install
```
4. Install NPM dependencies:
```bash
  npm install
```
5. Build the project:
```bash
  npm run build
```

6. Copy the example environment file:
```bash
  cp .env.example .env
```
7. Generate the application key:

```bash
  php artisan key:generate
```
8. Run the migrations and seed the database:

```bash
  php artisan migrate --seed
```
9. Set up the storage link:
```bash
  php artisan storage:link
```
10. Mail configuration:
- Update the `.env` file with your mail server settings. For example:
- ```env
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.mailtrap.io
  MAIL_PORT=2525
  MAIL_USERNAME=your_username
  MAIL_PASSWORD=your_password
  MAIL_ENCRYPTION=null
  ```
11. Run the application:
```bash
  php artisan queue:work
```
```bash
  php artisan serve
```

```
- Email: admin@gmail.com
- Password: admin123
- Role: Admin
