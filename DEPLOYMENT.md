# SkillPocket - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- MongoDB Atlas account (free tier works)
- Vercel account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)

### 2. MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster at https://cloud.mongodb.com
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for serverless functions
4. Get your connection string (should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
   ```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? skillpocket (or your choice)
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variables
vercel env add MONGO_URI
# Paste your MongoDB Atlas connection string

vercel env add JWT_SECRET
# Enter a secure random string (e.g., use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string

5. Click "Deploy"

### 4. Update Frontend API Calls (IMPORTANT)

**The frontend currently uses hardcoded localhost URLs. You have two options:**

#### Option 1: Use the API config file (Recommended)
Replace all hardcoded API URLs with the config:

```javascript
// At the top of each page file
import API_BASE_URL from '../config/api';

// Replace this:
const response = await fetch('http://localhost:5001/api/auth/login', {...});

// With this:
const response = await fetch(`${API_BASE_URL}/auth/login`, {...});
```

#### Option 2: Find and replace all URLs
Use your editor's find and replace feature:
- Find: `http://localhost:5001/api`
- Replace with: `/api`

This will make the frontend use relative URLs that Vercel will proxy to the serverless functions.

### 5. Verify Deployment

After deployment, test these key endpoints:
- User registration: `/register`
- User login: `/login`
- Admin login: `/admin/login`
- Skills listing: `/skills`

### 6. Local Development

To run locally after these changes:

```bash
# Terminal 1: Backend (for local development only)
cd backend
npm install
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

The frontend will use `http://localhost:5001/api` from `.env.local` for local development.

## 📝 Important Notes

### Socket.io Removed
The Socket.io dependency has been removed as Vercel serverless functions don't support persistent WebSocket connections. If you need real-time features, consider:
- Pusher (https://pusher.com)
- Ably (https://ably.com)
- Polling-based updates

### MongoDB Connection Pooling
The serverless functions use connection pooling to reuse database connections. Monitor your MongoDB Atlas connection count to ensure you stay within limits.

### Environment Variables
Never commit `.env` files to Git. The `.env.local` and `.env.production` files are for local reference only. Set environment variables in Vercel dashboard.

## 🔧 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify environment variables are set in Vercel
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify connection string format is correct

### 500 Errors
- Check Vercel function logs
- Verify MongoDB connection string
- Ensure JWT_SECRET is set

## 📚 Additional Resources
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next Steps: Update API URLs in frontend files]

## ⚠️ Next Steps Required

**You must update the frontend API calls** to use the config file or relative URLs before deploying. See section 4 above.
