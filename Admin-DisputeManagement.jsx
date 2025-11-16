import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const DisputeManagement = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    in_progress: 0,
    rejected: 0,
    avg_resolution_days: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDisputes();
  }, [page, activeTab]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/disputes/', {
        params: {
          page,
          status: activeTab !== 'all' ? activeTab : undefined,
          search: searchTerm || undefined
        }
      });

      if (response.data.results) {
        setDisputes(response.data.results);
        
        // Calculate stats from the data
        const allDisputes = response.data.results;
        const newStats = {
          total: response.data.count || allDisputes.length,
          pending: allDisputes.filter(d => d.status === 'pending').length,
          in_progress: allDisputes.filter(d => d.status === 'in_progress').length,
          resolved: allDisputes.filter(d => d.status === 'resolved').length,
          rejected: allDisputes.filter(d => d.status === 'rejected').length,
          avg_resolution_days: 3 // Calculate this from resolved disputes
        };
        setStats(newStats);
        
        setTotalPages(Math.ceil((response.data.count || 0) / 20));
      }
      setError(null);
    } catch (err) {
      console.error('Fetch disputes error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDisputes();
  };

  const handleViewDispute = (disputeId) => {
    navigate(`/admin/disputes/${disputeId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && disputes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDisputes()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Disputes</p>
                <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <h3 className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <h3 className="text-3xl font-bold mt-2 text-blue-600">{stats.in_progress}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <h3 className="text-3xl font-bold mt-2 text-green-600">{stats.resolved}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <h3 className="text-3xl font-bold mt-2 text-red-600">{stats.rejected}</h3>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center px-6">
              <button
                onClick={() => { setActiveTab('all'); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => { setActiveTab('pending'); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'pending'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => { setActiveTab('in_progress'); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'in_progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                In Progress ({stats.in_progress})
              </button>
              <button
                onClick={() => { setActiveTab('resolved'); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'resolved'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Resolved ({stats.resolved})
              </button>
              <button
                onClick={() => { setActiveTab('rejected'); setPage(1); }}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'rejected'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, Auction, or User..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Disputes Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raised By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Against</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No disputes found
                    </td>
                  </tr>
                ) : (
                  disputes.map((dispute) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 font-bold">
                        #{dispute.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dispute.order?.auction?.item_name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {dispute.raised_by?.email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {dispute.against?.email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {dispute.reason?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dispute.status)}`}>
                          {dispute.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(dispute.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(dispute.resolved_at)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewDispute(dispute.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {disputes.length} dispute(s) | Page {page} of {totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium">{page}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0 || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeManagement;