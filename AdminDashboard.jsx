import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Tag, Zap, DollarSign, UserPlus, PlusCircle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Dashboard = () => {
  const { tokens, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication and admin access
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is admin/staff (you'll need to add this to your user object)
    // if (user && !user.is_staff && !user.is_superuser) {
    //   alert('You do not have admin access');
    //   navigate('/');
    //   return;
    // }

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [metricsRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/admin/reports/'),
        axiosInstance.get('/admin/analytics/')
      ]);

      setMetrics(metricsRes.data);
      setAnalytics(analyticsRes.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 text-lg mb-2">Error Loading Dashboard</h3>
              <p className="text-red-800 text-sm mb-4">{error}</p>
              
              <div className="bg-red-100 rounded p-4 mb-4">
                <p className="text-red-900 text-xs font-semibold mb-2">Troubleshooting:</p>
                <ul className="text-red-800 text-xs space-y-1 list-disc list-inside">
                  <li>Make sure Django admin API endpoints are configured</li>
                  <li>Check: <code className="bg-red-200 px-1 rounded">/api/admin/reports/</code></li>
                  <li>Check: <code className="bg-red-200 px-1 rounded">/api/admin/analytics/</code></li>
                  <li>Verify you have admin/staff permissions</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-semibold"
                >
                  Retry
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value.toLocaleString()}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Last 7 days
            </button>
            <button onClick={fetchDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="Total Users"
            value={metrics?.total_users || 0}
            trend={12.5}
            color="bg-blue-500"
          />
          <MetricCard
            icon={Tag}
            title="Total Auctions"
            value={metrics?.total_auctions || 0}
            trend={-8.1}
            color="bg-purple-500"
          />
          <MetricCard
            icon={Zap}
            title="Active Auctions"
            value={metrics?.active_auctions || 0}
            trend={3.2}
            color="bg-green-500"
          />
          <MetricCard
            icon={BarChart3}
            title="Total Bids"
            value={metrics?.total_bids || 0}
            trend={15.7}
            color="bg-orange-500"
          />
          <MetricCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${(metrics?.total_revenue || 0) / 1000000}M`}
            trend={10.3}
            color="bg-green-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              <UserPlus className="w-5 h-5" />
              Manage Users
            </button>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <PlusCircle className="w-5 h-5" />
              Create New Auction
            </button>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Tag className="w-5 h-5" />
              Review Bids
            </button>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <BarChart3 className="w-5 h-5" />
              View Analytics Report
            </button>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold mb-6">Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bids per Day */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4">Bids per Day (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics?.bids_per_day || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Auctions by Category */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Auctions by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics?.auctions_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category__name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.revenue_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { text: 'Admin John Doe created a new auction: "Vintage Camera Collection"', time: '2 minutes ago' },
              { text: 'User Jane Smith placed a bid on "Rare Comic Book"', time: '15 minutes ago' },
              { text: 'Auction "Modern Art Piece" closed successfully', time: '1 hour ago' },
              { text: 'Admin Alice updated user profile for "Bob Johnson"', time: '3 hours ago' },
              { text: 'New user "Eva Green" registered on the platform', time: '5 hours ago' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.text}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;