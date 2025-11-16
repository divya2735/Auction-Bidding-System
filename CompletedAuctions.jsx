import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CompletedAuctions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    status: 'closed', // Always set to closed for completed auctions
    min_price: '',
    max_price: '',
    ordering: '-end_time' // Show most recently ended first
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    // { value: 'electronics', label: 'Electronics' },
    // { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'home', label: 'Luxirous Bunglow Or Villa ' },
    // { value: 'sports', label: 'Sports & Recreation' },
    { value: 'automotive', label: 'Rare & Classic Cars' },
    // { value: 'collectibles', label: 'Collectibles' },
    // { value: 'books', label: 'Books & Media' },
    { value: 'jewelry', label: 'Expensive Jewelry & Watches' },
    { value: 'art', label: 'Luxirous Arts' },
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
    { value: '-end_time', label: 'Recently Ended' },
    { value: 'end_time', label: 'Oldest First' },
    { value: '-current_price', label: 'Final Price: High to Low' },
    { value: 'current_price', label: 'Final Price: Low to High' },
    { value: 'item_name', label: 'Name: A to Z' },
    { value: '-item_name', label: 'Name: Z to A' },
  ];

  useEffect(() => {
    fetchCompletedAuctions();
  }, [filters]);

  const fetchCompletedAuctions = async () => {
    try {
      setLoading(true);
      
      // Build query params - only add non-empty values
      const params = new URLSearchParams();
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.category && filters.category !== '') params.append('category', filters.category);
      if (filters.condition && filters.condition !== '') params.append('condition', filters.condition);
      params.append('status', 'closed'); // Always filter for closed auctions
      if (filters.min_price && filters.min_price !== '') params.append('min_price', filters.min_price);
      if (filters.max_price && filters.max_price !== '') params.append('max_price', filters.max_price);
      params.append('ordering', filters.ordering || '-end_time');

      let response;
      try {
        console.log('Fetching completed auctions with params:', params.toString());
        response = await axiosInstance.get(`/auctions/search-filters/?${params.toString()}`);
      } catch (searchError) {
        console.log('Falling back to /auctions/ endpoint');
        response = await axiosInstance.get(`/auctions/?${params.toString()}`);
      }
      
      let auctionList = [];

      // Handle different response structures
      if (response.data.results && response.data.results.auctions && Array.isArray(response.data.results.auctions)) {
        auctionList = response.data.results.auctions;
      } else if (response.data.auctions && Array.isArray(response.data.auctions)) {
        auctionList = response.data.auctions;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        auctionList = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        auctionList = response.data.data;
      } else if (Array.isArray(response.data)) {
        auctionList = response.data;
      }
      
      // Make sure auctionList is an array
      if (!Array.isArray(auctionList)) {
        console.error('auctionList is not an array!', auctionList);
        auctionList = [];
      }
      
      // Process images to ensure full URLs
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
      console.error('Error fetching completed auctions:', err);
      setError(`Failed to load completed auctions: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
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
    fetchCompletedAuctions();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      status: 'closed',
      min_price: '',
      max_price: '',
      ordering: '-end_time'
    });
  };

  if (loading && auctions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading completed auctions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Completed Auctions</h1>
      
      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search completed auctions..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Final Price</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Final Price</label>
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
        </div>

        {/* Sort and Clear Filters */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {orderingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
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
          {auctions.length} completed {auctions.length === 1 ? 'auction' : 'auctions'} found
        </p>
      </div>

      {/* Auctions Grid */}
      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No completed auctions found</p>
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
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-gray-300">
              <div className="h-56 bg-gray-200 relative">
                {auction.images && auction.images.length > 0 ? (
                  <img 
                    src={auction.images[0].image} 
                    alt={auction.item_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                
                {/* Closed Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">
                    Closed
                  </span>
                </div>

                {/* Winner Badge (if auction has winner info) */}
                {auction.winner_id && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                      🏆 Sold
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 capitalize">{auction.category || 'Uncategorized'}</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{auction.item_name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Starting Price:</span>
                    <span className="font-semibold">${parseFloat(auction.starting_price).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Final Price:</span>
                    <span className="font-bold text-lg text-indigo-600">
                      ${parseFloat(auction.current_price || auction.starting_price).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condition:</span>
                    <span className="capitalize">{auction.condition?.replace('_', ' ')}</span>
                  </div>

                  {auction.end_time && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ended:</span>
                      <span className="text-gray-700">
                        {new Date(auction.end_time).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => navigate(`/auction/${auction.id}`)}
                  className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay for filtering */}
      {loading && auctions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedAuctions;