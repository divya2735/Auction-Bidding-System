import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [auctionStatus, setAuctionStatus] = useState('upcoming');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [loadingSellerData, setLoadingSellerData] = useState(false);

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (auction?.seller) {
      // seller can be either an ID (number) or an object with id property
      const sellerId = typeof auction.seller === 'object' ? auction.seller.id : auction.seller;
      console.log('Auction seller:', auction.seller);
      console.log('Seller ID to fetch:', sellerId);
      if (sellerId) {
        fetchSellerProfile(sellerId);
        fetchSellerAuctions(sellerId);
      }
    }
  }, [auction?.seller]);

  useEffect(() => {
    if (auction?.start_time || auction?.end_time) {
      const timer = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction]);

  // Auto-slide images every 2 seconds
  useEffect(() => {
    if (auction?.images && auction.images.length > 1) {
      const slideInterval = setInterval(() => {
        setSelectedImage((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= auction.images.length ? 0 : nextIndex;
        });
      }, 2000);

      return () => clearInterval(slideInterval);
    }
  }, [auction?.images]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/auctions/${id}/`);
      const auctionData = response.data;
      console.log('Auction seller field:', auctionData.seller);
      console.log('Full auction data:', auctionData);
      console.log('Seller field:', auctionData.seller);
      
      
      const processedImages = auctionData.images?.map(img => ({
        ...img,
        image: img.image && !img.image.startsWith("http") 
          ? `${API_BASE_URL}${img.image}` 
          : img.image
      })) || [];
      
      setAuction({ ...auctionData, images: processedImages });
      setError(null);
    } catch (err) {
      console.error('Error fetching auction:', err);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProfile = async (sellerId) => {
    try {
      setLoadingSellerData(true);
      console.log('Fetching seller profile for ID:', sellerId);
      const response = await axiosInstance.get(`/sellers/${sellerId}/profile/`);
      console.log('Seller profile response:', response.data);
      setSellerProfile(response.data);
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      console.error('Error URL:', `/sellers/${sellerId}/profile/`);
      console.error('Error details:', err.response?.status, err.response?.data);
    } finally {
      setLoadingSellerData(false);
    }
  };

  const fetchSellerAuctions = async (sellerId) => {
    try {
      console.log('Fetching seller auctions for ID:', sellerId);
      const response = await axiosInstance.get(`/sellers/${sellerId}/auctions/`);
      console.log('Seller auctions response:', response.data);
      // Filter out current auction from the list
      const otherAuctions = response.data.filter(a => a.id !== parseInt(id));
      setSellerAuctions(otherAuctions.slice(0, 4)); // Show only first 4
    } catch (err) {
      console.error('Error fetching seller auctions:', err);
      console.error('Error URL:', `/sellers/${sellerId}/auctions/`);
      console.error('Error details:', err.response?.status, err.response?.data);
    }
  };

  const calculateTimeRemaining = () => {
    if (!auction) return;
    
    const now = new Date().getTime();
    const startTime = new Date(auction.start_time).getTime();
    const endTime = new Date(auction.end_time).getTime();

    if (now < startTime) {
      setAuctionStatus('upcoming');
      const distance = startTime - now;

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return;
    }

    if (now >= startTime && now < endTime) {
      setAuctionStatus('active');
      const distance = endTime - now;

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return;
    }

    setAuctionStatus('ended');
    setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading auction details...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error || 'Auction not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isBidButtonEnabled = auctionStatus === 'active';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span className="mr-1">←</span> Back to Browse Auctions
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Title and Actions */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{auction.item_name}</h1>
            <div className="flex space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Share">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Add to Watchlist">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Images */}
            <div>
              <div className="bg-white rounded-lg overflow-hidden mb-4 border border-gray-200" style={{ height: '400px' }}>
                {auction.images && auction.images.length > 0 ? (
                  <img 
                    src={auction.images[selectedImage]?.image} 
                    alt={auction.item_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Images Available
                  </div>
                )}
              </div>

              {auction.images && auction.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {auction.images.slice(0, 3).map((image, index) => (
                    <div 
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden bg-white ${
                        selectedImage === index ? 'border-gray-800' : 'border-gray-300'
                      }`}
                    >
                      <img 
                        src={image.image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-24 object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Bid Section */}
            <div>
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {auctionStatus === 'upcoming' ? 'Starts in' : auctionStatus === 'active' ? 'Time Remaining' : 'Auction Ended'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{String(timeRemaining.days).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-500 uppercase mt-1">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{String(timeRemaining.hours).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-500 uppercase mt-1">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-500 uppercase mt-1">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-500 uppercase mt-1">Seconds</div>
                    </div>
                  </div>
                </div>

                {auctionStatus === 'upcoming' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 text-center">
                      Auction hasn't started yet. Bidding will open soon!
                    </p>
                  </div>
                )}

                {auctionStatus === 'ended' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 text-center">
                      This auction has ended
                    </p>
                  </div>
                )}

                <div className="border-t border-b border-gray-200 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Starting Price</span>
                    <span className="text-xl font-bold">${auction.starting_price.toLocaleString()}</span>
                  </div>
                  {auction.reserve_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reserve Price</span>
                      <span className="text-xl font-bold">${auction.reserve_price.toLocaleString()}</span>
                    </div>
                  )}
                  {auctionStatus === 'active' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Bid</span>
                      <span className="text-xl font-bold text-green-600">
                        ${(auction.current_price || auction.starting_price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate(`/auction/${id}/bid`)}
                  disabled={!isBidButtonEnabled}
                  className={`w-full py-3 rounded-md font-semibold mt-6 transition-all ${
                    isBidButtonEnabled 
                      ? 'bg-gray-800 text-white hover:bg-gray-900 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  {auctionStatus === 'upcoming' ? 'Auction Not Started' : auctionStatus === 'ended' ? 'Auction Ended' : 'Bid Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              {auction.description.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Seller Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6">Seller Information</h2>
          
          {loadingSellerData ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading seller information...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  {/* Profile Image */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 overflow-hidden bg-gray-200">
                    {sellerProfile?.profile_image_url ? (
                      <img 
                        src={sellerProfile.profile_image_url} 
                        alt={sellerProfile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-gray-500">👤</span>
                    )}
                  </div>
                  
                  {/* Seller Info */}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {sellerProfile?.full_name || sellerProfile?.first_name || sellerProfile?.email || 'Unknown Seller'}
                    </h3>
                    {sellerProfile?.business_name && (
                      <p className="text-sm text-gray-600">{sellerProfile.business_name}</p>
                    )}
                    {sellerProfile?.city && sellerProfile?.state && (
                      <p className="text-sm text-gray-500">
                        {sellerProfile.city}, {sellerProfile.state}
                      </p>
                    )}
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span className="mr-3">
                        📦 {sellerProfile?.total_auctions || 0} Total Auctions
                      </span>
                      <span className="text-green-600">
                        ✓ {sellerProfile?.active_auctions || 0} Active
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* View Profile Button */}
                {auction.seller && (
                  <button
                    onClick={() => {
                      const sellerId = typeof auction.seller === 'object' ? auction.seller.id : auction.seller;
                      navigate(`/sellers/${sellerId}/profile`);
                    }}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    View Profile
                  </button>
                )}
              </div>

              {/* More from this Seller */}
              <h3 className="text-lg font-bold mb-4">More from this Seller</h3>
              
              {sellerAuctions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sellerAuctions.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => navigate(`/auction/${item.id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="bg-gray-100 h-32 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                        {item.first_image ? (
                          <img 
                            src={item.first_image} 
                            alt={item.item_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm mb-1 truncate" title={item.item_name}>
                        {item.item_name}
                      </p>
                      <p className="text-gray-900 font-bold">
                        ${(item.current_price || item.starting_price).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' :
                        item.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No other auctions from this seller</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;