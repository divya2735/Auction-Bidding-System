import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Trash2, Clock, DollarSign, User, Calendar, Award } from 'lucide-react';

const AuctionDetail = ({ auctionId }) => {
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auctions/${auctionId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch auction');

      const data = await response.json();
      setAuction(data);
      setFormData(data);
      setImages(data.images || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch auction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bids/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data.results || []);
      }
    } catch (err) {
      console.error('Fetch bids error:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update auction');

      alert('Auction updated successfully!');
      fetchAuctionDetails();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCloseAuction = async () => {
    if (!confirm('Are you sure you want to close this auction?')) return;

    try {
      const response = await fetch(`/admin/close-auction/${auctionId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to close auction');

      alert('Auction closed successfully!');
      fetchAuctionDetails();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteAuction = async () => {
    if (!confirm('Are you sure you want to delete this auction? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/auctions/${auctionId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to delete auction');

      alert('Auction deleted successfully!');
      window.location.href = '/admin/auctions';
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedImages = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('auction_item', auctionId);

      try {
        const response = await fetch('/api/auction-images/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setImages(prev => [...prev, ...uploadedImages]);
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/api/auction-images/${imageId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'upcoming': 'bg-blue-100 text-blue-800'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Auction not found'}</p>
          <button onClick={fetchAuctionDetails} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{auction.item_name}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(auction.status)}`}>
                {auction.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Auction ID: {auction.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {auction.status === 'active' && (
              <button
                onClick={handleCloseAuction}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Close Auction
              </button>
            )}
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleDeleteAuction}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Auction Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={formData.item_name || ''}
                onChange={(e) => handleInputChange('item_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="art">Art</option>
                <option value="collectibles">Collectibles</option>
                <option value="jewelry">Jewelry</option>
                <option value="fashion">Fashion</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Seller
              </label>
              <input
                type="text"
                value={auction.seller?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Pricing Details
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.starting_price || ''}
                  onChange={(e) => handleInputChange('starting_price', e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Price</label>
              <div className="px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${auction.current_price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.reserve_price || ''}
                  onChange={(e) => handleInputChange('reserve_price', e.target.value)}
                  placeholder="Optional"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <Clock className="w-5 h-5 inline mr-2" />
            Auction Schedule
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.start_time?.slice(0, 16) || ''}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.end_time?.slice(0, 16) || ''}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-lg font-semibold text-blue-600">
                  {auction.status === 'active' ? 'Active' : 'Ended'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <Upload className="w-5 h-5 inline mr-2" />
            Auction Images
          </h2>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image}
                  alt="Auction"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop images or click to upload</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
            >
              Upload Images
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Bid History ({bids.length} bids)
          </h2>
          
          {bids.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bids.map((bid, index) => (
                    <tr key={bid.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-lg">
                        {getRankMedal(index + 1)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {bid.user?.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {bid.user?.first_name} {bid.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{bid.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-gray-900">
                          ${bid.amount?.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(bid.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No bids yet</p>
          )}
        </div>

        {auction.status === 'closed' && auction.winner && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 shadow-sm border-2 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Winner Information</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Winner</p>
                    <p className="text-base font-semibold text-gray-900">{auction.winner?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Winning Bid</p>
                    <p className="text-2xl font-bold text-green-600">${auction.current_price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Won At</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(auction.end_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Contact Winner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;