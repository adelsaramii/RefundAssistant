# Deployment Guide - Render.com

## 🚀 Deploy to Render.com

### Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at https://render.com (free tier available)
3. **OpenAI API Key** - Get from https://platform.openai.com/api-keys

---

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
cd C:\Users\PcVIP\PycharmProjects\RefundAssistant

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Refund Engine API"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/refund-engine.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

#### Option A: Using Blueprint (Recommended)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**
6. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key

#### Option B: Manual Setup

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `refund-engine`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Click **"Create Web Service"**

### 3. Configure Environment Variables

In Render dashboard → Your service → Environment:

```
OPENAI_API_KEY = sk-your-api-key-here
ALLOWED_ORIGINS = https://your-frontend-domain.com,http://192.168.1.34:3000
```

**Note**: Add your frontend URL to `ALLOWED_ORIGINS` (comma-separated for multiple)

### 4. Verify Deployment

Once deployed, Render will give you a URL like:
```
https://refund-engine.onrender.com
```

Test it:
```bash
curl https://refund-engine.onrender.com/health
```

Expected response:
```json
{"status":"ok","service":"refund-engine"}
```

---

## Update Frontend Configuration

Update your web console to use the Render URL:

**File**: `refund-console/.env.local` (create if doesn't exist)

```bash
NEXT_PUBLIC_API_BASE_URL=https://refund-engine.onrender.com
```

Or update `lib/api.ts`:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://refund-engine.onrender.com";
```

Restart your Next.js dev server:
```bash
cd C:\Users\PcVIP\PycharmProjects\RefundAssistantWeb\refund-console
npm run dev
```

---

## Available Endpoints

Once deployed, all endpoints will be available:

- `GET /health` - Health check
- `GET /cases` - List all cases
- `GET /cases?demo_only=true` - Demo cases only
- `GET /cases/{case_id}` - Single case
- `POST /nlp/extract` - Text feature extraction
- `GET /impact` - Business impact calculator
- `GET /policy` - Policy rules
- `POST /policy/toggle` - Toggle policy rule
- `POST /policy/weight` - Update rule weight
- `POST /policy/preset` - Apply policy preset
- `POST /decisions` - Submit decision (stubbed)

---

## Production Checklist

### ✅ Security

- [x] API key stored as environment variable
- [x] CORS configured with specific origins
- [ ] Add rate limiting (future)
- [ ] Add authentication (future)

### ✅ Performance

- [x] NLP caching enabled (in-memory)
- [ ] Use Redis for persistent cache (future)
- [ ] Add database for policy persistence (future)

### ✅ Monitoring

- [x] Health check endpoint configured
- [ ] Add application monitoring (future)
- [ ] Set up error tracking (future)

---

## Troubleshooting

### Deployment Fails

**Problem**: Build fails with module not found

**Solution**: Ensure `requirements.txt` has all dependencies:
```bash
pip freeze > requirements.txt
```

### API Returns 500 Error

**Problem**: OpenAI API key not set

**Solution**: Add `OPENAI_API_KEY` in Render environment variables

### CORS Errors in Frontend

**Problem**: Frontend can't connect to API

**Solution**: Add frontend URL to `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### Free Tier Sleeps After Inactivity

**Problem**: First request after 15 min is slow

**Solution**: 
- Upgrade to paid tier ($7/month)
- Or use external service to ping health endpoint every 10 minutes

---

## Scaling Considerations

### Current Architecture (Free Tier)

- ✅ Handles low-medium traffic
- ✅ In-memory policy storage
- ✅ In-memory NLP cache
- ⚠️ Sleeps after 15 min of inactivity

### Recommended Upgrades

1. **Paid Tier** ($7/month)
   - No sleep
   - Better performance
   - 400 hours/month

2. **Add Database**
   - PostgreSQL for policy persistence
   - Store audit logs
   - Track decisions

3. **Add Redis**
   - Persistent NLP cache
   - Reduce OpenAI API costs

4. **Add Background Workers**
   - Async processing
   - Batch operations

---

## Cost Estimation

### Render Costs

- **Free Tier**: $0/month (with limitations)
- **Starter**: $7/month (no sleep, better performance)
- **Professional**: $25/month (more resources)

### OpenAI Costs

- Model: gpt-3.5-turbo
- Cost per request: ~$0.0015
- With caching: ~50% reduction
- Estimated: $10-30/month for moderate usage

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | None | OpenAI API key for text intelligence |
| `ALLOWED_ORIGINS` | No | `*` | Comma-separated list of allowed origins |
| `PORT` | No | 8001 | Port to run server on (Render sets this) |

---

## Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically deploys in ~2 minutes
```

Watch deployment at: https://dashboard.render.com

---

## Support

- **Render Docs**: https://render.com/docs
- **Render Dashboard**: https://dashboard.render.com
- **OpenAI Platform**: https://platform.openai.com

---

**Your API will be live at**: `https://refund-engine.onrender.com` 🚀

