#!/usr/bin/env python3
"""
Test script to check backend functionality
"""

import requests
import json
import time

def test_backend():
    print("🧪 Backend Connection Test")
    print("=" * 40)
    
    # Test 1: Health check
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and responding")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend (not running)")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False
    
    # Test 2: Simple resume analysis
    print("\n📝 Testing resume analysis...")
    
    test_resume = {
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
            "http://localhost:8000/api/v1/analyze",
            json=test_resume,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Resume analysis successful!")
            print(f"   Analysis ID: {data.get('id', 'N/A')}")
            print(f"   Processing time: {data.get('processing_time', 'N/A')}s")
            
            if 'feedback' in data:
                feedback = data['feedback']
                print(f"   Overall score: {feedback.get('overall_score', 'N/A')}")
                print(f"   Suggestions: {len(feedback.get('suggestions', []))} items")
            
        else:
            print(f"❌ Analysis failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Analysis request timed out (took too long)")
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
    
    return True

if __name__ == "__main__":
    test_backend() 