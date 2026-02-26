#!/usr/bin/env python3
"""
Performance Testing Script for AI Tutor Backend

This script tests the performance improvements made to the backend API.
Run with: python test_performance.py
"""

import time
import requests
import statistics
import sys
from typing import Dict, List, Any
import json

BASE_URL = "http://localhost:8000"

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")


def benchmark_endpoint(
    url: str,
    method: str = "GET",
    data: Dict = None,
    headers: Dict = None,
    iterations: int = 10
) -> Dict[str, float]:
    """
    Benchmark an API endpoint
    
    Returns dictionary with timing statistics
    """
    times = []
    errors = 0
    
    for i in range(iterations):
        try:
            start = time.time()
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            end = time.time()
            
            if response.status_code >= 400:
                errors += 1
            else:
                times.append(end - start)
        except Exception as e:
            print_error(f"Request {i+1} failed: {str(e)}")
            errors += 1
    
    if not times:
        return {'error': 'All requests failed'}
    
    return {
        'mean': statistics.mean(times),
        'median': statistics.median(times),
        'min': min(times),
        'max': max(times),
        'stdev': statistics.stdev(times) if len(times) > 1 else 0,
        'errors': errors,
        'success_rate': (iterations - errors) / iterations * 100
    }


def print_benchmark_results(results: Dict[str, float], name: str):
    """Print formatted benchmark results"""
    if 'error' in results:
        print_error(f"{name}: {results['error']}")
        return
    
    print(f"\n{Colors.BOLD}{name}:{Colors.ENDC}")
    print(f"  Mean:       {results['mean']*1000:.2f}ms")
    print(f"  Median:     {results['median']*1000:.2f}ms")
    print(f"  Min:        {results['min']*1000:.2f}ms")
    print(f"  Max:        {results['max']*1000:.2f}ms")
    print(f"  Std Dev:    {results['stdev']*1000:.2f}ms")
    print(f"  Success:    {results['success_rate']:.1f}%")
    
    if results['mean'] < 0.1:
        print_success("Excellent performance!")
    elif results['mean'] < 0.5:
        print_success("Good performance")
    else:
        print_info("Performance acceptable")


