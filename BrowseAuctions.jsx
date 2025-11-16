import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

// Import all local images
import bgcar from '../../components/images/bgcar.jpg';
import bghouse from '../../components/images/bghouse.jpg';
import bgwatch from '../../components/images/bgwatch.jpg';
import bgpainting from '../../components/images/bgpaintaing.jpg';
import bgjewellery from '../../components/images/bgjwellery.jpg';
import watchcard from '../../components/images/watchcard.jpg';
import carcard from '../../components/images/carcard.jpg';
import jewellerycard from '../../components/images/jewellarycard.jpg';
import housecard from '../../components/images/housecard.jpg';
import paintingecard from '../../components/images/paintingcard.jpg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function LuxuryAuctionBrowse() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Carousel categories with backend filter mapping
  const categories = [
    {
      id: 'cars',
      name: 'Rare & Classic Cars',
      description: 'Discover a curated state of automotive legends. These are investment-grade vehicles with impeccable provenance, representing the peak of design, engineering, and cultural history. From pre-war marvels to modern hypercars, find the machine that defines your collection.',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      bgImage: bgcar,
      card: carcard,
      filterCategory: 'automotive'
    },
    {
      id: 'houses',
      name: 'Luxury Houses',
      description: 'Auctioning the world\'s most extraordinary residences. These architectural masterpieces offer unparalleled design, privacy, and amenities in the most prestigious global zip codes. Bid on a landmark estate that offers a truly elevated lifestyle.',
      buttonColor: 'bg-amber-800 hover:bg-amber-900',
      bgImage: bghouse,
      card: housecard,
      filterCategory: 'home'
    },
    {
      id: 'watches',
      name: 'Luxury Watches',
      description: 'An unparalleled collection of high-horology timepieces. Featuring rare complications, limited editions, and iconic models from the most revered Swiss Maisons. Each watch is a legacy of intricate craftsmanship and a powerful wearable asset.',
      buttonColor: 'bg-purple-700 hover:bg-purple-800',
      bgImage: bgwatch,
      card: watchcard,
      filterCategory: 'jewelry'
    },
    {
      id: 'paintings',
      name: 'Expensive Paintings',
      description: 'A gallery of masterpiece fine art, spanning centuries and movements. Acquire works from Old Masters, Impressionists, and contemporary icons that have proven staying power. These are cultural treasures and formidable financial investments.',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      bgImage: bgpainting,
      card: paintingecard,
      filterCategory: 'art'
    },
    {
      id: 'jewellery',
      name: 'Expensive Jewellery',
      description: 'Showcasing breathtaking, bespoke creations and sought-after designer pieces. Featuring the world\'s rarest diamonds, vibrant colored gemstones, and unparalleled artisanal skill. Find the magnificent jewel that becomes your family\'s next heirloom.',
      buttonColor: 'bg-rose-700 hover:bg-rose-800',
      bgImage: bgjewellery,
      card: jewellerycard,
      filterCategory: 'jewelry'
    }
  ];

  // State management
  const [activeCategory, setActiveCategory] = useState(3); // Start with paintings
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlistedIds, setWatchlistedIds] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    condition: '',
    status: '',
    min_price: '',
    max_price: '',
    ordering: '-start_time'
  });

  // Condition options
  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
  ];

  const orderingOptions = [
    { value: '-start_time', label: 'Newest First' },
    { value: 'start_time', label: 'Oldest First' },
    { value: 'starting_price', label: 'Price: Low to High' },
    { value: '-starting_price', label: 'Price: High to Low' },
    { value: 'item_name', label: 'Name: A to Z' },
    { value: '-item_name', label: 'Name: Z to A' },
  ];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch auctions when category or filters change
  useEffect(() => {
    fetchAuctions();
    loadWatchlistFromLocalStorage();
  }, [activeCategory, filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const currentCategory = categories[activeCategory];

      // Build query params with category filter
      const params = new URLSearchParams();
      params.append('category', currentCategory.filterCategory);
      
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.condition && filters.condition !== '') params.append('condition', filters.condition);
      if (filters.status && filters.status !== '') params.append('status', filters.status);
      if (filters.min_price && filters.min_price !== '') params.append('min_price', filters.min_price);
      if (filters.max_price && filters.max_price !== '') params.append('max_price', filters.max_price);
      params.append('ordering', filters.ordering || '-start_time');

      let response;
      try {
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

      if (!Array.isArray(auctionList)) {
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
      console.error('Error fetching auctions:', err);
      setError(`Failed to load auctions: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(`watchlist_${user?.email || 'buyer'}`);
      if (stored) {
        const ids = JSON.parse(stored);
        setWatchlistedIds(new Set(ids));
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
  };

  const saveWatchlistToLocalStorage = (ids) => {
    try {
      localStorage.setItem(`watchlist_${user?.email || 'buyer'}`, JSON.stringify([...ids]));
    } catch (err) {
      console.error('Error saving watchlist:', err);
    }
  };

  const toggleWatchlist = (auctionId) => {
    const newIds = new Set(watchlistedIds);
    if (newIds.has(auctionId)) {
      newIds.delete(auctionId);
      alert('Removed from watchlist');
    } else {
      newIds.add(auctionId);
      alert('Added to watchlist!');
    }
    setWatchlistedIds(newIds);
    saveWatchlistToLocalStorage(newIds);
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
      condition: '',
      status: '',
      min_price: '',
      max_price: '',
      ordering: '-start_time'
    });
  };

  const nextCategory = () => {
    setActiveCategory((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setActiveCategory((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const goToCategory = (index) => {
    setActiveCategory(index);
  };

  const currentCategory = categories[activeCategory];

  return (
    <div className="w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-20 py-8 relative z-10">
        <div className="flex gap-20 text-lg">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => goToCategory(idx)}
              className={`transition-all duration-300 font-light tracking-wide ${
                activeCategory === idx
                  ? 'text-white font-normal'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-2xl font-serif font-bold tracking-wider border-2 border-white px-5 py-2">
          LuxeBid
        </div>
      </nav>

      {/* Background Image */}
      <div
        className="fixed inset-0 top-[100px] bg-cover bg-center z-0 transition-all duration-1200"
        style={{
          backgroundImage: `url('${currentCategory.bgImage}')`,
          filter: 'brightness(0.4) contrast(1.1)',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 top-[100px] bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

      {/* Main Content */}
      <div className="flex items-center justify-between px-20 py-20 min-h-[calc(100vh-100px)] relative z-20">
        {/* Left Side - Content */}
        <div className="w-1/2 pr-16">
          <h1 className="text-8xl font-bold mb-8 transition-all duration-500 leading-tight">
            {currentCategory.name}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-12 font-light">
            {currentCategory.description}
          </p>
          <button
            className={`${currentCategory.buttonColor} text-white px-10 py-4 rounded-lg transition-all duration-300 font-medium text-lg`}
          >
            Explore Now
          </button>
        </div>

        {/* Right Side - Card Display */}
        <div className="w-1/2 flex flex-col items-center justify-center relative">
          <div className="relative w-full h-96 flex items-center justify-center mb-20">
            <div key={activeCategory} className="transition-all duration-700 ease-out z-20 scale-100">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white">
                <img
                  src={currentCategory.card}
                  alt={currentCategory.name}
                  className="w-72 h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-10 relative z-30">
            <button
              onClick={prevCategory}
              className="bg-white/25 hover:bg-white/45 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-md border border-white/60 hover:border-white"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="flex gap-3 px-2">
              {categories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToCategory(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    activeCategory === idx
                      ? 'w-3 h-3 bg-white'
                      : 'w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCategory}
              className="bg-white/25 hover:bg-white/45 text-white p-4 rounded-full transition-all duration-300 backdrop-blur-md border border-white/60 hover:border-white"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Auctions Section */}
      <div className="relative z-30 bg-black py-20 px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">{currentCategory.name} - Auctions</h2>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <form onSubmit={handleSearchSubmit} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by item name or description..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                >
                  {conditionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  placeholder="Any"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
                />
              </div>
            </div>

            {/* Sort and Clear */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={filters.ordering}
                  onChange={(e) => handleFilterChange('ordering', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black"
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              {auctions.length} {auctions.length === 1 ? 'auction' : 'auctions'} found
            </p>
          </div>

          {/* Auctions Grid */}
          {auctions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No auctions found</p>
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(auction.id);
                      }}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      {watchlistedIds.has(auction.id) ? (
                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </button>

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

                  <div className="p-4">
                    <span className="text-xs text-gray-500 capitalize">{currentCategory.name}</span>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{auction.item_name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>

                    <div className="space-y-2 mb-4">
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

                    <button
                      onClick={() => navigate(`/auction/${auction.id}`)}
                      className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && auctions.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <p className="text-lg">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}