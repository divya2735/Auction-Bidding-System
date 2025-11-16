import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Watchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get watchlisted IDs from localStorage
      const stored = localStorage.getItem(`watchlist_${user?.email || 'buyer'}`);
      const watchlistedIds = stored ? JSON.parse(stored) : [];
      
      if (watchlistedIds.length === 0) {
        setWatchlist([]);
        setLoading(false);
        return;
      }
      
      // Fetch all auctions
      const response = await axiosInstance.get('/auctions/');
      let allAuctions = [];
      
      if (Array.isArray(response.data)) {
        allAuctions = response.data;
      } else if (response.data?.results) {
        allAuctions = response.data.results;
      } else if (response.data?.data) {
        allAuctions = response.data.data;
      }
      
      // Filter only watchlisted auctions and process images
      const watchlistedAuctions = allAuctions
        .filter(auction => watchlistedIds.includes(auction.id))
        .map(auction => ({
          ...auction,
          images: auction.images?.map(img => ({
            ...img,
            image: img.image && !img.image.startsWith("http") 
              ? `${API_BASE_URL}${img.image}` 
              : img.image
          })) || []
        }));
      
      setWatchlist(watchlistedAuctions);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (auctionId) => {
    try {
      const stored = localStorage.getItem(`watchlist_${user?.email || 'buyer'}`);
      const watchlistedIds = stored ? JSON.parse(stored) : [];
      const newIds = watchlistedIds.filter(id => id !== auctionId);
      
      localStorage.setItem(`watchlist_${user?.email || 'buyer'}`, JSON.stringify(newIds));
      setWatchlist(watchlist.filter(auction => auction.id !== auctionId));
      alert('Removed from watchlist');
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      alert('Failed to remove from watchlist');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadWatchlist}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your watchlist is empty</p>
          <a 
            href="/buyer/browse-auctions" 
            className="text-indigo-600 hover:underline"
          >
            Browse auctions to add items
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((auction) => (
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200">
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
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{auction.item_name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Starting Price:</span>
                    <span className="font-semibold">${auction.starting_price}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Bid:</span>
                    <span className="font-semibold text-green-600">
                      ${auction.current_price || auction.starting_price}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condition:</span>
                    <span className="capitalize">{auction.condition}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    View Details
                  </button>
                  <button 
                    onClick={() => removeFromWatchlist(auction.id)}
                    className="px-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;