import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle, Download, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AuctionManagement = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    condition: '',
    start_date: '',
    end_date: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAuctions, setSelectedAuctions] = useState([]);
  const [closingAuctionId, setClosingAuctionId] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, [page]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page);
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (filters.status && filters.status !== '') {
        params.append('status', filters.status);
      }
      
      if (filters.category && filters.category !== '') {
        params.append('category', filters.category);
      }
      
      if (filters.condition && filters.condition !== '') {
        params.append('condition', filters.condition);
      }
      
      if (filters.start_date && filters.start_date !== '') {
        params.append('start_date', filters.start_date);
      }
      
      if (filters.end_date && filters.end_date !== '') {
        params.append('end_date', filters.end_date);
      }

      const fullUrl = `/auctions/?${params.toString()}`;

      const response = await axiosInstance.get(fullUrl);

      if (response.data.results) {
        setAuctions(response.data.results);
        setTotalCount(response.data.count || 0);
        setTotalPages(Math.ceil((response.data.count || 0) / 20));
      } else if (Array.isArray(response.data)) {
        setAuctions(response.data);
        setTotalCount(response.data.length);
        setTotalPages(1);
      } else {
        setAuctions([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('❌ Failed to fetch auctions:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch auctions');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchAuctions();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: '',
      condition: '',
      start_date: '',
      end_date: ''
    });
    setSearchTerm('');
    setPage(1);
    setTimeout(() => fetchAuctions(), 0);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const toggleAuctionSelection = (auctionId) => {
    setSelectedAuctions(prev =>
      prev.includes(auctionId)
        ? prev.filter(id => id !== auctionId)
        : [...prev, auctionId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedAuctions(prev =>
      prev.length === auctions.length ? [] : auctions.map(a => a.id)
    );
  };

  // ✅ ONLY for ACTIVE auctions
  const handleCloseAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to close this auction?')) return;

    try {
      setClosingAuctionId(auctionId);
      console.log(`🔒 Closing auction ${auctionId}...`);
      
      const response = await axiosInstance.post(`/admin/close-auction/${auctionId}/`);
      
      // Update UI immediately
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === auctionId 
            ? { ...auction, status: 'closed' }
            : auction
        )
      );
      
      alert(`✅ Auction Closed Successfully!\n\nWinner: ${response.data.winner || 'None'}\nWinning Amount: $${response.data.winning_amount}`);
      
      setTimeout(() => fetchAuctions(), 500);
      
    } catch (err) {
      console.error('❌ Failed to close auction:', err);
      alert(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setClosingAuctionId(null);
    }
  };

  // ✅ ONLY for CLOSED auctions (NEW)
  const handleReopenAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to reopen this auction?')) return;

    try {
      setClosingAuctionId(auctionId);
      console.log(`🔓 Reopening auction ${auctionId}...`);
      
      const response = await axiosInstance.post(`/admin/reopen-auction/${auctionId}/`);
      
      // Update UI immediately
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === auctionId 
            ? { ...auction, status: 'active' }
            : auction
        )
      );
      
      alert(`✅ Auction Reopened Successfully!`);
      
      setTimeout(() => fetchAuctions(), 500);
      
    } catch (err) {
      console.error('❌ Failed to reopen auction:', err);
      alert(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setClosingAuctionId(null);
    }
  };

  const handleBulkClose = async () => {
    if (!confirm(`Close ${selectedAuctions.length} selected auctions?`)) return;

    try {
      await Promise.all(
        selectedAuctions.map(id => 
          axiosInstance.post(`/admin/close-auction/${id}/`)
        )
      );

      alert('✅ All selected auctions closed successfully');
      
      setSelectedAuctions([]);
      fetchAuctions();
    } catch (err) {
      console.error('❌ Failed to close auctions:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'pending': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && auctions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Auction Overview</h1>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Create New Auction
          </button>
        </div>
      </header>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200">❌ {error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-white font-bold mb-4">Filter Auctions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Item name, description, seller..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="home">Luxurious Bungalow Or Villa</option>
              <option value="automotive">Rare & Classic Cars</option>
              <option value="jewelry">Expensive Jewelry & Watches</option>
              <option value="art">Luxurious Arts</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>

        {selectedAuctions.length > 0 && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-white font-medium">{selectedAuctions.length} auctions selected</span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkClose}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Close Selected
              </button>
              <button
                onClick={() => setSelectedAuctions([])}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              Current Auctions ({totalCount})
            </h2>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAuctions.length === auctions.length && auctions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Starting Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Winner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {auctions.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-8 text-center text-gray-400">
                      {loading ? 'Loading auctions...' : 'No auctions found. Try adjusting your filters.'}
                    </td>
                  </tr>
                ) : (
                  auctions.map((auction) => (
                    <tr key={auction.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAuctions.includes(auction.id)}
                          onChange={() => toggleAuctionSelection(auction.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-300">
                        #{auction.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {auction.item_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {auction.seller?.email || auction.seller || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(auction.status)}`}>
                          {auction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        ${parseFloat(auction.starting_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-bold">
                        ${parseFloat(auction.current_price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {auction.winner?.email || auction.winner || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(auction.start_time)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(auction.end_time)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* ✅ ONLY show Close button if ACTIVE */}
                          {auction.status === 'active' && (
                            <button
                              onClick={() => handleCloseAuction(auction.id)}
                              disabled={closingAuctionId === auction.id}
                              className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {closingAuctionId === auction.id ? 'Closing...' : 'Close'}
                            </button>
                          )}
                          
                          {/* ✅ ONLY show Open button if CLOSED */}
                          {auction.status === 'closed' && (
                            <button
                              onClick={() => handleReopenAuction(auction.id)}
                              disabled={closingAuctionId === auction.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {closingAuctionId === auction.id ? 'Opening...' : 'Open'}
                            </button>
                          )}
                          
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {auctions.length} of {totalCount} auctions (Page {page} of {totalPages || 1})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-900 text-white rounded-lg font-mono">
                {page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0 || loading}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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

export default AuctionManagement;