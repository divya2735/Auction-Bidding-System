// File: pages/GuestBrowseAuctions.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import LandingNavbar from '../Guest/LandingNavbar';
import { Search, Filter } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const GuestBrowseAuctions = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    status: 'active',
    min_price: '',
    max_price: '',
    ordering: '-start_time'
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'books', label: 'Books & Media' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'art', label: 'Art & Crafts' },
    { value: 'other', label: 'Other' },
  ];

  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const orderingOptions = [
    { value: '-start_time', label: 'Newest First' },
    { value: 'start_time', label: 'Oldest First' },
    { value: 'starting_price', label: 'Price: Low to High' },
    { value: '-starting_price', label: 'Price: High to Low' },
    { value: 'item_name', label: 'Name: A to Z' },
    { value: '-item_name', label: 'Name: Z to A' },
  ];

  useEffect(() => {
    fetchAuctions();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.category && filters.category !== '') params.append('category', filters.category);
      if (filters.condition && filters.condition !== '') params.append('condition', filters.condition);
      if (filters.status && filters.status !== '') params.append('status', filters.status);
      if (filters.min_price && filters.min_price !== '') params.append('min_price', filters.min_price);
      if (filters.max_price && filters.max_price !== '') params.append('max_price', filters.max_price);
      params.append('ordering', filters.ordering || '-start_time');

      const response = await axiosInstance.get(`/auctions/?${params.toString()}`);
      
      let auctionList = [];
      if (response.data.results && Array.isArray(response.data.results)) {
        auctionList = response.data.results;
      } else if (Array.isArray(response.data)) {
        auctionList = response.data;
      }

      const processedAuctions = auctionList.map(auction => ({
        ...auction,
        images: auction.images?.map(img => ({
          ...img,
          image: img.image && !img.image.startsWith("http") 
            ? `${API_BASE_URL}${img.image}` 
            : img.image
        })) || []
      }));
      
      setAuctions(processedAuctions);
      setError(null);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(`Failed to load auctions: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      status: 'active',
      min_price: '',
      max_price: '',
      ordering: '-start_time'
    });
  };

  const handleBidClick = (auctionId) => {
    if (!user) {
      navigate('/login', { state: { from: `/auction/${auctionId}` } });
    } else {
      navigate(`/auction/${auctionId}/bid`);
    }
  };

  return (
    <>
      <LandingNavbar user={user} onLogout={logout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Browse Auctions</h1>
        
        {/* Search and Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by item name or description..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {conditionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="Any"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {orderingOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {auctions.length} {auctions.length === 1 ? 'auction' : 'auctions'} found
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">No auctions found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="h-56 bg-gray-200 relative cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/auction/${auction.id}`)}>
                  {auction.images && auction.images.length > 0 ? (
                    <img 
                      src={auction.images[0].image} 
                      alt={auction.item_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {auction.status && (
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        auction.status === 'active' ? 'bg-green-100 text-green-800' :
                        auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {auction.status === 'active' ? 'Active' : 
                         auction.status === 'pending' ? 'Starts Soon' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 capitalize">{auction.category || 'Uncategorized'}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate(`/auction/${auction.id}`)}>
                    {auction.item_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
                  
                  <div className="space-y-2 mb-4 pb-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Starting Price:</span>
                      <span className="font-semibold">${parseFloat(auction.starting_price).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Bid:</span>
                      <span className="font-semibold text-green-600">
                        ${parseFloat(auction.current_price || auction.starting_price).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Condition:</span>
                      <span className="capitalize">{auction.condition?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/auction/${auction.id}`)}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                      View Details
                    </button>
                    {auction.status === 'active' && (
                      <button 
                        onClick={() => handleBidClick(auction.id)}
                        className="flex-1 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors font-medium text-sm"
                      >
                        Bid Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GuestBrowseAuctions;