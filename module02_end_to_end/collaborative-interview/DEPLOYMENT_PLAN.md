# CodeSwitch - Containerization & Deployment Implementation Plan

## 📋 Overview

This document outlines the implementation plan for containerizing CodeSwitch and deploying it to Render using a **production-ready, single-container architecture**.

---

## 🎯 Deployment Strategy: Option B - Production Single-Container

### Architecture
- **Single Docker container** serving both frontend and backend
- **Frontend:** Built static files from Vite (React SPA)
- **Backend:** Node.js/Express server with Socket.io
- **Port:** Single port (3000) for all traffic
- **Deployment Target:** Render.com

### Benefits
- ✅ Optimized production build
- ✅ Smaller image size
- ✅ Single point of deployment
- ✅ Simplified port management
- ✅ Cost-effective on Render

---

## 🔧 Implementation Steps

### Step 1: Update Dockerfile for Production

**File:** `Dockerfile`

**Objective:** Create a multi-stage build that:
1. Builds the Vite frontend into static files
2. Sets up Node.js backend
3. Serves static files from the backend

**Changes:**
```dockerfile
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --production=false
COPY client/ ./
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:18-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production
COPY server/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/client/dist /app/client/dist

# Copy root package.json for start script
COPY package.json /app/

WORKDIR /app

# Expose port (Render will assign)
EXPOSE 3000

# Start server
CMD ["npm", "run", "server"]
```

**Key Points:**
- Multi-stage build reduces final image size
- `npm ci --production` for server (no dev dependencies)
- Frontend built files copied to final image
- Only server runs in production

---

### Step 2: Update Server to Serve Static Files

**File:** `server/index.js`

**Objective:** Configure Express to serve built frontend files and handle SPA routing

**Changes to add:**

```javascript
const path = require('path');

// Serve static files from client/dist (AFTER other routes)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});
```

**Placement:**
- Add AFTER all API routes and Socket.io setup
- Add BEFORE `server.listen()`

**Why:**
- Serves built React app
- Handles client-side routing (React Router)
- API routes still work (checked first)

---

### Step 3: Update package.json Scripts

**File:** `package.json` (root)

**Add/Update scripts:**

```json
{
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm start",
    "client": "cd client && npm run dev -- --host",
    "build": "cd client && npm run build",
    "docker:build": "docker build -t codeswitch .",
    "docker:run": "docker run -p 3000:3000 codeswitch"
  }
}
```

**Purpose:**
- `build`: Builds frontend (used in Dockerfile)
- `docker:build`: Local Docker testing
- `docker:run`: Run container locally

---

### Step 4: Environment Configuration

**File:** `server/index.js`

**Update port configuration:**

```javascript
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

**Environment Variables for Render:**
- `PORT`: Auto-assigned by Render
- `NODE_ENV=production`: Set in Render dashboard
- No additional env vars needed (browser-side execution)

---

### Step 5: Create render.yaml (Optional but Recommended)

**File:** `render.yaml`

**Purpose:** Infrastructure as Code for Render deployment

```yaml
services:
  - type: web
    name: codeswitch
    env: docker
    plan: free  # or starter/standard
    region: oregon  # or preferred region
    dockerfilePath: ./Dockerfile
    dockerContext: .
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /
```

**Benefits:**
- Automated deployment from Git
- Version-controlled infrastructure
- Easy redeployment

---

### Step 6: Update .dockerignore

**File:** `.dockerignore`

**Ensure it includes:**

```
node_modules
.git
.gitignore
*.md
.env
.DS_Store
client/node_modules
server/node_modules
client/dist
.vscode
*.log
```

**Why:**
- Reduces build context size
- Faster builds
- Smaller images

---

### Step 7: Update Client Vite Config for Production

**File:** `client/vite.config.js`

**Ensure proxy is conditional:**

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    } : undefined,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable for production
  }
})
```

**Why:**
- Proxy only needed in dev mode
- In production, same server serves both
- Smaller build size

