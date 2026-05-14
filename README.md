# ShopNest Deployment Guide

ShopNest is a full-stack ecommerce project with:

- React + Vite frontend
- Node.js + Express backend
- MongoDB database
- Razorpay test/live payment integration

This guide walks through deploying the full project step by step in beginner-friendly language.

## Project Structure

```text
shop-nest/
  src/                  # React frontend
  public/               # Frontend public assets
  backend/              # Express backend
    config/
    controllers/
    middleware/
    models/
    routes/
    server.js
```

## Deployment Overview

You will deploy 3 parts:

1. MongoDB database on MongoDB Atlas
2. Backend API on Render or Railway
3. Frontend app on Vercel or Netlify

At the end, your setup will look like this:

```text
Frontend (Vercel/Netlify)
  -> calls API at https://your-backend-url.com/api
Backend (Render/Railway)
  -> connects to MongoDB Atlas
MongoDB Atlas
  -> stores users, products, orders, support tickets, wishlist, cart, reviews
```

## 1. Environment Variables

### Backend Environment Variables

The backend already includes an example file at [backend/.env.example](E:/shop-nest/backend/.env.example).

Create a file named `backend/.env` for local development:

```env
MONGO_URI=mongodb://127.0.0.1:27017/shopnest
JWT_SECRET=replace-with-a-long-random-secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
PORT=5000
```

For production, you should use:

- `MONGO_URI` from MongoDB Atlas
- a long random `JWT_SECRET`
- live Razorpay keys if you want real payments
- `PORT` is usually provided by the hosting platform automatically, but keeping it is fine

### Frontend Environment Variables

The frontend API client reads `VITE_API_URL` in [src/services/api.js](E:/shop-nest/src/services/api.js).

Create a local frontend env file in the project root:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Recommended local file:

```text
.env
```

Example:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

For production, this should point to your deployed backend:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

Important notes:

- Frontend env variables in Vite must start with `VITE_`
- After changing frontend env vars, rebuild or redeploy the frontend
- Do not commit real secrets to GitHub

## 2. Prepare the Backend for Deployment

Your backend is already close to deployment-ready. It has:

- a production start script in [backend/package.json](E:/shop-nest/backend/package.json)
- `dotenv` support
- MongoDB connection setup in [backend/config/db.js](E:/shop-nest/backend/config/db.js)
- API routes mounted in [backend/server.js](E:/shop-nest/backend/server.js)

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Start Scripts

Current scripts:

```json
"scripts": {
  "dev": "node --watch server.js",
  "start": "node server.js",
  "reset:admin": "node scripts/resetAdmin.js",
  "seed:products": "node scripts/seedProducts.js"
}
```

These are enough for deployment. Most platforms will use:

- Build command: `npm install`
- Start command: `npm start`

### CORS Setup

Your backend currently uses:

```js
cors({
  origin: true,
  credentials: true,
})
```

This is flexible and often works, but for production it is safer to allow only your deployed frontend domain.

Recommended production idea:

```env
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Then use something like:

```js
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
```

If you deploy on both Vercel and Netlify during testing, you can temporarily allow both domains with an array.

### Build Step

The backend does not need a build step because:

- it is plain Node.js
- it does not use TypeScript
- it does not need transpilation

So for backend deployment, `npm install` plus `npm start` is enough.

## 3. Deploy the Backend on Render

Render is a beginner-friendly option for Express apps.

### Step 1: Push Your Project to GitHub

If you have not done that yet:

```bash
git init
git add .
git commit -m "Initial ShopNest deploy setup"
git branch -M main
git remote add origin https://github.com/your-username/shopnest.git
git push -u origin main
```

### Step 2: Create a New Web Service

In Render:

1. Sign in to Render
2. Click `New +`
3. Choose `Web Service`
4. Connect your GitHub repository
5. Select the ShopNest repo

### Step 3: Configure the Backend Service

Because your backend is inside the `backend` folder, use these settings:

- Root Directory: `backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

If Render asks for a branch, choose your deployment branch, usually `main`.

### Step 4: Add Environment Variables

In the Render dashboard, add:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopnest?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
PORT=10000
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Notes:

- Render usually provides `PORT` automatically, so setting it manually is optional
- `CLIENT_URL` is useful if you tighten CORS
- Use MongoDB Atlas connection string, not local MongoDB in production

### Step 5: Deploy

Click `Create Web Service`.

Render will:

1. install dependencies
2. start the Express server
3. give you a live backend URL

Example:

