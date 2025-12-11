# CodeSwitch - Docker & Render Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
npm start
```

### Production Docker Build

#### Build the image
```bash
npm run docker:build
```

#### Run the container
```bash
npm run docker:run
```

#### Access the app
Open http://localhost:3000

---

## 📦 Docker Deployment

### Architecture
- **Multi-stage build** for optimized image size
- **Stage 1**: Builds Vite frontend (static files)
- **Stage 2**: Node.js server serving both API and frontend
- **Single container**, single port (3000)

### Build Manually
```bash
docker build -t codeswitch .
```

### Run Container
```bash
docker run -p 3000:3000 codeswitch
```

### Run with Environment Variables
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  codeswitch
```

---

## ☁️ Render Deployment

### Option 1: Deploy via Render Dashboard

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub/GitLab repository
   - Select the branch (main/master)

3. **Configure Service**
   - **Name**: `codeswitch` (or your choice)
   - **Environment**: `Docker`
   - **Region**: Choose closest to users (e.g., Oregon, Frankfurt)
   - **Instance Type**: `Free` (or upgrade for better performance)
   - **Dockerfile Path**: `./Dockerfile`

4. **Environment Variables**
   - Add: `NODE_ENV` = `production`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Takes ~5-10 minutes for first deployment

### Option 2: Deploy via render.yaml (Blueprint)

The repository includes `render.yaml` for Infrastructure as Code deployment.

1. **Push render.yaml to your repo**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Create Blueprint on Render**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect repository
   - Render auto-detects `render.yaml`

3. **Review & Deploy**
   - Review the configuration
   - Click "Apply"
   - Render builds and deploys automatically

---

## ✅ Post-Deployment Verification

### Check Health
After deployment, verify these work:

- [ ] App loads at Render URL
- [ ] Landing page shows "CodeSwitch"
- [ ] Can enter username
- [ ] Can create new room
- [ ] Can join room via Room ID
- [ ] Code editor works
- [ ] All languages available (JS, Python, R)
- [ ] Code execution works
- [ ] Chat panel visible
- [ ] Chat messages work
- [ ] Real-time collaboration works
- [ ] Multiple users can join

### Test WebSocket Connection
Open browser console and check for:
```
Socket connected: <socket-id>
```

---

## 🔧 Troubleshooting

### Build Fails

**Error: ENOENT: no such file or directory**
- Solution: Ensure `client/dist` exists after frontend build
- Run: `cd client && npm run build` locally to test

**Error: Cannot find module**
- Solution: Check Dockerfile COPY commands
- Verify paths are relative to repository root

### Container Runs but App Doesn't Load

**Blank page**
- Check: Server is serving static files
- Verify: `app.use(express.static(clientDistPath))` in server/index.js
- Check logs: `docker logs <container-name>`

**404 on routes**
- Check: SPA fallback route is configured
- Verify: `app.get('*')` route exists AFTER other routes

### WebSocket Issues on Render

**Socket.io not connecting**
- Verify: Same port for frontend and backend (3000)
- Check: No proxy in production (conditional in vite.config.js)
- Render uses WebSocket upgrade automatically

**CORS errors**
- Check: `cors()` middleware is enabled in server
- Verify: Socket.io CORS is set to `'*'` or your domain

### Pyodide/WebR Not Working

**SharedArrayBuffer errors**
- Verify: COOP/COEP headers are set in server middleware
- Check browser console for specific errors
- These libraries require secure context (HTTPS) - Render provides this automatically

---

## 📊 Monitoring

### View Logs on Render
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. See real-time logs

### Check Container Health
Render automatically monitors the health check endpoint (`/`)

---

## 🎨 Customization

### Change App Name
Update in `client/src/LandingPage.jsx`:
```javascript
<h1>Your App Name</h1>
```

### Change Port
Update in `server/index.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Change Region
Update in `render.yaml`:
```yaml
region: frankfurt  # or 'oregon', 'singapore', 'ohio'
```

---

## 🔄 Updating Deployment

### Automatic Deployment
When `autoDeploy: true` in render.yaml:
- Push to main branch
- Render automatically rebuilds and deploys

### Manual Deployment
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 💰 Cost Optimization

### Free Tier
- Render free tier spins down after 15 min inactivity
- First request takes ~30 seconds (cold start)
- Suitable for demos and testing

### Paid Tier Benefits
- No spin-down
- Better performance
- More resources
- Custom domains
- SSL included

---

## 🚨 Important Notes

1. **Environment**: Always set `NODE_ENV=production` on Render
2. **Port**: Use `process.env.PORT` (Render assigns dynamically)
3. **WebSockets**: Work automatically on Render (no special config)
4. **HTTPS**: Render provides HTTPS automatically
5. **Custom Domain**: Configure in Render dashboard settings

---

## 📞 Support

### Issues
If you encounter issues:
1. Check Render logs
2. Verify build succeeded
3. Test Docker image locally first
4. Check troubleshooting section above

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com

---

**🎉 Congratulations! CodeSwitch is now deployed!**

Share your Render URL and start collaborating! 🚀
