# Troubleshooting Guide

This document helps resolve common issues when running the AI Content Assembly Line frontend.

## 🚨 Common Issues

### 1. "Start Demo Workflow" Fails

**Symptoms:**
- Clicking "Start Demo Workflow" shows an error
- Network requests to backend fail
- Progress tracking doesn't start

**Solutions:**

#### Check Backend Connection
```bash
# Test if backend is running
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "services": {...}
}
```

#### Enable Mock API for Testing
```env
# In .env.local
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

This bypasses the backend and uses simulated data.

#### Verify Backend API Compatibility
Check the [Backend Integration Guide](backend-integration.md) to ensure your FastAPI backend returns the expected response format.

### 2. Real-time Updates Not Working

**Symptoms:**
- Progress bar doesn't update
- "Connection Status" shows "Offline"
- No live content building

**Solutions:**

#### Check SSE Support
```env
# Disable SSE if having connection issues
NEXT_PUBLIC_ENABLE_SSE=false
```

This forces polling mode as fallback.

#### Verify Backend SSE Endpoint
```bash
# Test SSE endpoint (should stay connected)
curl -N http://localhost:8000/blog/workflow-stream/test-id
```

#### Check CORS Configuration
Backend needs proper CORS setup:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Build Errors

**Symptoms:**
- TypeScript compilation errors
- Missing module errors
- Build fails

**Solutions:**

#### Clear Cache and Reinstall
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### Check Node.js Version
```bash
node --version  # Should be 18+ 
npm --version   # Should be 8+
```

#### Verify Dependencies
```bash
npm audit
npm update
```

### 4. Environment Variables Not Working

**Symptoms:**
- Mock API not enabling
- Backend URL not updating
- Feature flags not working

**Solutions:**

#### Check File Location
Ensure environment file is in the correct location:
```bash
# Should be in project root
ls -la .env.local
```

#### Verify Variable Names
All frontend variables must start with `NEXT_PUBLIC_`:
```env
# ✅ Correct
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# ❌ Wrong - won't work
API_BASE_URL=http://localhost:8000
```

#### Restart Development Server
Environment changes require restart:
```bash
npm run dev
```

### 5. Form Validation Issues

**Symptoms:**
- Form won't submit
- Validation errors persist
- Required fields marked as invalid

**Solutions:**

#### Check Required Fields
Ensure all required fields are filled:
- Title (minimum 5 characters)
- Industry (select or custom)
- Purpose (educational/promotional/informational)

#### Reset Form State
```typescript
// If form gets stuck, reset it
const { reset } = useForm();
reset();
```

### 6. Animation Performance Issues

**Symptoms:**
- Choppy animations
- Slow page transitions
- High CPU usage

**Solutions:**

#### Disable Animations
```env
NEXT_PUBLIC_ENABLE_ANIMATIONS=false
```

#### Check Device Performance
Some animations may be intensive on lower-end devices.

#### Respect Reduced Motion
The app automatically respects `prefers-reduced-motion` settings.

## 🔧 Development Issues

### Hot Reload Not Working

```bash
# Try different ports if 3000 is busy
npm run dev -- -p 3001

# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Common fixes
npm update @types/node @types/react @types/react-dom
```

### Styling Issues

```bash
# Regenerate Tailwind CSS
npm run build

# Check for conflicting CSS
# Look for custom CSS overriding Tailwind classes
```

## 🐛 Debugging Tools

### Enable Debug Mode

```env
# Add to .env.local for detailed logging
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Browser Developer Tools

1. **Network Tab**: Check API requests and responses
2. **Console**: Look for JavaScript errors
3. **Application Tab**: Check localStorage and environment variables

### API Testing with curl

```bash
# Test workflow creation
curl -X POST http://localhost:8000/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","industry":"tech","purpose":"educational"}'

# Test status endpoint  
curl http://localhost:8000/blog/workflow-status/WORKFLOW_ID

# Test result endpoint
curl http://localhost:8000/blog/result/WORKFLOW_ID
```

## 📞 Getting Help

### Check Logs

```bash
# Frontend logs
npm run dev

# Check browser console for errors
# Check network tab for failed requests
```

### Verify Setup

```bash
# Ensure all required files exist
ls -la .env.local
ls -la package.json
ls -la next.config.ts

# Check if all dependencies are installed
npm list --depth=0
```

### Common Environment Setup

```env
# Working development configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_ENABLE_SSE=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
NEXT_PUBLIC_POLLING_INTERVAL=2000
```

## 🔄 Reset to Clean State

If all else fails, completely reset the project:

```bash
# 1. Clean all caches
rm -rf node_modules package-lock.json .next

# 2. Reinstall dependencies
npm install

# 3. Reset environment
cp .env.example .env.local

# 4. Enable mock API for testing
echo "NEXT_PUBLIC_ENABLE_MOCK_API=true" >> .env.local

# 5. Start fresh
npm run dev
```

This should give you a working development environment with mock data, allowing you to test the frontend independently of the backend.

## 📋 Diagnostic Checklist

Before asking for help, check:

- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] Environment file exists (`.env.local`)
- [ ] Backend is running (if not using mock API)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Browser console shows no errors
- [ ] Network requests are successful (check DevTools)
- [ ] CORS is properly configured on backend

Most issues can be resolved by enabling the mock API during development:

```env
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

This allows you to test the full frontend experience while the backend is being developed or debugged.