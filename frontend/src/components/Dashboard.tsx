import { useState, useEffect } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Target } from 'lucide-react'
import axios from 'axios'

interface DashboardStats {
  total_analyses: number
  average_score: number
  user_satisfaction: number
  processing_time_avg: number
  top_industries: string[]
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/stats')
        setStats(response.data as DashboardStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Use mock data for demo
        setStats({
          total_analyses: 1250,
          average_score: 78.5,
          user_satisfaction: 92.0,
          processing_time_avg: 2.3,
          top_industries: ['Technology', 'Finance', 'Healthcare', 'Consulting']
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const scoreDistribution = [
    { name: '90-100', value: 25, color: '#10B981' },
    { name: '80-89', value: 35, color: '#3B82F6' },
    { name: '70-79', value: 25, color: '#F59E0B' },
    { name: '60-69', value: 15, color: '#EF4444' }
  ]

  const monthlyAnalyses = [
    { month: 'Jan', analyses: 120 },
    { month: 'Feb', analyses: 150 },
    { month: 'Mar', analyses: 180 },
    { month: 'Apr', analyses: 200 },
    { month: 'May', analyses: 220 },
    { month: 'Jun', analyses: 250 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        <p>Unable to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h1>
        <p className="text-gray-300">Real-time insights into resume analysis performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Analyses</p>
              <p className="text-2xl font-bold text-white">{stats.total_analyses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-white">{stats.average_score}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">User Satisfaction</p>
              <p className="text-2xl font-bold text-white">{stats.user_satisfaction}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Processing Time</p>
              <p className="text-2xl font-bold text-white">{stats.processing_time_avg}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Analyses Trend */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Monthly Analyses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAnalyses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }} />
                <Line type="monotone" dataKey="analyses" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Industries */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Top Industries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.top_industries.map((industry, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-200">{industry}</span>
                <span className="text-sm text-gray-400">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div>
              <p className="font-medium text-gray-200">Software Engineer Resume Analyzed</p>
              <p className="text-sm text-gray-400">Score: 87/100 • 2 minutes ago</p>
            </div>
            <span className="text-green-400 font-medium">Good</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div>
              <p className="font-medium text-gray-200">Data Scientist Resume Analyzed</p>
              <p className="text-sm text-gray-400">Score: 92/100 • 5 minutes ago</p>
            </div>
            <span className="text-green-400 font-medium">Excellent</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div>
              <p className="font-medium text-gray-200">Marketing Manager Resume Analyzed</p>
              <p className="text-sm text-gray-400">Score: 78/100 • 8 minutes ago</p>
            </div>
            <span className="text-yellow-400 font-medium">Fair</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 