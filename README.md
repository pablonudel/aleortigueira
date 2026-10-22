# Alejandro Ortigueira

Portfolio website for cinematographer Alejandro Ortigueira. Browse audiovisual projects by category, view project details with videos and image galleries, and learn about his profile and contact information. The site also includes a private dashboard for managing portfolio content.

## Features

- Public project listing with category filters and project detail pages.
- Video playback and image galleries.
- Biography and contact sections.
- Admin dashboard to manage projects, categories, and profile information.
- Sign-in and protected admin pages.
- Image storage powered by Tigris.

## Tech stack

- Next.js 16 (App Router), React 19, and TypeScript.
- Tailwind CSS 4.
- PostgreSQL and Prisma 7.
- Better Auth for authentication.
- Tigris for image storage.

## Requirements

- Node.js 20.9 or later.
- pnpm 11.1.1.
- A PostgreSQL database.
- A Tigris Storage bucket and credentials to upload and serve images.

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env.local` file in the project root and set the following variables:

   ```dotenv
   DATABASE_URL="postgresql://username:password@localhost:5432/aleortigueira"

   ADMIN_NAME="Administrator name"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="change-this-password"

   TIGRIS_STORAGE_ACCESS_KEY_ID="your-access-key"
   TIGRIS_STORAGE_SECRET_ACCESS_KEY="your-secret-key"
   TIGRIS_STORAGE_BUCKET="your-bucket-name"
   # Optional: custom Tigris endpoint.
   # TIGRIS_STORAGE_ENDPOINT="https://..."
   NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL="https://your-public-bucket-url"
   ```

   `NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL` is the public base URL of the bucket. Tigris access keys and the admin password are secrets; do not publish them or commit them to version control.

3. Apply the Prisma migrations:

   ```bash
   pnpm exec dotenv -e .env.local -- prisma migrate deploy
   ```

4. Create the initial admin user:

   ```bash
   pnpm seed:local
   ```

   The seed creates the account only if the database does not already contain any users. Set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before running it.

5. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The admin dashboard is at `/admin`, and the sign-in page is at `/signin`.

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts Next.js in development mode. |
| `pnpm build` | Creates the production build. |
| `pnpm start` | Serves the production build. |
| `pnpm lint` | Runs ESLint. |
| `pnpm seed:local` | Creates the initial user using `.env.local`. |
| `pnpm seed:production` | Runs the seed using `.env.production`. |

The `vercel-build` script generates the Prisma client and builds the application for Vercel deployments. In production, configure the same variables in your deployment provider, use a PostgreSQL database accessible to the application, and apply migrations with `prisma migrate deploy`.

## Project structure

- `src/app/`: public pages, sign-in, and admin routes.
- `src/actions/`: read and update operations for projects, categories, and profile information.
- `src/components/`: UI components.
- `src/lib/`: authentication, Prisma, and seed configuration.
- `prisma/`: database schema and migrations.
