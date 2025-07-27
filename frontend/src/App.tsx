import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import ResumeAnalyzer from './components/ResumeAnalyzer'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ResumeAnalyzer setIsLoading={setIsLoading} />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-center">Analyzing your resume...</p>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App