```text
https://shopnest-api.onrender.com
```

Your API base URL will then be:

```text
https://shopnest-api.onrender.com/api
```

### Step 6: Test the Health Endpoint

Open your backend root URL in the browser:

```text
https://shopnest-api.onrender.com/
```

You should see a response like:

```json
{ "message": "ShopNest backend API is running." }
```

## 4. Deploy the Backend on Railway

Railway is another good option.

### Step 1: Create a New Project

In Railway:

1. Sign in
2. Click `New Project`
3. Choose `Deploy from GitHub repo`
4. Select your ShopNest repository

### Step 2: Configure the Service

If Railway detects the root of the repo instead of the backend folder, set the service to use the `backend` directory.

Typical settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Step 3: Add Environment Variables

Add the same variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopnest?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
CLIENT_URL=https://your-frontend-domain.vercel.app
```

Railway usually injects `PORT` automatically.

### Step 4: Redeploy and Test

Once deployed, Railway will provide a public domain such as:

```text
https://shopnest-backend.up.railway.app
```

Your frontend should use:

```text
https://shopnest-backend.up.railway.app/api
```

## 5. Set Up MongoDB Atlas

MongoDB Atlas is the easiest production-ready database option for this stack.

### Step 1: Create a Cluster

1. Go to MongoDB Atlas
2. Create an account or sign in
3. Create a new project
4. Build a cluster

The free tier is enough for testing and learning.

### Step 2: Create a Database User

In Atlas:

1. Open `Database Access`
2. Create a username and password
3. Save those credentials

### Step 3: Allow Network Access

In `Network Access`:

1. Add an IP address
2. For easiest setup, you can allow `0.0.0.0/0`

For production security, restrict IP access if possible.

### Step 4: Get Your Connection String

Atlas will give you a string like:

```env
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopnest?retryWrites=true&w=majority
```

Put this into your backend deployment env vars as `MONGO_URI`.

### Step 5: Seed Products If Needed

If your products collection is empty and you want starter data, run:

```bash
cd backend
npm install
npm run seed:products
```

If you want to seed production data, run the command in an environment where `MONGO_URI` points to your Atlas database.

## 6. Prepare the Frontend for Deployment

Your frontend is a Vite app and is already structured correctly for deployment.

### Local Frontend Development

From the project root:

```bash
npm install
npm run dev
```

The frontend dev server uses a proxy in [vite.config.js](E:/shop-nest/vite.config.js) for local API requests:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
    },
  },
},
```

This proxy only helps in local development. It does not apply after deployment.

### Set the Production API URL

For deployment, set:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

This is important because deployed frontend apps cannot use the local Vite proxy.

### Build the Frontend

Run:

```bash
npm install
npm run build
```

This generates the production frontend in:

```text
dist/
```

### Preview the Production Build Locally

Optional but recommended:

```bash
npm run preview
```

## 7. Deploy the Frontend on Vercel

Vercel is a very good choice for Vite + React apps.

### Step 1: Import the GitHub Repository

1. Sign in to Vercel
2. Click `Add New...`
3. Choose `Project`
4. Import your ShopNest GitHub repo

### Step 2: Configure the Project

Use these settings:

- Framework Preset: `Vite`
- Root Directory: `/`
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 3: Add Frontend Environment Variable

In Vercel project settings, add:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

### Step 4: Deploy

Click `Deploy`.

Vercel will provide a URL like:

```text
https://shopnest.vercel.app
```

### Step 5: Update Backend CORS

If your backend restricts CORS, make sure `CLIENT_URL` on the backend matches your Vercel URL:

```env
CLIENT_URL=https://shopnest.vercel.app
```

## 8. Deploy the Frontend on Netlify

Netlify is also a strong option for Vite apps.

### Step 1: Create a New Site

1. Sign in to Netlify
2. Click `Add new site`
3. Choose `Import an existing project`
4. Connect GitHub
5. Select your ShopNest repository

### Step 2: Configure Build Settings

Use:

- Base directory: leave empty or `/`
- Build command: `npm run build`
- Publish directory: `dist`

### Step 3: Add Environment Variable

Add:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

### Step 4: Deploy

After deployment, Netlify will give you a URL like:

```text
https://shopnest-store.netlify.app
```

### Optional SPA Redirect Rule

Because ShopNest uses React Router, you may need a redirect rule so refreshing routes like `/products` or `/profile` does not return `404`.

Create a file in the project root:

```text
public/_redirects
```

Add:

```text
/* /index.html 200
```

