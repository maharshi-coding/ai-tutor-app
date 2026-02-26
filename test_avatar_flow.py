#!/usr/bin/env python3
"""
Test script to verify avatar generation and display pipeline
Run with: python test_avatar_flow.py
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_avatar_flow():
    print("="*60)
    print("Avatar Generation Flow Test")
    print("="*60)
    
    # Step 1: Register/Login
    print("\n1. Testing user authentication...")
    timestamp = int(time.time() * 1000)
    test_email = f"avatartest{timestamp}@test.com"
    test_password = "testpass123"
    
    # Register
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "username": f"avatartest{timestamp}",
                "full_name": "Avatar Test User",
                "password": test_password
            }
        )
        print(f"✓ Registration: {response.status_code}")
    except Exception as e:
        print(f"✗ Registration failed: {e}")
        return
    
    # Login
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": test_email, "password": test_password}
        )
        token = response.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✓ Login successful, token obtained")
    except Exception as e:
        print(f"✗ Login failed: {e}")
        return
    
    # Step 2: Check initial avatar config
    print("\n2. Checking initial avatar config...")
    try:
        response = requests.get(f"{BASE_URL}/api/uploads/avatar-config", headers=headers)
        config = response.json()
        print(f"✓ Initial config: {json.dumps(config, indent=2)}")
        print(f"  has_photo: {config.get('has_photo')}")
        print(f"  character_image_url: {config.get('character_image_url')}")
    except Exception as e:
        print(f"✗ Failed to get avatar config: {e}")
        return
    
    # Step 3: Check if static file serving works
    print("\n3. Testing static file serving...")
    try:
        response = requests.get(f"{BASE_URL}/uploads/", timeout=2)
        if response.status_code == 404:
            print("✓ Static files endpoint exists (404 for empty dir is ok)")
        elif response.status_code == 200:
            print("✓ Static files endpoint accessible")
        else:
            print(f"⚠ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"✗ Static file serving issue: {e}")
    
    # Step 4: Test avatar generation endpoint (will fail without photo, but tests the endpoint)
    print("\n4. Testing avatar generation endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/uploads/avatar/generate-character",
            headers=headers
        )
        if response.status_code == 400:
            print(f"✓ Endpoint exists (400 expected without photo)")
            print(f"  Message: {response.json().get('detail')}")
        elif response.status_code == 200:
            result = response.json()
            print(f"✓ Avatar generated!")
            print(f"  character_image_url: {result.get('character_image_url')}")
            
            # Step 5: Verify the image is accessible
            if result.get('character_image_url'):
                image_url = f"{BASE_URL}{result.get('character_image_url')}"
                print(f"\n5. Testing image accessibility...")
                print(f"  Image URL: {image_url}")
                img_response = requests.get(image_url)
                print(f"  Image status: {img_response.status_code}")
                if img_response.status_code == 200:
                    print(f"  Image size: {len(img_response.content)} bytes")
                    print(f"  Content-Type: {img_response.headers.get('content-type')}")
                    print("✓ Image is accessible!")
                else:
                    print(f"✗ Image not accessible: {img_response.status_code}")
            
            # Step 6: Re-fetch avatar config
            print(f"\n6. Verifying avatar config after generation...")
            response = requests.get(f"{BASE_URL}/api/uploads/avatar-config", headers=headers)
            config = response.json()
            print(f"✓ Updated config: {json.dumps(config, indent=2)}")
            if config.get('character_image_url'):
                print("✓ character_image_url is set in config")
            else:
                print("✗ character_image_url is missing!")
        else:
            print(f"⚠ Unexpected status: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"✗ Avatar generation test failed: {e}")
    
    print("\n" + "="*60)
    print("Test Complete")
    print("="*60)
    
    print("\nNOTE: To fully test avatar generation, you need to:")
    print("  1. Upload a photo first using /api/uploads/photo")
    print("  2. Configure REPLICATE_API_TOKEN or SD_API_URL in .env")
    print("  3. Then call /api/uploads/avatar/generate-character")

if __name__ == "__main__":
    try:
        test_avatar_flow()
    except KeyboardInterrupt:
        print("\n\nTest interrupted")
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
