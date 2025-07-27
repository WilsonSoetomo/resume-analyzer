import { Link } from 'react-router-dom'
import { Brain, BarChart3 } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <h1 className="text-2xl font-bold">AI Resume Grader</h1>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Analyze Resume
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-1 hover:text-blue-200 transition-colors duration-200"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 