This tells Netlify to serve the React app for all routes.

## 9. Connect Frontend, Backend, and MongoDB Atlas

Once each part is deployed, connect them in this order:

### Step 1: Backend to MongoDB Atlas

Set backend `MONGO_URI` to your Atlas connection string.

### Step 2: Frontend to Backend

Set frontend `VITE_API_URL` to:

```env
https://your-backend-service.onrender.com/api
```

### Step 3: Backend CORS to Frontend

If you restrict CORS, set:

```env
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Step 4: Redeploy Both Sides

After changing env vars:

- redeploy backend
- redeploy frontend

### Step 5: Confirm Data Flow

Check that:

- frontend can load product data
- signup/login works
- protected routes work
- cart and wishlist save properly
- checkout creates and verifies orders
- support tickets are saved to MongoDB

## 10. Post-Deployment Testing Checklist

After deployment, test these flows one by one.

### Authentication

- Sign up with a new account
- Log in with the new account
- Refresh the page and confirm user session still works
- Log out and confirm protected pages are blocked

### Products

- Open the products page
- Search for products
- Filter by category
- Open a product details page

### Cart

- Add products to the cart
- Change quantities if supported
- Remove an item
- Refresh and confirm cart is still correct

### Wishlist

- Add a product to wishlist
- Open wishlist page
- Remove a product from wishlist

### Checkout and Payments

- Go to checkout
- Create a Razorpay order
- Complete a test payment
- Confirm order success page appears
- Confirm cart is cleared after successful payment
- Confirm order is saved in MongoDB

### Support

- Submit a support ticket
- Check that the ticket appears in user support history
- If admin flow is active, log in as admin and verify the ticket is visible
- Reply to the ticket and confirm the user can see the thread

### Admin Area

- Log in as admin
- Open dashboard
- Check product management
- Check order management
- Check support management

## 11. Common Troubleshooting

### Frontend loads but API calls fail

Possible causes:

- `VITE_API_URL` is missing or wrong
- backend URL does not include `/api`
- backend service is asleep or failed to start
- CORS is blocking requests

Things to check:

- browser developer console
- browser network tab
- backend deployment logs

### CORS Error in Browser

If you see CORS errors:

- confirm backend `cors()` config allows your frontend domain
- confirm frontend is calling the correct deployed API URL
- confirm there is no trailing typo in the domain

Example of a safer production setup:

```js
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
```

### React Router Pages Return 404 on Refresh

This usually happens on static hosting.

Fixes:

- Vercel: add SPA rewrite rules if needed
- Netlify: use `public/_redirects` with `/* /index.html 200`

### MongoDB Connection Fails

Check:

- `MONGO_URI` is correct
- Atlas user/password are correct
- special characters in password are URL-encoded
- Atlas Network Access allows connections from your host

### Login Fails Even Though User Exists

Check:

- `JWT_SECRET` is set on the backend
- deployed frontend is calling the correct backend
- token is stored and sent in `Authorization` header
- backend logs for JWT or user lookup errors

### Checkout Fails

Check:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set correctly
- frontend and backend use matching Razorpay test or live keys
- the backend is reachable from the frontend
- order creation endpoint succeeds before Razorpay opens

### Images, Products, or Admin Data Are Missing

Check:

- whether database has seeded product data
- whether the admin account exists
- whether collections exist in MongoDB Atlas

## 12. Recommended Production Improvements

Before or after first deployment, these improvements are worth making:

- restrict CORS to known frontend domains
- add a production-ready README section for local setup and deployment
- add automated tests for critical flows
- add request logging and error monitoring
- add rate limiting on auth routes
- add validation for request bodies
- separate test and production Razorpay keys clearly
- add custom domain names

## 13. Quick Deployment Summary

If you want the shortest version, the deployment flow is:

1. Create MongoDB Atlas cluster and get `MONGO_URI`
2. Deploy `backend/` to Render or Railway
3. Set backend env vars: `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Deploy frontend root project to Vercel or Netlify
5. Set frontend env var: `VITE_API_URL=https://your-backend-domain/api`
6. Update backend CORS to allow your frontend domain
7. Test auth, products, cart, checkout, support, and admin flows

## Useful Commands

### Frontend

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Backend

```bash
cd backend
npm install
npm run dev
npm start
npm run seed:products
```

## Final Notes

For the easiest first deployment:

- use MongoDB Atlas for database
- use Render for backend
- use Vercel for frontend

That combination works well for a React + Express + MongoDB project like ShopNest and is friendly for beginners.
