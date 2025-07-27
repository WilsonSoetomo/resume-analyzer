import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react'

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

interface FeedbackDisplayProps {
  feedback: ResumeFeedback
}

const FeedbackDisplay = ({ feedback }: FeedbackDisplayProps) => {
  const scoreData = [
    { name: 'Technical Clarity', value: feedback.technical_clarity, color: '#3B82F6' },
    { name: 'Impact & Phrasing', value: feedback.impact_phrasing, color: '#8B5CF6' },
    { name: 'Structure & Format', value: feedback.structure_format, color: '#10B981' },
    { name: 'Industry Alignment', value: feedback.industry_alignment, color: '#F59E0B' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
          <Target className="h-5 w-5 mr-2" />
          Overall Score
        </h2>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
            {feedback.overall_score}/100
          </div>
          <div className={`text-lg font-medium ${getScoreColor(feedback.overall_score)}`}>
            {getScoreLabel(feedback.overall_score)}
          </div>
        </div>
      </div>

      {/* Score Breakdown Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Score Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis domain={[0, 100]} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
          <CheckCircle className="h-5 w-5 mr-2" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {feedback.strengths.map((strength, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          Areas for Improvement
        </h3>
        <ul className="space-y-2">
          {feedback.areas_for_improvement.map((area, index) => (
            <li key={index} className="flex items-start">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{area}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-400">
          <TrendingUp className="h-5 w-5 mr-2" />
          Suggestions
        </h3>
        <ul className="space-y-2">
          {feedback.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Keyword Analysis */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Keyword Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-400 mb-2">Relevant Keywords Found</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.keyword_analysis.relevant_keywords.map((keyword, index) => (
                <span key={index} className="bg-green-900 text-green-200 px-2 py-1 rounded-full text-sm border border-green-700">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-red-400 mb-2">Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.keyword_analysis.missing_keywords.map((keyword, index) => (
                <span key={index} className="bg-red-900 text-red-200 px-2 py-1 rounded-full text-sm border border-red-700">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Keyword Density</span>
            <span className="text-sm font-bold text-white">{Math.round(feedback.keyword_analysis.keyword_density * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${feedback.keyword_analysis.keyword_density * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackDisplay 