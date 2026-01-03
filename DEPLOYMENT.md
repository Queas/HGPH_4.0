# Deployment Guide 🚀

## The Problem with GitHub Pages

**GitHub Pages CANNOT host the full application** because it only serves static files. Your app has two parts:
- ✅ Frontend (React) - can be static
- ❌ Backend (Node.js/Express) - needs a server

## Deployment Options

### Option 1: Both on Free Services (Easiest) ⭐

#### Deploy Backend to Render (Free)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your `HGPh_4.0` repository
5. Configure:
   - **Name**: `hgph-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add Environment Variables:
   ```
   PORT=8002
   NODE_ENV=production
   (copy other vars from your .env if needed)
   ```
7. Click "Create Web Service"
8. **Copy your backend URL**: `https://hgph-backend.onrender.com`

#### Deploy Frontend to Vercel or Netlify (Free)

**Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - Add Environment Variable:
     ```
     REACT_APP_BACKEND_URL=https://hgph-backend.onrender.com
     ```
4. Deploy!
5. Your site: `https://hgph-4-0.vercel.app`

**OR Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - Environment variable: `REACT_APP_BACKEND_URL=https://hgph-backend.onrender.com`
4. Deploy!

---

### Option 2: Frontend on GitHub Pages (More Complex)

#### Step 1: Deploy Backend First (Use Render as above)

#### Step 2: Update Frontend Configuration

Update `frontend/.env`:
```env
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

#### Step 3: Install gh-pages
```bash
cd frontend
npm install gh-pages --save-dev
```

#### Step 4: Deploy to GitHub Pages
```bash
npm run deploy
```

Your site will be at: `https://queast.github.io/hgph_4.0`

---

### Option 3: All-in-One Platforms

**Railway** (Free Tier):
- Can host both frontend and backend
- 500 hours/month free
- [railway.app](https://railway.app)

**Fly.io** (Free Tier):
- Great for Node.js apps
- [fly.io](https://fly.io)

---

## Quick Commands for GitHub Pages

After backend is deployed:

```bash
# Update backend URL in frontend/.env
cd frontend
npm install gh-pages --save-dev
npm run deploy
```

---

## Important Notes

1. **Backend MUST be hosted separately** - GitHub Pages won't run Node.js
2. **Update CORS** in backend to allow your frontend domain
3. **Free tier limits**:
   - Render: Spins down after 15 min inactivity (slow first load)
   - Vercel/Netlify: Generous free tier
4. **Database**: Consider MongoDB Atlas (free tier) for production

---

## Recommended Setup (Simplest)

✅ **Backend**: Render.com (Free)  
✅ **Frontend**: Vercel.com (Free)  
✅ **Database**: NeDB (file-based) or MongoDB Atlas (Free)

Total cost: **$0/month** 🎉

---

## Need Help?

Check out:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Guide](https://pages.github.com)
