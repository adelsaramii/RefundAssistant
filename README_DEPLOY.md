# Quick Deploy - Render.com

## 🚀 3-Step Deployment

### Step 1: Push to GitHub

```bash
cd C:\Users\PcVIP\PycharmProjects\RefundAssistant

git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/refund-engine.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com/dashboard
2. Click **New +** → **Blueprint**
3. Connect your GitHub repo
4. Click **Apply**

### Step 3: Add API Key

In Render dashboard:
- Go to your service
- Click **Environment**
- Add: `OPENAI_API_KEY = sk-your-key-here`
- Click **Save**

## ✅ Done!

Your API is live at: `https://refund-engine.onrender.com`

Test it:
```bash
curl https://refund-engine.onrender.com/health
```

## Update Frontend

Edit `refund-console/lib/api.ts`:

```typescript
const API_BASE_URL = "https://refund-engine.onrender.com";
```

---

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.

