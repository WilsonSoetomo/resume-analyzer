#!/usr/bin/env python3
"""
Debug script to check environment configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_env():
    print("🔍 Environment Configuration Check")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ .env file exists")
    else:
        print(f"❌ .env file not found")
        return
    
    # Check required environment variables
    required_vars = [
        "OPENAI_API_KEY",
        "PINECONE_API_KEY", 
        "PINECONE_ENVIRONMENT",
        "SECRET_KEY"
    ]
    
    print("\n📋 Environment Variables:")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Show first 10 characters and last 4 characters for security
            masked_value = value[:10] + "..." + value[-4:] if len(value) > 14 else "***"
            print(f"✅ {var}: {masked_value}")
        else:
            print(f"❌ {var}: NOT SET")
    
    # Check if values look valid
    print("\n🔧 Validation:")
    
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if openai_key.startswith("sk-"):
        print("✅ OpenAI API key format looks correct")
    else:
        print("❌ OpenAI API key format may be incorrect (should start with 'sk-')")
    
    pinecone_key = os.getenv("PINECONE_API_KEY", "")
    if len(pinecone_key) > 20:
        print("✅ Pinecone API key length looks correct")
    else:
        print("❌ Pinecone API key may be too short")
    
    pinecone_env = os.getenv("PINECONE_ENVIRONMENT", "")
    if pinecone_env:
        print(f"✅ Pinecone environment: {pinecone_env}")
    else:
        print("❌ Pinecone environment not set")
    
    secret_key = os.getenv("SECRET_KEY", "")
    if len(secret_key) > 20:
        print("✅ Secret key length looks secure")
    else:
        print("❌ Secret key may be too short")

if __name__ == "__main__":
    check_env() 