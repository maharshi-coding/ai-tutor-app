# Testing Guide for Performance Improvements

This guide helps you test the performance optimizations implemented in the AI Tutor App.

## Overview

The following performance improvements were made:
- **Backend:** Fixed N+1 queries, added pagination, streaming uploads, optimized embeddings
- **Frontend:** Memoized components, reduced 3D polygons, optimized images

## Quick Start

### Prerequisites
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env
# Edit .env with your database credentials

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit .env.local with API URL
```

---

## Backend Testing

### 1. Test Database Query Optimizations

#### Test N+1 Query Fix (Registration)
```bash
cd backend

# Enable SQL query logging in your .env
echo "DATABASE_LOG_QUERIES=true" >> .env

# Start the backend
uvicorn app.main:app --reload

# In another terminal, test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "password123"
  }'

# Check logs - should see only 1 query checking for existing user
# Before optimization: 2 queries (one for email, one for username)
# After optimization: 1 query with OR condition
```

**Expected Result:** Single query like:
```sql
SELECT * FROM users WHERE email = 'test@example.com' OR username = 'testuser'
```

#### Test Course Existence Check
```bash
# First, clear any existing courses (if testing fresh)
# Then hit the courses endpoint

curl http://localhost:8000/api/courses/

# Check logs - should see exists() query instead of count()
# Before: SELECT COUNT(*) FROM courses
# After: SELECT EXISTS(SELECT 1 FROM courses WHERE id IS NOT NULL)
```

#### Test Pagination
```bash
# Test default pagination
curl http://localhost:8000/api/courses/

# Test with custom pagination
curl "http://localhost:8000/api/courses/?skip=0&limit=2"

# Verify response contains limited results
```

### 2. Test File Upload Streaming

#### Test Photo Upload
```bash
# Create a test image (or use any image file)
# Login first to get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123" \
  | jq -r '.access_token')

# Upload a photo
curl -X POST http://localhost:8000/api/uploads/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# Monitor server logs - should see chunked processing
```

**Test Memory Usage:**
```bash
# Monitor memory while uploading large file
# Before optimization: memory spike equal to file size
# After optimization: memory stays constant (streaming in 1MB chunks)

# Use a tool like htop or run:
watch -n 1 'ps aux | grep uvicorn | grep -v grep | awk "{print \$6}"'
```

#### Test Large File Rejection
```bash
# Try uploading a file larger than MAX_FILE_SIZE
# Should fail gracefully without consuming all memory

# Create a large test file (100MB)
dd if=/dev/zero of=large-file.jpg bs=1M count=100

curl -X POST http://localhost:8000/api/uploads/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large-file.jpg"

# Should return: {"detail": "File too large"}
# And the partial file should be cleaned up
```

### 3. Test RAG Embedding Optimization

```python
# Create test script: test_rag_performance.py
import time
from app.rag import get_embedder

embedder = get_embedder()
texts = ["sample text"] * 100

# Test encoding performance
start = time.time()
embeddings = embedder.encode(texts).tolist()
end = time.time()

print(f"Encoding time: {end - start:.3f}s")
print(f"Embeddings shape: {len(embeddings)} x {len(embeddings[0])}")
```

---

## Frontend Testing

### 1. Test React Component Memoization

#### Test with React DevTools Profiler

1. Install React DevTools browser extension
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000 in browser
4. Open React DevTools → Profiler tab
5. Start recording

**Test Dashboard Course Cards:**
```
1. Navigate to /dashboard
2. Click "Record" in Profiler
3. Hover over different UI elements (without clicking courses)
4. Stop recording
5. Check flamegraph - CourseCard components should NOT re-render
```

**Before optimization:** All course cards re-render on any state change  
**After optimization:** Only affected components re-render

**Test Chat Messages:**
```
1. Navigate to /courses/1
2. Record profiler
3. Send a new message
4. Stop recording
5. Check - only new MessageBubble should render, not all previous ones
```

### 2. Test 3D Avatar Performance

**Test Frame Rate:**
```javascript
// Open browser console on any page with avatar
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime >= lastTime + 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(measureFPS);
}

requestAnimationFrame(measureFPS);
```

**Expected Results:**
- **Before:** 30-45 FPS (with 64-segment spheres)
- **After:** 55-60 FPS (with 32-segment spheres)

**Visual Inspection:**
- Avatar should still look smooth (32 segments is sufficient for the size)
- No visible polygon edges
- Animations remain fluid

### 3. Test Image Optimization

**Test Next.js Image Loading:**

1. Navigate to /profile page
2. Open Network tab in DevTools
3. Clear cache and reload
4. Look for image requests

**Before optimization (raw `<img>`):**
- Original image size loaded
- No lazy loading
- No responsive sizing

**After optimization (Next.js `Image`):**
- Automatically optimized format (WebP if supported)
- Responsive sizes generated
- Lazy loading applied
- Smaller file size

### 4. Test useCallback Optimization

```javascript
// In browser console, check if handlers are stable
// Navigate to /profile

