# Resuelvet Frontend - Tickets Module

Angular 16 frontend application for the Resuelvet tickets management system.

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for containerized deployment)
- **Angular CLI** (optional, for local development)

## Local Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

Start the Angular development server:

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 3. Build for Production

Build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/resuelvet-tickets/` directory.

### Development with Watch Mode

To rebuild on file changes during development:

```bash
ng serve --open
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and run the application:**

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

2. **Stop the application:**

```bash
docker-compose down
```

### Using Docker Directly

1. **Build the Docker image:**

```bash
docker build -t resuelvet-tickets-frontend:latest .
```

2. **Run the container:**

```bash
docker run -p 8080:80 resuelvet-tickets-frontend:latest
```

The application will be available at `http://localhost:8080`

### Production Build in Docker

The Dockerfile uses a multi-stage build process:

- **Build Stage:** Compiles the Angular application to production
- **Runtime Stage:** Serves the built application using Nginx

The final image is lightweight and production-ready.

## Project Structure

```
src/
├── app/
│   ├── core/              # Guards, interceptors, models, services
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   ├── features/          # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   └── users/
│   ├── app.routes.ts
│   └── app.component.ts
├── environments/          # Environment configurations
├── index.html
├── main.ts
├── styles.scss
└── polyfills.ts
```

## Build Configuration

The application is configured in `angular.json` for the `resuelvet-tickets` project with:

- **Build Output:** `dist/resuelvet-tickets`
- **Source Root:** `src`
- **TypeScript Config:** `tsconfig.app.json`
- **Styles:** SCSS support via `src/styles.scss`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Build for production |
| `npm run build -- --configuration production` | Build for production (explicit) |
| `docker-compose up --build` | Run application in Docker |

## Environment Configuration

Environment-specific configurations are located in `src/environments/`:

- `environment.ts` - Development environment
- `environment.prod.ts` - Production environment

## Nginx Configuration

The application uses Nginx for serving static files in production. Configuration is in `nginx.conf`:

- Serves files from `/usr/share/nginx/html`
- Configured for single-page application (SPA) with client-side routing

## Troubleshooting

### Port Already in Use

- **Development Server (4200):** Kill the process or use `ng serve --port 4201`
- **Docker (8080):** Change the port in `docker-compose.yml` or use `docker run -p 3000:80 ...`

### Docker Build Issues

Clear cache and rebuild:

```bash
docker-compose build --no-cache
docker-compose up
```

### Module Not Found Errors

Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

For local development, use the Angular development server for hot-reload capabilities during testing.

## License

Internal Project - Resuelvet
