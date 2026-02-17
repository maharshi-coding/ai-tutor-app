#!/bin/bash
#
# Quick Test Script for Performance Improvements
# Run with: ./quick_test.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the ai-tutor-app root directory"
    exit 1
fi

print_header "AI Tutor Performance Testing Quick Start"

# Backend tests
print_header "Backend Tests"

print_info "Checking Python environment..."
if command -v python3 &> /dev/null; then
    print_success "Python3 found: $(python3 --version)"
else
    print_error "Python3 not found. Please install Python 3.9+"
    exit 1
fi

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

print_info "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
print_info "Checking dependencies..."
if pip show fastapi &> /dev/null; then
    print_success "Dependencies already installed"
else
    print_warning "Installing dependencies..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
fi

# Check if backend is running
print_info "Checking if backend server is running..."
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    print_success "Backend server is running"
    
    print_info "Running performance tests..."
    python test_performance.py
else
    print_warning "Backend server is not running"
    print_info "To start the server, run:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload"
    echo ""
    print_info "Then run this script again or run tests manually:"
    echo "  python backend/test_performance.py"
fi

cd ..

# Frontend tests
print_header "Frontend Tests"

print_info "Checking Node.js environment..."
if command -v node &> /dev/null; then
    print_success "Node.js found: $(node --version)"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Installing..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

print_info "Running frontend performance checks..."
node test_performance.js

cd ..

# Summary
print_header "Testing Summary"

print_success "Quick tests completed!"
print_info "For detailed testing, see TESTING.md"
echo ""
print_info "Manual testing steps:"
echo "  1. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Open http://localhost:3000 in browser"
echo "  4. Test registration, course loading, avatar rendering"
echo "  5. Use React DevTools Profiler to verify memoization"
echo "  6. Monitor browser console for FPS metrics"
echo ""
print_success "Performance improvements implemented:"
echo "  • Backend: N+1 query fix, pagination, streaming uploads"
echo "  • Frontend: React.memo, reduced 3D polygons, Next.js Image"
echo ""
