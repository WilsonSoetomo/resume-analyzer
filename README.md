# AI Resume Grader

An intelligent resume analysis application that provides detailed feedback on resumes using AI-powered analysis. Built with FastAPI backend and React frontend.

## 🚀 Features

- **AI-Powered Analysis**: Get detailed feedback on your resume using GPT technology
- **File Upload Support**: Upload .txt and .pdf files directly
- **Real-time Analysis**: Instant feedback with detailed scoring
- **Keyword Analysis**: Identify relevant and missing keywords for ATS systems
- **Industry Alignment**: Assess how well your resume matches target industries
- **Dark Theme UI**: Modern, responsive interface with dark theme
- **Mock Data Fallback**: Works even when OpenAI API is unavailable

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI API**: AI-powered resume analysis
- **Pinecone**: Vector database for similarity search
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization components

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key
- Pinecone API key (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd AI-Resume-Grader
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration (optional)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# Security
SECRET_KEY=your_secret_key_here
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Run the Application

**Start the Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```
Backend will be available at: http://localhost:8000

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be available at: http://localhost:5173

## 📁 Project Structure

```
AI-Resume-Grader/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── models/
│   │   │   └── resume.py
│   │   ├── services/
│   │   │   ├── openai_service.py
│   │   │   └── pinecone_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FeedbackDisplay.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ResumeAnalyzer.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── start.sh
```

## 🔧 API Endpoints

- `GET /health` - Health check
- `POST /api/v1/analyze` - Analyze resume
- `GET /api/v1/similar/{analysis_id}` - Find similar resumes
- `GET /api/v1/feedback/{analysis_id}` - Get feedback
- `DELETE /api/v1/{analysis_id}` - Delete analysis
- `GET /api/v1/stats` - Get statistics

## 🎯 Features in Detail

### Resume Analysis
- **Overall Score**: Comprehensive resume rating
- **Technical Clarity**: Assessment of technical content
- **Impact Phrasing**: Evaluation of achievement descriptions
- **Structure & Format**: Layout and organization analysis
- **Keyword Analysis**: ATS optimization feedback
- **Industry Alignment**: Target industry matching

### File Upload
- **Text Files**: Direct .txt file support
- **PDF Files**: Basic text extraction from PDFs
- **Manual Input**: Paste resume content directly
- **Error Handling**: Graceful fallbacks for unsupported formats

### Mock Data Mode
When OpenAI API is unavailable, the system provides intelligent mock analysis based on actual resume content:
- Keyword detection and analysis
- Content-based scoring
- Personalized suggestions
- Realistic feedback generation

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Pinecone for vector database services
- The open-source community for various libraries and tools

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Note**: This application uses mock data when OpenAI API quota is exceeded, ensuring it remains functional for testing and demonstration purposes. 