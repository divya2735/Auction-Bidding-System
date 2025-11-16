import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const BuyerDisputeDetail = () => {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDisputeDetail();
  }, [disputeId]);

  const fetchDisputeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching dispute: /disputes/${disputeId}/`);
      const response = await axiosInstance.get(`/disputes/${disputeId}/`);
      console.log('Dispute data:', response.data);
      setDispute(response.data);
    } catch (error) {
      console.error('Error fetching dispute:', error);
      setError('Failed to load dispute details');
      // Navigate back after 2 seconds
      setTimeout(() => navigate('/buyer/disputes'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'resolved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors['pending'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error}</p>
          <p className="text-gray-600 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Dispute not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/buyer/disputes')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Disputes
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dispute #{dispute.id}
              </h1>
              <p className="text-gray-600">
                Created on {formatDate(dispute.created_at)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(dispute.status)}`}>
              {dispute.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Auction Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Auction Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Item Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {dispute.auction?.item_name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Purchase Price</label>
              <p className="text-lg font-semibold text-green-600 mt-1">
                ${parseFloat(dispute.auction?.current_price || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {dispute.auction?.images && dispute.auction.images.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">Product Images</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dispute.auction.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seller Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            Seller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Seller Name</label>
              <p className="text-lg text-gray-900 mt-1">
                {dispute.seller?.first_name} {dispute.seller?.last_name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-900 mt-1">{dispute.seller?.email}</p>
            </div>
          </div>
        </div>

        {/* Dispute Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            Dispute Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Reason</label>
              <p className="text-lg text-gray-900 mt-1">
                {dispute.reason?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Your Description</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">{dispute.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Response */}
        {dispute.seller_response && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Seller Response
            </h2>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-900 whitespace-pre-wrap">{dispute.seller_response}</p>
            </div>
          </div>
        )}

        {/* Admin Resolution */}
        {dispute.resolution_note && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Admin Resolution
            </h2>
            <div className="space-y-2">
              {dispute.resolved_at && (
                <p className="text-sm text-gray-600">
                  Resolved on {formatDate(dispute.resolved_at)}
                </p>
              )}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-900 whitespace-pre-wrap">{dispute.resolution_note}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">What Happens Next?</h3>
              {dispute.status === 'pending' && (
                <p className="text-sm text-blue-800">
                  Your dispute has been submitted. The seller will be notified and has 48 hours to respond. 
                  Our admin team will review the case once both parties have provided their information.
                </p>
              )}
              {dispute.status === 'in_progress' && (
                <p className="text-sm text-blue-800">
                  The seller has responded to your dispute. Our admin team is now reviewing both sides 
                  and will make a decision soon. You will be notified once the dispute is resolved.
                </p>
              )}
              {dispute.status === 'resolved' && (
                <p className="text-sm text-blue-800">
                  This dispute has been resolved. Please review the admin's resolution notes above. 
                  If you have any questions, please contact our support team.
                </p>
              )}
              {dispute.status === 'rejected' && (
                <p className="text-sm text-blue-800">
                  Your dispute has been reviewed and rejected. Please see the admin's notes above for details. 
                  If you believe this decision was made in error, you can contact our support team.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDisputeDetail;