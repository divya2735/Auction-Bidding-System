import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, ChevronLeft, ChevronRight, Mail, Clock, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const OTPManagement = () => {
  const [otps, setOtps] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    active: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState({
    is_used: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const pageSize = 20;

  useEffect(() => {
    fetchOTPs();
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchOTPs();
        fetchStats();
        setLastUpdated(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [page, filters, autoRefresh]);

  const fetchOTPs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.is_used !== '') params.append('is_used', filters.is_used);

      // FIXED: Updated endpoint path to include /users/
      const response = await axiosInstance.get(`/users/email-otps/?${params.toString()}`);
      
      setOtps(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch OTPs');
      console.error('Fetch OTPs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // FIXED: Updated endpoint path to include /users/
      const response = await axiosInstance.get('/users/email-otps/?page_size=1000');
      const allOtps = response.data.results || [];
      
      const now = new Date();
      const expiryTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      let used = 0;
      let active = 0;
      let expired = 0;
      
      allOtps.forEach(otp => {
        if (otp.is_used) {
          used++;
        } else {
          const created = new Date(otp.created_at);
          const isExpired = now - created > expiryTime;
          if (isExpired) {
            expired++;
          } else {
            active++;
          }
        }
      });
      
      setStats({
        total: allOtps.length,
        used: used,
        active: active,
        expired: expired
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOTPs();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getStatusBadge = (otp) => {
    const now = new Date();
    const created = new Date(otp.created_at);
    const expiryTime = 10 * 60 * 1000;
    const isExpired = now - created > expiryTime;

    if (otp.is_used) {
      return 'bg-gray-100 text-gray-800';
    } else if (isExpired) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (otp) => {
    const now = new Date();
    const created = new Date(otp.created_at);
    const expiryTime = 10 * 60 * 1000;
    const isExpired = now - created > expiryTime;

    if (otp.is_used) return 'Used';
    if (isExpired) return 'Expired';
    return 'Active';
  };

  const getTimeRemaining = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const expiryTime = 10 * 60 * 1000;
    const remaining = expiryTime - (now - created);

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && otps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OTP Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            </label>
            <button
              onClick={() => {
                fetchOTPs();
                fetchStats();
                setLastUpdated(new Date());
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total OTPs</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Used</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{stats.used}</h3>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <h3 className="text-4xl font-bold text-green-600 mt-2">{stats.active}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Expired</p>
                <h3 className="text-4xl font-bold text-red-600 mt-2">{stats.expired}</h3>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or OTP code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.is_used}
              onChange={(e) => handleFilterChange('is_used', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Used</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>

            <button
              onClick={() => {
                setFilters({ is_used: '' });
                setSearchTerm('');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* OTPs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : otps.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No OTPs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTP Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {otps.map((otp) => (
                    <tr key={otp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {otp.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="px-3 py-2 bg-gray-100 rounded font-mono text-lg font-bold text-gray-900 inline-block">
                          {otp.otp}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(otp.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {getTimeRemaining(otp.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(otp)}`}>
                          {getStatusText(otp)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg">
                  {page}/{totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPManagement;