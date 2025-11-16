import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Eye, Edit, ExternalLink, ChevronLeft, ChevronRight, User, AlertCircle, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance'; // ✅ USE AXIOS INSTANCE

const ProfileManagement = ({ type = 'buyer' }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    profile_completed: '',
    city: '',
    state: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, [page, filters, type]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
      });

      // Add filters only if they have values
      if (filters.profile_completed) params.append('profile_completed', filters.profile_completed);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (searchTerm) params.append('search', searchTerm);

      // ✅ USE AXIOS INSTANCE - automatically adds token
      const endpoint = type === 'buyer' 
        ? `/admin/buyer-profiles/?${params}` 
        : `/admin/seller-profiles/?${params}`;
      
      console.log('Fetching:', endpoint);

      const response = await axiosInstance.get(endpoint);

      console.log('Response data:', response.data);
      
      setProfiles(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / 20));
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch profiles';
      setError(errorMsg);
      setProfiles([]);
      setTotalCount(0);
      setTotalPages(1);
      console.error('Fetch profiles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProfiles();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleRetry = () => {
    fetchProfiles();
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCompletionTextColor = (percentage) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const exportToCSV = () => {
    if (profiles.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['User ID', 'Name', 'Email', 'Ticket ID', 'Contact', 'City', 'State', 'Pincode', 'Profile %'];
    if (type === 'seller') headers.push('Business Name');
    
    const rows = profiles.map(p => {
      const row = [
        p.user?.id || '',
        `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim(),
        p.user?.email || '',
        p.user?.ticket_id || '',
        p.contact_number || '',
        p.city || '',
        p.state || '',
        p.pincode || '',
        p.profile_completion || 0
      ];
      if (type === 'seller') row.push(p.business_name || '');
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-profiles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {type} profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {type === 'buyer' ? 'Buyer' : 'Seller'} Profiles
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your {type} profiles, filter by status, city, or state. {totalCount > 0 && `Total: ${totalCount} profiles`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              disabled={profiles.length === 0}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New {type === 'buyer' ? 'Buyer' : 'Seller'}
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, contact, city, state, pincode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.profile_completed}
              onChange={(e) => handleFilterChange('profile_completed', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Profile Status: All</option>
              <option value="true">Completed (&gt;70%)</option>
              <option value="false">Incomplete (&lt;70%)</option>
            </select>

            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">City: All</option>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="Houston">Houston</option>
              <option value="Phoenix">Phoenix</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">State: All</option>
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="IL">Illinois</option>
              <option value="TX">Texas</option>
              <option value="AZ">Arizona</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error loading profiles</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <div className="mt-2">
                    <p className="text-xs text-red-600">Debug info:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                      <li>Check if you're logged in as admin</li>
                      <li>Verify backend API is running</li>
                      <li>Check browser console for details</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                  {type === 'seller' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={type === 'seller' ? 9 : 8} className="px-6 py-12 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No profiles found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {error ? 'Please check your connection and try again' : 'Try adjusting your filters or add new profiles'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {profile.user?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {profile.user?.first_name || ''} {profile.user?.last_name || ''}
                            </p>
                            <p className="text-xs text-gray-500">{profile.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {profile.user?.ticket_id || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {profile.contact_number || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {profile.city || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {profile.state || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {profile.pincode || '—'}
                      </td>
                      {type === 'seller' && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {profile.business_name || '—'}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden min-w-[80px]">
                            <div
                              className={`h-full ${getCompletionColor(profile.profile_completion || 0)}`}
                              style={{ width: `${profile.profile_completion || 0}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${getCompletionTextColor(profile.profile_completion || 0)} min-w-[45px]`}>
                            {profile.profile_completion || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="View User Account"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {profiles.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Page {page} of {totalPages} • Showing {profiles.length} of {totalCount} profiles
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">{page}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;