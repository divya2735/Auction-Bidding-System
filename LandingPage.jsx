// File: src/pages/Guest/LandingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import LandingNavbar from '../Guest/LandingNavbar';
import Footer from '../../components/Footer';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetchFeaturedAuctions();
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
      setLoadingFeatured(true);
      const response = await axiosInstance.get('/featured/?limit=6');
      
      let auctionList = [];
      if (response.data.results && Array.isArray(response.data.results)) {
        auctionList = response.data.results;
      } else if (Array.isArray(response.data)) {
        auctionList = response.data;
      }

      // Process images - convert relative URLs to absolute
      const processedAuctions = auctionList.map(auction => ({
        ...auction,
        images: auction.images?.map(img => ({
          ...img,
          image: img.image && !img.image.startsWith("http") 
            ? `${API_BASE_URL}${img.image}` 
            : img.image
        })) || []
      }));

      setFeaturedAuctions(processedAuctions);
      
    } catch (err) {
      console.error('Error fetching featured auctions:', err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  return (
    <>
      <LandingNavbar user={user} onLogout={logout} />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bid Smart, Win Big
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of buyers and sellers in the most trusted online auction platform. 
            Discover amazing deals and sell your items to the highest bidder.
          </p>
          
          {/* <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/browse')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              Browse Auctions <ArrowRight className="w-5 h-5" />
            </button>
            {!user && (
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
              >
                Create Account
              </button>
            )}
          </div> */}

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-indigo-600">50K+</p>
              <p className="text-gray-600 mt-2">Active Auctions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-indigo-600">100K+</p>
              <p className="text-gray-600 mt-2">Active Users</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-4xl font-bold text-indigo-600">$50M+</p>
              <p className="text-gray-600 mt-2">Items Sold</p>
            </div>
          </div> */}
        </section>

        {/* Featured Auctions Section */}
        <section id="featured" className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Auctions</h2>
          <p className="text-gray-600 mb-12">Check out these popular auctions happening right now</p>

          {loadingFeatured ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : featuredAuctions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active auctions at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.map((auction) => (
                <div 
                  key={auction.id}
                  onClick={() => navigate(`/auction/${auction.id}`)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {auction.images && auction.images.length > 0 ? (
                        <img 
                          src={auction.images[0].image}
                          alt={auction.item_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Image failed to load:', auction.images[0].image);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}
                                          
                    {/* Status Badge */}
                    {auction.status && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 capitalize">{auction.category || 'Uncategorized'}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">
                      {auction.item_name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-1">
                      {auction.description}
                    </p>

                    <div className="space-y-2 mb-4 pb-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Starting Price:</span>
                        <span className="font-semibold text-gray-900">
                          ${parseFloat(auction.starting_price).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Current Bid:</span>
                        <span className="font-semibold text-green-600">
                          ${parseFloat(auction.current_price || auction.starting_price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/browse')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              View All Auctions
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Browse & Search</h3>
                <p className="text-gray-600">
                  Browse our extensive collection of auctions. Use filters to find exactly what you're looking for.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Place Your Bid</h3>
                <p className="text-gray-600">
                  Create an account and place bids on items you love. Outbid other buyers and win!
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Win & Checkout</h3>
                <p className="text-gray-600">
                  Win the auction and complete your purchase securely. Items ship directly to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Auction Hub?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Safe</h3>
                <p className="text-gray-600">
                  All transactions are protected. Your personal and payment information is secure.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Get instant notifications about auctions you're interested in and bids on your items.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Community</h3>
                <p className="text-gray-600">
                  Join a community of verified buyers and sellers with transparent ratings and reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="bg-indigo-600 py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Bidding?</h2>
              <p className="text-indigo-100 mb-8 text-lg">
                Sign up now and get access to thousands of auctions. Join our community of buyers and sellers.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
              >
                Create Your Free Account
              </button>
            </div>
          </section>
        )}

        {/* Footer - Using the Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;