// Check if handlers maintain reference between renders
const profilePage = document.querySelector('[data-testid="profile"]');
// Handlers should not be recreated unless dependencies change
```

---

## Performance Benchmarking

### Backend Benchmark Script

Create `backend/benchmark.py`:
```python
import time
import requests
import statistics

BASE_URL = "http://localhost:8000"

def benchmark_endpoint(url, method="GET", data=None, headers=None, iterations=10):
    """Benchmark an API endpoint"""
    times = []
    
    for _ in range(iterations):
        start = time.time()
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        end = time.time()
        
        times.append(end - start)
    
    return {
        'mean': statistics.mean(times),
        'median': statistics.median(times),
        'min': min(times),
        'max': max(times),
        'stdev': statistics.stdev(times) if len(times) > 1 else 0
    }

# Test registration endpoint
print("Testing Registration Endpoint...")
results = benchmark_endpoint(
    f"{BASE_URL}/api/auth/register",
    method="POST",
    data={
        "email": f"bench{time.time()}@test.com",
        "username": f"bench{time.time()}",
        "full_name": "Benchmark User",
        "password": "test123"
    }
)
print(f"Mean: {results['mean']:.3f}s, Median: {results['median']:.3f}s")

# Test courses endpoint
print("\nTesting Courses Endpoint...")
results = benchmark_endpoint(f"{BASE_URL}/api/courses/")
print(f"Mean: {results['mean']:.3f}s, Median: {results['median']:.3f}s")
```

Run: `python backend/benchmark.py`

### Frontend Performance Metrics

```javascript
// Add to browser console
// Measure page load time
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page Load Metrics:');
  console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
  console.log(`Page Load: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
  console.log(`Total Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
});

// Measure component render time
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure'] });
```

---

## Integration Testing

### Full Workflow Test

```bash
#!/bin/bash
# test_workflow.sh

echo "=== Full Application Test ==="

# 1. Start backend
cd backend
uvicorn app.main:app &
BACKEND_PID=$!
sleep 5

# 2. Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 10

# 3. Run tests
echo "Testing registration..."
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"integration@test.com","username":"integrationtest","full_name":"Integration Test","password":"test123"}'

echo "Testing login..."
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=integration@test.com&password=test123" \
  | jq -r '.access_token')

echo "Testing courses..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/courses/

# 4. Cleanup
kill $BACKEND_PID $FRONTEND_PID
echo "=== Test Complete ==="
```

---

## Memory Leak Testing

### Test for Memory Leaks in File Uploads

```bash
# Test uploading multiple files and monitor memory
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/uploads/photo \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test-image.jpg"
  sleep 0.1
done

# Memory should remain stable (not grow with each upload)
```

### Frontend Memory Monitoring

```javascript
// Open browser console
// Monitor memory over time
setInterval(() => {
  if (performance.memory) {
    console.log(`Used: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`);
    console.log(`Total: ${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)}MB`);
  }
}, 5000);

// Navigate through pages and check if memory grows continuously
// Memory should stabilize, not grow indefinitely
```

---

## Visual Regression Testing

### Compare UI Before/After

Take screenshots of key pages:
1. Dashboard with multiple courses
2. Profile page with avatar
3. Course chat with multiple messages
4. Avatar animation

**Before changes:** Heavy re-renders visible as lag  
**After changes:** Smooth interactions

---

## Automated Testing Checklist

- [ ] Backend API endpoints return correct status codes
- [ ] Database queries are optimized (check query count)
- [ ] File uploads work with streaming
- [ ] Large files are rejected properly
- [ ] Frontend components memoize correctly
- [ ] 3D avatar maintains 60fps
- [ ] Images load optimized format
- [ ] No memory leaks over extended use
- [ ] Page load times improved
- [ ] Network requests reduced

---

## Common Issues & Solutions

### Issue: Backend won't start
**Solution:** Check database connection, ensure PostgreSQL is running

### Issue: Frontend build fails
**Solution:** Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Issue: Images not loading
**Solution:** Check `next.config.js` remotePatterns match your API URL

### Issue: Can't measure performance
**Solution:** Use Chrome DevTools → Performance tab, record profile

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Registration DB queries | 2 | 1 | 50% |
| Course check query time | O(n) | O(1) | Significant |
| File upload memory | Full file | 1MB chunks | ~90% |
| Avatar rendering FPS | 30-45 | 55-60 | ~30% |
| Component re-renders | 100% | 30-70% | 30-70% |
| Page load time | Baseline | -10-20% | 10-20% |

---

## Reporting Issues

If you find performance issues:
1. Document the exact steps to reproduce
2. Include browser/environment details
3. Provide performance metrics (screenshots, timings)
4. Check browser console for errors
5. Review network tab for slow requests

---

## Additional Resources

- [FastAPI Performance](https://fastapi.tiangolo.com/advanced/performance/)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/)
