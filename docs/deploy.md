# Deployment Guide

## Backend (Railway)

### Prerequisites
- Railway account (railway.app)
- MongoDB Atlas cluster
- Cloudinary account (for file uploads)

### Steps
1. Push code to GitHub
2. Connect Railway to the repo
3. Set root directory to `backend/`
4. Set build command: `npm run build`
5. Set start command: `node dist/server.js`
6. Configure environment variables in Railway dashboard (see below)

### Required Environment Variables
| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB Atlas connection string |
| ACCESS_TOKEN_SECRET | Random 64-char string (generate with: `openssl rand -hex 32`) |
| REFRESH_TOKEN_SECRET | Random 64-char string |
| NODE_ENV | Set to `production` |
| CLIENT_URL | Your mobile app's production URL |
| CLOUDINARY_CLOUD_NAME | From Cloudinary dashboard |
| CLOUDINARY_API_KEY | From Cloudinary dashboard |
| CLOUDINARY_API_SECRET | From Cloudinary dashboard |

### Health Checks
- Liveness: `GET /health`
- Readiness: `GET /health/ready`
- Metrics: `GET /metrics`

## Mobile (Expo EAS)

### Prerequisites
- Expo account
- EAS CLI installed: `npm install -g eas-cli`
- App Store Connect / Google Play Console access

### Steps
1. `eas build --platform android --profile production`
2. `eas build --platform ios --profile production`
3. `eas submit --platform android`
4. `eas submit --platform ios`

### Environment Variables
Set in EAS Build secrets or use local `.env`:
- `EXPO_PUBLIC_API_URL` — production backend URL
