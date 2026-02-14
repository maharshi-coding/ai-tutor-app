# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings:
# - DATABASE_URL:
#   - SQLite (default, easiest): sqlite:///./ai_tutor.db
#   - Postgres (advanced): postgresql://user:password@localhost:5432/ai_tutor_db
# - SECRET_KEY: Generate a random secret key
# - OPENAI_API_KEY: (Optional) Your OpenAI API key

# If using Postgres, create the database:
# createdb ai_tutor_db
# Or using psql:
# psql -U postgres
# CREATE DATABASE ai_tutor_db;

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## First Steps

1. **Register an account** at http://localhost:3000/register
2. **Upload your photo** in the Profile page
3. **Upload a voice sample** (optional but recommended)
4. **Select a course** from the Dashboard
5. **Start learning** by chatting with your AI tutor!

## Troubleshooting

### Database Connection Issues
- If using Postgres: ensure PostgreSQL is running and `DATABASE_URL` is correct
- If you don't want Postgres: set `DATABASE_URL=sqlite:///./ai_tutor.db` in `backend/.env`

### Port Already in Use
- Backend: Change PORT in .env or use `--port` flag
- Frontend: Change port in package.json scripts or use `-p 3001`

### CORS Issues
- Ensure frontend URL is in backend CORS origins (app/main.py)
- Check NEXT_PUBLIC_API_URL matches backend URL

### File Upload Issues
- Ensure uploads directory exists: `mkdir -p backend/uploads/photos backend/uploads/voices`
- Check file size limits in backend/app/config.py

## Production Deployment

### Backend
1. Set proper SECRET_KEY
2. Use production database
3. Configure CORS for your domain
4. Use a production ASGI server (e.g., Gunicorn + Uvicorn workers)

### Frontend
1. Build: `npm run build`
2. Set production API URL in environment variables
3. Deploy to Vercel, Netlify, or your preferred hosting

## Environment Variables Reference

### Backend (.env)
- `DATABASE_URL` - Database URL (SQLite or PostgreSQL)
- `SECRET_KEY` - JWT secret key (generate with: `openssl rand -hex 32`)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration (default: 30)
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `HUGGINGFACE_API_KEY` - Hugging Face API key (optional)
- `UPLOAD_DIR` - Upload directory path (default: ./uploads)
- `MAX_FILE_SIZE` - Max file size in bytes (default: 10485760 = 10MB)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