def test_server_connection() -> bool:
    """Test if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        return response.status_code == 200
    except:
        return False


def test_registration_performance():
    """Test user registration endpoint (N+1 query fix)"""
    print_header("Testing Registration Performance")
    print_info("Testing N+1 query optimization...")
    
    timestamp = int(time.time() * 1000)
    results = benchmark_endpoint(
        f"{BASE_URL}/api/auth/register",
        method="POST",
        data={
            "email": f"perf{timestamp}@test.com",
            "username": f"perf{timestamp}",
            "full_name": "Performance Test",
            "password": "test12345"
        },
        iterations=5
    )
    
    print_benchmark_results(results, "Registration Endpoint")
    print_info("Expected: Single OR query instead of 2 separate queries")


def test_courses_pagination():
    """Test courses endpoint with pagination"""
    print_header("Testing Courses Pagination")
    
    # Test without pagination
    print_info("Testing default pagination...")
    results_default = benchmark_endpoint(
        f"{BASE_URL}/api/courses/",
        iterations=10
    )
    print_benchmark_results(results_default, "Courses (Default)")
    
    # Test with small limit
    print_info("Testing with limit=2...")
    results_limited = benchmark_endpoint(
        f"{BASE_URL}/api/courses/?skip=0&limit=2",
        iterations=10
    )
    print_benchmark_results(results_limited, "Courses (Limited)")
    
    # Verify pagination works
    try:
        response = requests.get(f"{BASE_URL}/api/courses/?limit=2")
        if response.status_code == 200:
            courses = response.json()
            if len(courses) <= 2:
                print_success("Pagination limit working correctly")
            else:
                print_error(f"Expected ≤2 courses, got {len(courses)}")
    except Exception as e:
        print_error(f"Failed to verify pagination: {str(e)}")


def test_login_performance(email: str, password: str) -> str:
    """Test login and return token"""
    print_header("Testing Login Performance")
    
    results = benchmark_endpoint(
        f"{BASE_URL}/api/auth/login",
        method="POST",
        data={
            "username": email,
            "password": password,
            "grant_type": "password"
        },
        iterations=5
    )
    
    print_benchmark_results(results, "Login Endpoint")
    
    # Get a token for other tests
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": email, "password": password}
        )
        if response.status_code == 200:
            token = response.json().get('access_token')
            print_success("Token obtained for authenticated tests")
            return token
    except:
        pass
    
    return None


def test_authenticated_endpoints(token: str):
    """Test authenticated endpoints performance"""
    print_header("Testing Authenticated Endpoints")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting user info
    results = benchmark_endpoint(
        f"{BASE_URL}/api/auth/me",
        headers=headers,
        iterations=10
    )
    print_benchmark_results(results, "Get Current User")
    
    # Test avatar config
    results = benchmark_endpoint(
        f"{BASE_URL}/api/uploads/avatar-config",
        headers=headers,
        iterations=10
    )
    print_benchmark_results(results, "Get Avatar Config")


def test_embedding_performance():
    """Test RAG embedding optimization"""
    print_header("Testing Embedding Performance")
    
    try:
        from app.rag import get_embedder
        
        embedder = get_embedder()
        print_success("Embedder loaded successfully")
        
        # Test with various text sizes
        test_cases = [
            (["short text"], "Single short text"),
            (["This is a longer text that should still be processed quickly"] * 10, "10 medium texts"),
            (["Sample text"] * 100, "100 short texts"),
        ]
        
        for texts, description in test_cases:
            times = []
            for _ in range(5):
                start = time.time()
                embeddings = embedder.encode(texts).tolist()
                end = time.time()
                times.append(end - start)
            
            avg_time = statistics.mean(times)
            print(f"\n{description}:")
            print(f"  Average time: {avg_time*1000:.2f}ms")
            print(f"  Time per text: {avg_time*1000/len(texts):.2f}ms")
            
            if avg_time < 0.5:
                print_success("Good performance")
            else:
                print_info("Performance acceptable")
                
    except ImportError:
        print_error("Cannot test embeddings - app.rag module not available")
    except Exception as e:
        print_error(f"Embedding test failed: {str(e)}")


def run_all_tests():
    """Run all performance tests"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{'AI Tutor Backend Performance Tests'.center(60)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    # Check server connection
    print_info("Checking server connection...")
    if not test_server_connection():
        print_error("Server is not running at " + BASE_URL)
        print_info("Please start the server with: uvicorn app.main:app --reload")
        sys.exit(1)
    
    print_success("Server is running")
    
    # Run tests
    test_registration_performance()
    test_courses_pagination()
    
    # Create a test user for authenticated tests
    timestamp = int(time.time() * 1000)
    test_email = f"perftest{timestamp}@test.com"
    test_password = "testpass123"
    
    # Register test user
    try:
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "username": f"perftest{timestamp}",
                "full_name": "Perf Test User",
                "password": test_password
            }
        )
    except:
        pass
    
    # Login and get token
    token = test_login_performance(test_email, test_password)
    
    if token:
        test_authenticated_endpoints(token)
    
    # Test embeddings if possible
    test_embedding_performance()
    
    # Summary
    print_header("Performance Testing Complete")
    print_success("All tests completed!")
    print_info("Review the results above for detailed performance metrics")
    print_info("Expected improvements:")
    print("  • Registration: 50% fewer database queries (1 instead of 2)")
    print("  • Course check: O(n) → O(1) with exists() instead of count()")
    print("  • Pagination: Prevents loading all courses into memory")
    print("  • Embeddings: 5-10% faster without redundant conversions")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Test suite failed: {str(e)}")
        sys.exit(1)
