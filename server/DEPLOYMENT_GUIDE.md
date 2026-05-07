# OTP System Deployment Guide

## MongoDB Atlas Configuration

### 1. Update Connection String
Your current MONGO_URI:
```
mongodb+srv://mahendrapi0053_db_user:w546hI2x3pqv6AwU@cluster0.avvnhcg.mongodb.net/?appName=Cluster0
```

**Needs to include database name** (the code now adds `/medicore` automatically):
```
mongodb+srv://mahendrapi0053_db_user:w546hI2x3pqv6AwU@cluster0.avvnhcg.mongodb.net/medicore?retryWrites=true&w=majority
```

### 2. Network Access (CRITICAL)
In MongoDB Atlas:
1. Go to **Network Access** → **IP Access List**
2. Add **0.0.0.0/0** (Allow access from anywhere) - OR add Render's specific IP ranges
3. Click "Confirm"

⚠️ **Without this, MongoDB connections from Render will be blocked**

### 3. Database User
Ensure the database user `mahendrapi0053_db_user` has `readWrite` access to the `medicore` database.

## Environment Variables for Render

Set these in Render's Environment Variables section:

```bash
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://mahendrapi0053_db_user:w546hI2x3pqv6AwU@cluster0.avvnhcg.mongodb.net/medicore?retryWrites=true&w=majority
JWT_SECRET=9f3d7c2a8b4e1f6d9a0c3b7e5f2a8d6c1e4b9f0a7c3d2e6f8b1a4c9d7e2f6a1b
CLIENT_URL=https://medicore-main-1.onrender.com

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sourceforget32@gmail.com
SMTP_PASS=kadhwvxrtudjkqrt
SMTP_FROM="MediCore Hospital <sourceforget32@gmail.com>"

# Cloudinary
CLOUDINARY_URL=cloudinary://119583979624217:8xLgf6h2XmEBk54NE7yg2O7mFec@dsjxrospe
```

## Testing After Deployment

1. **Health Check**: `https://medicore-main-1.onrender.com/api/health`
2. **Register a user**: POST to `/api/auth/register`
3. **Check OTP email**: Should receive OTP within 1 minute
4. **Verify OTP**: POST to `/api/auth/verify-otp`
5. **Login**: POST to `/api/auth/login` (will require OTP if not verified)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `MongoServerError: bad auth` | Check username/password in MONGO_URI, ensure user exists in Atlas |
| `MongooseServerSelectionError` | Add 0.0.0.0/0 to Atlas IP whitelist |
| `ETIMEDOUT` | Atlas cluster may be paused (free tier). Wake it up from Atlas console |
| OTP email not sent | Verify SMTP credentials, check Gmail "Less secure apps" or use App Password |
| Login blocked after OTP | Ensure OTP not already used, check OTP collection in MongoDB |
| Rate limit error | Wait 60 seconds between OTP requests |

## Important Notes

- **OTP validity**: 10 minutes
- **Rate limiting**: 1 minute minimum between requests per email
- **Single-use**: Each OTP can be verified only once
- **TTL cleanup**: Expired OTPs auto-removed after 1 hour

## Debugging on Render

Check server logs in Render dashboard. Look for:
- `✅ MongoDB connected` - confirms DB connection
- `🔍 OTP verification error` - OTP issues
- `OTP sent successfully` - email sent
- SMTP warnings - email config issues