---

## 🧪 Testing Plan

### Local Docker Testing

**Step 1: Build the image**
```bash
docker build -t codeswitch .
```

**Step 2: Run the container**
```bash
docker run -p 3000:3000 codeswitch
```

**Step 3: Test the application**
- Open `http://localhost:3000`
- Verify landing page loads
- Create a room
- Test code execution
- Test chat functionality
- Open in multiple tabs to test collaboration

**Expected Results:**
- ✅ App loads on port 3000
- ✅ Static files served correctly
- ✅ Socket.io connections work
- ✅ Chat works between users
- ✅ Code execution works

---

## 🚀 Render Deployment Steps

### Option A: Deploy via Render Dashboard

1. **Create New Web Service**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Service**
   - **Name:** codeswitch
   - **Environment:** Docker
   - **Region:** Choose closest to users
   - **Branch:** main/master
   - **Dockerfile Path:** ./Dockerfile

3. **Environment Variables**
   - Add: `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### Option B: Deploy via render.yaml

1. **Commit render.yaml to repository**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Create Blueprint**
   - Go to Render dashboard
   - Click "New +" → "Blueprint"
   - Connect repository
   - Render detects `render.yaml` automatically

3. **Deploy**
   - Review configuration
   - Click "Apply"
   - Render builds and deploys

---

## 📊 Deployment Verification Checklist

After deployment, verify:

- [ ] Application loads at Render URL
- [ ] Landing page displays "CodeSwitch"
- [ ] Can enter username
- [ ] Can create new room
- [ ] Can join existing room via Room ID
- [ ] Code editor loads and works
- [ ] Can switch languages (JavaScript, Python, R)
- [ ] Can run code and see output
- [ ] Chat panel visible (doesn't disappear)
- [ ] Can send messages
- [ ] Messages show correct usernames
- [ ] Multiple users can join same room
- [ ] Real-time collaboration works
- [ ] Socket.io connections stable
- [ ] WebSockets work on Render

---

## 🐛 Troubleshooting Guide

### Issue: Static files not loading
**Solution:** Check server/index.js has `express.static()` after routes

### Issue: WebSocket connection fails
**Solution:** Ensure Socket.io uses same port, check CORS settings

### Issue: Pyodide/WebR errors
**Solution:** Verify COOP/COEP headers are set in both server and Vite

### Issue: "Cannot GET /room/xxxxx" on refresh
**Solution:** Ensure SPA fallback route (`app.get('*')`) is configured

### Issue: Chat disappears
**Solution:** Already fixed with `position: fixed` in CSS

---

## 📈 Future Optimizations

### Performance
- [ ] Enable gzip/brotli compression
- [ ] Add CDN for static assets
- [ ] Implement Redis for Socket.io scaling
- [ ] Add health check endpoint

### Monitoring
- [ ] Set up logging (Winston)
- [ ] Add error tracking (Sentry)
- [ ] Monitor WebSocket connections
- [ ] Track room usage

### Scaling
- [ ] Use Redis adapter for multi-instance Socket.io
- [ ] Implement sticky sessions
- [ ] Consider separate frontend/backend for scale

---

## 📝 Summary

This plan provides a **production-ready, single-container deployment** strategy for CodeSwitch on Render. The architecture:

- Uses Docker multi-stage builds for optimization
- Serves both frontend and backend from one Node.js server
- Minimizes complexity and costs
- Maintains all functionality (code execution, chat, collaboration)
- Is ready for immediate deployment

**Estimated Implementation Time:** 1-2 hours
**Deployment Time:** 10-15 minutes on Render

---

## ✅ Next Steps

1. Implement Step 1: Update Dockerfile
2. Implement Step 2: Update server/index.js
3. Implement Step 3-7: Configuration updates
4. Test locally with Docker
5. Deploy to Render
6. Verify deployment
7. Share with users!

**Ready to build and deploy CodeSwitch! 🚀**
