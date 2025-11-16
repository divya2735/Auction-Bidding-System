import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertTriangle, CheckCircle, XCircle, FileText, MessageSquare, Clock, User, Package, Mail, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminDisputeDetail = () => {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDisputeDetails();
  }, [disputeId]);

  const fetchDisputeDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/disputes/${disputeId}/`);
      
      setDispute(response.data);
      setSelectedStatus(response.data.status);
      setResolutionNote(response.data.resolution_note || '');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch dispute details');
      console.error('Fetch dispute error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      await axiosInstance.patch(`/admin/disputes/${disputeId}/`, {
        status: selectedStatus,
        resolution_note: resolutionNote
      });

      alert('✅ Dispute status updated successfully!');
      fetchDisputeDetails();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!confirm('Are you sure you want to mark this dispute as resolved?')) return;

    try {
      setUpdating(true);
      await axiosInstance.patch(`/admin/disputes/${disputeId}/`, {
        status: 'resolved',
        resolution_note: resolutionNote
      });

      alert('✅ Dispute resolved successfully!');
      fetchDisputeDetails();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectDispute = async () => {
    if (!confirm('Are you sure you want to reject this dispute?')) return;

    try {
      setUpdating(true);
      await axiosInstance.patch(`/admin/disputes/${disputeId}/`, {
        status: 'rejected',
        resolution_note: resolutionNote
      });

      alert('✅ Dispute rejected!');
      fetchDisputeDetails();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUpdating(false);
    }
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

  const getStatusIcon = (status) => {
    if (status === 'resolved') return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (status === 'rejected') return <XCircle className="w-6 h-6 text-red-600" />;
    if (status === 'in_progress') return <MessageSquare className="w-6 h-6 text-blue-600" />;
    return <Clock className="w-6 h-6 text-yellow-600" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-lg border border-gray-700">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-4">{error || 'Dispute not found'}</p>
          <button 
            onClick={() => navigate('/admin/disputes')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Disputes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/disputes')}
              className="mb-3 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Disputes
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Dispute #{dispute.id}</h1>
            <p className="text-gray-400">Manage and resolve user disputes</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusBadge(dispute.status)}`}>
            {dispute.status?.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dispute Info Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Dispute Info</h2>
                  <p className="text-2xl font-bold text-blue-400 mt-1">DIS-{dispute.id.toString().padStart(5, '0')}</p>
                </div>
                {getStatusIcon(dispute.status)}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-400 text-sm font-medium">Created</span>
                  <span className="text-white font-semibold text-sm">
                    {formatDate(dispute.created_at)}
                  </span>
                </div>

                {dispute.resolved_at && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400 text-sm font-medium">Resolved</span>
                    <span className="text-white font-semibold text-sm">
                      {formatDate(dispute.resolved_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Parties Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Parties Involved
              </h2>
              
              <div className="space-y-4">
                {/* Raised By (Buyer) */}
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Raised By (Buyer)</p>
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {dispute.raised_by?.email?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {dispute.raised_by?.first_name} {dispute.raised_by?.last_name}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {dispute.raised_by?.email || 'N/A'}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-900 text-blue-300 text-xs font-semibold rounded">
                        Buyer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-700 my-4"></div>

                {/* Against (Seller) */}
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Against (Seller)</p>
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {dispute.against?.email?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {dispute.against?.first_name} {dispute.against?.last_name}
                      </p>
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {dispute.against?.email || 'N/A'}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-900 text-purple-300 text-xs font-semibold rounded">
                        Seller
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Order Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Auction Details
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Auction Item</p>
                  <p className="text-white font-semibold">
                    {dispute.order?.auction?.item_name || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Order ID</p>
                    <p className="text-white font-bold text-lg">
                      {dispute.order?.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Amount</p>
                    <p className="text-white font-bold text-lg">
                      ${dispute.order?.amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Reason Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                Buyer's Complaint
              </h2>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Reason</p>
                <p className="text-2xl font-bold text-white">
                  {dispute.reason?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {dispute.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Response (if exists) */}
            {dispute.seller_response && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                  Seller's Response
                </h2>
                <div className="bg-purple-900 bg-opacity-20 rounded-lg p-6 border border-purple-700">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {dispute.seller_response}
                  </p>
                </div>
              </div>
            )}

            {/* Admin Resolution Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Save className="w-6 h-6 text-blue-400" />
                Admin Resolution
              </h2>
              
              <div className="space-y-6">
                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">Update Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">Resolution Notes</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add resolution notes or decision details..."
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  />
                  <p className="text-gray-500 text-xs mt-2">These notes will be visible to both parties</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating}
                      className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Save className="w-5 h-5" />
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                    
                    <button
                      onClick={handleResolveDispute}
                      disabled={updating || dispute.status === 'resolved'}
                      className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Resolved
                    </button>
                    
                    <button
                      onClick={handleRejectDispute}
                      disabled={updating || dispute.status === 'rejected'}
                      className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Resolution (if exists) */}
            {dispute.resolution_note && (
              <div className="bg-green-900 bg-opacity-20 rounded-lg p-6 border border-green-700">
                <h3 className="text-lg font-bold text-green-400 mb-3">Current Resolution Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{dispute.resolution_note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputeDetail;