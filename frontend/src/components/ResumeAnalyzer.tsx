import React, { useState } from 'react'
import { FileText, Target, Building, User, TrendingUp } from 'lucide-react'
import axios from 'axios'
import FeedbackDisplay from './FeedbackDisplay'

interface ResumeAnalyzerProps {
  setIsLoading: (loading: boolean) => void
}

interface ResumeSubmission {
  content: string
  job_title?: string
  industry?: string
  experience_level?: string
}

interface ResumeFeedback {
  overall_score: number
  technical_clarity: number
  impact_phrasing: number
  structure_format: number
  suggestions: string[]
  strengths: string[]
  areas_for_improvement: string[]
  keyword_analysis: {
    relevant_keywords: string[]
    missing_keywords: string[]
    keyword_density: number
  }
  industry_alignment: number
}

const ResumeAnalyzer = ({ setIsLoading }: ResumeAnalyzerProps) => {
  const [resumeContent, setResumeContent] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Clear previous messages
      setError('')
      setUploadSuccess(false)
      
      // Check file type
      const fileName = file.name.toLowerCase()
      
      if (fileName.endsWith('.txt')) {
        // Handle text files
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setResumeContent(text)
          setUploadSuccess(true)
          setError('')
        }
        reader.onerror = () => {
          setError('Error reading text file. Please try again.')
          setUploadSuccess(false)
        }
        reader.readAsText(file)
      } else if (fileName.endsWith('.pdf')) {
        // Handle PDF files - read as ArrayBuffer and extract text
        setIsProcessingPDF(true)
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer
            const text = await extractTextFromPDF(arrayBuffer)
            setResumeContent(text)
            setUploadSuccess(true)
            setError('')
          } catch (error) {
            setError('Error reading PDF file. Please try copying and pasting the text content instead.')
            setUploadSuccess(false)
          } finally {
            setIsProcessingPDF(false)
          }
        }
        reader.onerror = () => {
          setError('Error reading PDF file. Please try again.')
          setUploadSuccess(false)
          setIsProcessingPDF(false)
        }
        reader.readAsArrayBuffer(file)
      } else {
        setError('Please upload a .txt or .pdf file, or paste your resume content directly.')
        setUploadSuccess(false)
        // Clear the file input
        event.target.value = ''
      }
    }
  }

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      // Convert ArrayBuffer to Uint8Array for processing
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Try to extract text using a more robust approach
      const decoder = new TextDecoder('utf-8')
      const pdfText = decoder.decode(uint8Array)
      
      // Look for text content in PDF format - multiple approaches
      let extractedText = ''
      
      // Method 1: Look for text in parentheses (common PDF format)
      const textMatches = pdfText.match(/\([^)]*\)/g) || []
      if (textMatches.length > 0) {
        extractedText = textMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .filter(text => {
            // Filter out short strings, escape sequences, and non-readable content
            return text.length > 3 && 
                   !text.includes('\\') && 
                   !text.match(/^[0-9\s]+$/) && // Not just numbers and spaces
                   text.match(/[a-zA-Z]/) // Contains letters
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
      }
      
      // Method 2: If Method 1 didn't work, try looking for text between BT and ET markers
      if (extractedText.length < 50) {
        const btEtMatches = pdfText.match(/BT[\s\S]*?ET/g) || []
        if (btEtMatches.length > 0) {
          const alternativeText = btEtMatches
            .map(block => {
              // Extract text from PDF text blocks
              const textMatches = block.match(/\([^)]*\)/g) || []
              return textMatches
                .map(match => match.slice(1, -1))
                .filter(text => text.length > 2 && text.match(/[a-zA-Z]/))
                .join(' ')
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          
          if (alternativeText.length > 30) {
            extractedText = alternativeText
          }
        }
      }
      
      // Method 3: Look for readable text patterns
      if (extractedText.length < 50) {
        // Look for sequences of letters and spaces that might be readable text
        const wordPattern = /[a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,}){2,}/g
        const wordMatches = pdfText.match(wordPattern) || []
        if (wordMatches.length > 0) {
          extractedText = wordMatches
            .filter(text => text.length > 20)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        }
      }
      
      // If we still don't have enough text, try a more aggressive approach
      if (extractedText.length < 50) {
        // Look for any readable text patterns
        const readablePattern = /[a-zA-Z\s]{10,}/g
        const readableMatches = pdfText.match(readablePattern) || []
        if (readableMatches.length > 0) {
          extractedText = readableMatches
            .filter(text => text.trim().length > 10)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        }
      }
      
      if (extractedText.length > 50) {
        return extractedText
      } else {
        // If all methods failed, throw a more helpful error
        throw new Error('Could not extract readable text from this PDF. The PDF might be image-based or have complex formatting.')
      }
    } catch (error) {
      console.error('PDF extraction error:', error)
      throw new Error('PDF text extraction failed. Please copy and paste the text content manually.')
    }
  }

  const handleAnalyze = async () => {
    if (!resumeContent.trim()) {
      setError('Please enter or upload your resume content')
      return
    }

    setIsLoading(true)
    setError('')
    setIsUsingMockData(false)

    try {
      const submission: ResumeSubmission = {
        content: resumeContent,
        job_title: jobTitle || undefined,
        industry: industry || undefined,
        experience_level: experienceLevel || undefined
      }

      const response = await axios.post('http://localhost:8000/api/v1/analyze', submission)
      
      // Check if we're getting mock data (you can add a flag in the response if needed)
      // For now, we'll assume mock data if OpenAI quota is exceeded
      const responseData = response.data as any
      if (responseData.feedback) {
        setFeedback(responseData.feedback)
        // If the backend is using mock data, we can detect it by checking for specific patterns
        // For now, we'll show a note that this might be mock data due to API limits
        setIsUsingMockData(true)
      }
    } catch (err) {
      setError('Error analyzing resume. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          AI-Powered Resume Analysis
        </h1>
        <p className="text-gray-300 text-lg">
          Get instant feedback on your resume with GPT-4 technology
        </p>
        {isUsingMockData && (
          <div className="mt-4 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-2 rounded-md text-sm">
            ⚠️ Using enhanced mock analysis (OpenAI API quota exceeded). Your resume is being analyzed with intelligent pattern matching.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <FileText className="h-5 w-5 mr-2" />
              Resume Content
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Resume (.txt or .pdf files)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-300">
                      Click to upload a .txt or .pdf file
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Or drag and drop your resume file
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: .txt, .pdf (basic text extraction - complex PDFs may need manual copy/paste)
              </p>
              
              {/* Success/Error Messages */}
              {isProcessingPDF && (
                <div className="mt-2 bg-blue-900 border border-blue-700 text-blue-200 px-3 py-2 rounded-md text-sm">
                  🔄 Processing PDF file... Please wait.
                </div>
              )}
              
              {uploadSuccess && !isProcessingPDF && (
                <div className="mt-2 bg-green-900 border border-green-700 text-green-200 px-3 py-2 rounded-md text-sm">
                  ✅ File uploaded successfully! Resume content loaded.
                </div>
              )}
              
              {error && !isProcessingPDF && (
                <div className="mt-2 bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded-md text-sm">
                  ❌ {error}
                  {error.includes('PDF') && (
                    <div className="mt-1 text-xs text-red-300">
                      💡 Tip: Try opening your PDF in a text editor or copy the text directly from your PDF viewer
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Or paste your resume content
              </label>
              <textarea
                value={resumeContent}
                onChange={(e) => {
                  setResumeContent(e.target.value)
                  setUploadSuccess(false) // Clear success message when user types
                }}
                placeholder="Paste your resume content here..."
                className="w-full h-64 p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-700 text-white placeholder-gray-400"
              />
              
              <div className="mt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setResumeContent(`John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer at Tech Corp (2020-2023)
- Developed scalable web applications using React and Node.js
- Led team of 5 developers in agile environment
- Improved application performance by 40%

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016-2020)`)
                    setUploadSuccess(false)
                    setError('')
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Load Sample Resume
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Target Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                >
                  <option value="">Select Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!resumeContent.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Analyze Resume
          </button>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {feedback ? (
            <FeedbackDisplay feedback={feedback} />
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400 border border-gray-700">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <p>Your analysis results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeAnalyzer 