# 🚀 Deployment Guide - Glitter Mic

This guide covers deploying Glitter Mic to production using Render (backend) and Vercel (frontend).

## Prerequisites

- [ ] GitHub account with repository
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)
- [ ] Neon PostgreSQL database (already configured)
- [ ] Upstash Redis instance (already configured)
- [ ] Deepgram API key (already configured)
- [ ] Jamendo API credentials (already configured)

## 📦 Step 1: Prepare Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Verify .env files are committed**
   ```bash
   git ls-files | grep .env
   ```
   Should show:
   - `apps/api/.env`
   - `apps/web/.env`

## 🔧 Step 2: Deploy Backend to Render

### Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:

   **Basic Settings:**
   - Name: `glitter-mic-api`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `apps/api`
   - Runtime: `Node`

   **Build & Deploy:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

   **Advanced Settings:**
   - Add environment variables from `apps/api/.env`:
     ```
     NODE_ENV=production
     PORT=4000
     CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
     SESSION_SECRET=<generate-strong-secret>
     DATABASE_URL=postgresql://neondb_owner:npg_yFZ9HMbEtk4n@ep-gentle-haze-b4r7lgxr-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     REDIS_URL=https://peaceful-badger-195428.upstash.io
     REDIS_TOKEN=gQAAAAAAAvtkAAIgcDFhNjI2ZTE4NDM1NTg0NDYwOGEyM2NjNzA1Nzg0Nzc0YQ
     DEEPGRAM_API_KEY=cfa6e1d2cc28408698077df8d318e62cf50aea9f
     JAMENDO_CLIENT_ID=447b6fa8
     JAMENDO_CLIENT_SECRET=288a5a9474605d11ffd040f4d53455d6
     ```

4. Click **Create Web Service**

### Run Database Migration

After deployment, run migrations via Render Shell:

1. Go to your service dashboard
2. Click **Shell** tab
3. Run:
   ```bash
   npm run migrate
   ```

### Get Backend URL

Your backend will be available at:
`https://glitter-mic-api.onrender.com`

## 🌐 Step 3: Deploy Frontend to Vercel

### Create Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Import your GitHub repository
4. Configure:

   **Framework Preset:** Vite

   **Root Directory:** `apps/web`

   **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

   **Environment Variables:**
   ```
   VITE_API_URL=https://glitter-mic-api.onrender.com
   ```

5. Click **Deploy**

### Get Frontend URL

Your frontend will be available at:
`https://glitter-mic.vercel.app` (or your custom domain)

## 🔄 Step 4: Update CORS Settings

After getting your frontend URL, update the backend:

1. Go to Render dashboard
2. Navigate to your API service
3. Go to **Environment** tab
4. Update `CLIENT_ORIGIN`:
   ```
   CLIENT_ORIGIN=https://glitter-mic.vercel.app
   ```
5. Save changes (triggers automatic redeploy)

## ✅ Step 5: Verify Deployment

### Test Backend

```bash
curl https://glitter-mic-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Frontend

1. Visit `https://glitter-mic.vercel.app`
2. Try signing up with a new account
3. Verify login works
4. Check that the game page loads

### Test Full Flow

1. **Sign Up**: Create account → redirects to game
2. **Session**: Refresh page → stays logged in
3. **Logout**: Click logout → redirects to auth
4. **Login**: Log back in → works correctly

## 🐛 Troubleshooting

### Backend Issues

**"Cannot connect to database"**
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Run migrations: `npm run migrate`

**"Redis connection failed"**
- Verify `REDIS_URL` and `REDIS_TOKEN`
- Check Upstash dashboard for connection limits

**"CORS errors"**
- Ensure `CLIENT_ORIGIN` matches frontend URL exactly
- Check for trailing slashes
- Verify frontend is using correct API URL

### Frontend Issues

**"Network Error" when signing up/in**
- Check `VITE_API_URL` points to correct backend
- Verify backend is running and accessible
- Check browser console for CORS errors

**"Session not persisting"**
- Ensure cookies are enabled
- Check `secure` cookie setting (must be true in production)
- Verify `sameSite` setting allows cross-origin cookies

## 🔒 Security Checklist

- [ ] Changed `SESSION_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enabled HTTPS on both frontend and backend
- [ ] Configured proper CORS origins
- [ ] Verified no sensitive data in client-side code
- [ ] Set up rate limiting
- [ ] Enabled secure cookies

## 📊 Monitoring

### Render

- View logs: Dashboard → Service → **Logs** tab
- Monitor metrics: CPU, memory, bandwidth
- Set up notifications for downtime

### Vercel

- View analytics: Dashboard → Project → **Analytics**
- Monitor deployments: **Deployments** tab
- Check function logs: **Functions** tab

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. Push to `main` branch
2. Render automatically rebuilds backend
3. Vercel automatically rebuilds frontend
4. Changes live in ~2-5 minutes

## 💰 Cost Estimates

### Free Tier Limits

**Render Free:**
- ✅ Good for development/testing
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ 750 hours/month limit

**Vercel Free:**
- ✅ Unlimited bandwidth for personal use
- ✅ Automatic SSL
- ✅ Edge network

**Neon Free:**
- ✅ 512 MB storage
- ✅ Shared compute
- ✅ Branching support

**Upstash Free:**
- ✅ 10,000 commands/day
- ✅ 256 MB storage

### Production Recommendations

For production traffic:
- **Render**: $7/month (Starter plan)
- **Vercel**: Free (Pro $20/month for teams)
- **Neon**: $19/month (Scale plan)
- **Upstash**: $10/month (Pay-as-you-go)

## 🌍 Custom Domains

### Frontend (Vercel)

1. Go to Project Settings → **Domains**
2. Add your domain: `glittermic.com`
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic)

### Backend (Render)

1. Go to Service Settings → **Custom Domain**
2. Add domain: `api.glittermic.com`
3. Configure DNS: CNAME to `<service-name>.onrender.com`
4. SSL certificate automatic

## 📞 Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://upstash.com/docs

---

**Ready to deploy? Start with Step 1! 🚀**
