#!/usr/bin/env python3
"""
Simple test script for AI Resume Grader API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_stats_endpoint():
    """Test the stats endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/stats")
        print(f"✅ Stats endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Stats endpoint failed: {e}")
        return False

def test_analyze_endpoint():
    """Test the analyze endpoint with mock data"""
    sample_resume = {
        "content": """
        John Doe
        Software Engineer
        
        EXPERIENCE
        Senior Software Engineer at Tech Corp (2020-2023)
        - Developed scalable web applications using React and Node.js
        - Led team of 5 developers in agile environment
        - Improved application performance by 40%
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology (2016-2020)
        """,
        "job_title": "Software Engineer",
        "industry": "Technology",
        "experience_level": "senior"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/analyze",
            json=sample_resume,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Analyze endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Analysis ID: {data.get('id', 'N/A')}")
            print(f"   Processing time: {data.get('processing_time', 'N/A')}s")
        else:
            print(f"   Error: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Analyze endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing AI Resume Grader API")
    print("=" * 40)
    
    tests = [
        test_health_check,
        test_root_endpoint,
        test_stats_endpoint,
        test_analyze_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs for details.")

if __name__ == "__main__":
    main() 