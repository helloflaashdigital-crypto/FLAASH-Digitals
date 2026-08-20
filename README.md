# FLAASH Digital

A full MERN content platform and marketing website for FLAASH Digital — **Digital Solutions | Creative Impact**. It uses an energetic gold/orange, black and cream visual system, responsive React UI, CMS-ready API, protected admin area, Cloudinary uploads, production deployment configuration and a contact-lead workflow.

## Stack

- Client: React, Vite, React Router, Framer Motion, Axios, Lucide React and React Helmet Async
- Server: Node.js, Express, MongoDB/Mongoose, JWT HTTP-only cookies, bcrypt, Helmet, CORS, rate limiting, Multer, Cloudinary and the Gemini API

## Project structure

```
client/     React public site and admin interface
server/     Express API, database models, validation and authentication
```

## Local setup

1. Copy `server/.env.example` to `server/.env` and fill in the values. `MONGODB_URI` and `JWT_SECRET` are required for database-backed CMS and sign-in. Set `ADMIN_NAME`, `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` once to create the initial superadmin automatically.
2. Copy `client/.env.example` to `client/.env`. Keep `VITE_API_URL=http://localhost:5000/api/v1` for local work.
3. Start the API:

```bash
cd server
npm install
npm run dev
```
    
4. In another terminal, start the client:

```bash
cd client
npm install
npm run dev
```

Visit the address printed by Vite. The admin sign-in is at `/admin/login`.

## Required deployment values

Server:

```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
CLIENT_URL=https://your-netlify-site.netlify.app
JWT_SECRET=a-long-random-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

Client:

```env
VITE_API_URL=https://your-render-service.onrender.com/api/v1
VITE_SITE_URL=https://your-netlify-site.netlify.app
VITE_WHATSAPP_NUMBER=
```

Never expose server credentials in the client environment file. Replace `YOUR-NETLIFY-DOMAIN` in `client/public/sitemap.xml` before launch, then extend the sitemap for published dynamic content.

## Website assistant

The floating **Ask FLAASH** assistant reads the current published services, projects, case studies, testimonials, clients, team, homepage copy and site settings from MongoDB for each message. This means content published or changed in the admin portal is reflected on the next question automatically — no manual model training or redeployment is needed.

Add a newly generated `GEMINI_API_KEY` only to `server/.env` locally and to the server environment variables in production. Never add it to `client/.env`, commit it, or paste it into website code. The endpoint is rate-limited and accepts short messages only.

## Content workflow

The public website reads published services, projects, case studies, clients, testimonials and team members from the API. The admin interface creates, updates, publishes, features, reorders and deletes these entries. Public APIs intentionally return only entries whose status is `published`.

Configure the final phone, WhatsApp number, email, address, social links and approved company copy inside **Site Settings** before launch. Add only verified project metrics, testimonials and client logos; the UI deliberately does not invent them.

## Deploying

### Render API

- Root directory: `server`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/api/v1/health`

Set every server environment variable above. MongoDB Atlas network access must permit the Render service.

### Netlify client

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `client/dist`

`client/netlify.toml` includes the SPA redirect needed for direct refreshes on nested routes.

## Production checklist

- Add MongoDB Atlas and Cloudinary credentials.
- Change all obvious placeholder business details in Site Settings and the sitemap domain.
- Add approved logo asset, project images, social URLs, legal text, results, testimonials and team information.
- Verify CORS origin, cookie behaviour and Render health endpoint after deployment.
- Test public navigation, mobile layout, contact submission, admin login, CMS publishing, uploads and protected API routes.
