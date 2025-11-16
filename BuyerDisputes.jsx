import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Eye, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const BuyerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisputesAndAuctions();
  }, []);

  const fetchDisputesAndAuctions = async () => {
    try {
      setLoading(true);
      
      // FIXED: Fetch disputes (which now includes won_auctions)
      const response = await axiosInstance.get('/disputes/');
      console.log('Disputes response:', response.data);
      
      if (response.data.disputes) {
        // New format with disputes and won_auctions
        setDisputes(Array.isArray(response.data.disputes) ? response.data.disputes : []);
        setWonAuctions(Array.isArray(response.data.won_auctions) ? response.data.won_auctions : []);
      } else if (Array.isArray(response.data)) {
        // Old format - just disputes
        setDisputes(response.data);
        // Fetch won auctions separately
        await fetchWonAuctionsFromAPI();
      } else {
        setDisputes([]);
        await fetchWonAuctionsFromAPI();
      }
      
    } catch (error) {
      console.error('Error fetching disputes:', error);
      setDisputes([]);
      await fetchWonAuctionsFromAPI();
    } finally {
      setLoading(false);
    }
  };

  const fetchWonAuctionsFromAPI = async () => {
    try {
      const response = await axiosInstance.get('/buyer/won-auctions/');
      console.log('Won auctions response:', response.data);
      
      // Handle pagination response
      if (response.data.results) {
        setWonAuctions(response.data.results);
      } else if (Array.isArray(response.data)) {
        setWonAuctions(response.data);
      } else if (response.data) {
        setWonAuctions([response.data]);
      } else {
        setWonAuctions([]);
      }
    } catch (error) {
      console.error('Error fetching won auctions:', error);
      setWonAuctions([]);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();

    if (!selectedAuction) {
      alert('Please select an auction');
      return;
    }

    if (!formData.reason) {
      alert('Please select a reason');
      return;
    }

    if (formData.description.length < 20) {
      alert('Description must be at least 20 characters');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        auction_id: selectedAuction.id,
        reason: formData.reason,
        description: formData.description
      };

      console.log('Submitting dispute payload:', payload);

      const response = await axiosInstance.post('/buyer/disputes/create/', payload);
      
      console.log('Dispute creation response:', response.data);
      alert('✅ Dispute created successfully');
      
      setShowCreateModal(false);
      setFormData({ reason: '', description: '' });
      setSelectedAuction(null);
      
      // Refresh disputes list
      await fetchDisputesAndAuctions();
      
    } catch (error) {
      console.error('Error creating dispute:', error);
      console.error('Full error response:', error.response);
      
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.response?.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Failed to create dispute. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in_progress': { color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
      'resolved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const badge = badges[status] || badges['pending'];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color} flex items-center gap-1`}>
        <Icon className="w-4 h-4" />
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (auction) => {
    if (auction.payment_completed) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">Paid</span>;
    }
    return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-medium">Pending Payment</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const safeDisputes = Array.isArray(disputes) ? disputes : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-blue-600" />
                My Disputes
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your product complaints and dispute resolutions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Dispute
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{safeDisputes.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {safeDisputes.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {safeDisputes.filter(d => d.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {safeDisputes.filter(d => d.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Disputes List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Disputes</h2>
          </div>

          {safeDisputes.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No disputes found</p>
              <p className="text-gray-500 mt-2">Create a dispute if you have any issues with your purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeDisputes.map((dispute) => (
                    <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">#{dispute.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{dispute.auction?.item_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">${parseFloat(dispute.auction?.current_price || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.against?.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{dispute.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(dispute.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(dispute.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/buyer/disputes/${dispute.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Dispute Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Create Dispute</h2>
              <p className="text-gray-600 mt-1">Submit a complaint about your purchase</p>
            </div>

            <form onSubmit={handleCreateDispute} className="p-6 space-y-6">
              {/* Won Auctions Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Available won auctions for dispute: <strong>{wonAuctions.length}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Auction *</label>
                <select
                  required
                  value={selectedAuction?.id || ''}
                  onChange={(e) => {
                    const auction = wonAuctions.find(a => a.id === parseInt(e.target.value));
                    setSelectedAuction(auction);
                    console.log('Selected auction:', auction);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Choose an auction...</option>
                  {wonAuctions.length === 0 ? (
                    <option disabled>No won auctions available</option>
                  ) : (
                    wonAuctions.map((auction) => (
                      <option key={auction.id} value={auction.id}>
                        {auction.item_name} - ${parseFloat(auction.current_price).toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedAuction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedAuction.item_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Price: ${parseFloat(selectedAuction.current_price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ended: {formatDate(selectedAuction.end_time)}
                      </p>
                    </div>
                    <div>{getPaymentStatusBadge(selectedAuction)}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Dispute *</label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a reason...</option>
                  <option value="item_not_received">Item Not Received</option>
                  <option value="item_damaged">Item Damaged/Defective</option>
                  <option value="not_as_described">Not As Described</option>
                  <option value="wrong_item">Wrong Item Sent</option>
                  <option value="seller_unresponsive">Seller Unresponsive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
                <p className="text-xs text-gray-600 mb-2">Minimum 20 characters required</p>
                <textarea
                  required
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue. Be specific and include any relevant details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.description.length} / 20+ characters
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ reason: '', description: '' });
                    setSelectedAuction(null);
                  }}
                  disabled={submitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.description.length < 20 || !formData.reason || !selectedAuction || submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Dispute'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDisputes;