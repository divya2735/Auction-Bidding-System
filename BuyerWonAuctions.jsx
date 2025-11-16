import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CreditCard, CheckCircle, Clock, DollarSign, Package } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const BuyerWonAuctions = () => {
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [auctionOrders, setAuctionOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWonAuctions();
  }, []);

  const fetchWonAuctions = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get('/buyer/won-auctions/');
      const auctions = response.data.results || response.data || [];
      
      setWonAuctions(auctions);
      
      if (auctions.length > 0) {
        await fetchOrderStatuses(auctions);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching won auctions:', err);
      setError(err.response?.data?.detail || 'Failed to load won auctions');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async (auctions) => {
    try {
      const orders = {};
      
      for (const auction of auctions) {
        try {
          const orderResponse = await axiosInstance.get(
            `orders/?auction_item=${auction.id}`
          );
          
          const orderList = orderResponse.data.results || orderResponse.data || [];
          
          if (orderList.length > 0) {
            const order = orderList[0];
            
            const paymentStatus = order.payment?.status || null;
            const isPaid = paymentStatus === 'succeeded';
            
            orders[auction.id] = {
              id: order.id,
              orderStatus: order.status,
              paymentStatus: paymentStatus,
              isPaid: isPaid,
              paymentId: order.payment?.id || null
            };
          } else {
            orders[auction.id] = {
              id: null,
              orderStatus: null,
              paymentStatus: null,
              isPaid: false,
              paymentId: null
            };
          }
        } catch (err) {
          console.warn(`Could not fetch order for auction ${auction.id}:`, err.message);
          orders[auction.id] = {
            id: null,
            orderStatus: null,
            paymentStatus: null,
            isPaid: false,
            paymentId: null
          };
        }
      }
      
      setAuctionOrders(orders);
    } catch (err) {
      console.error('Error fetching order statuses:', err);
      setAuctionOrders({});
    }
  };

  const handlePaymentClick = (auctionId) => {
    navigate(`/payment/checkout/${auctionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your won auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button 
            onClick={fetchWonAuctions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Won Auctions</h1>
          </div>
          <p className="text-gray-600">
            Congratulations! You won {wonAuctions.length} auction{wonAuctions.length !== 1 ? 's' : ''}. 
            Complete payment to claim your items.
          </p>
        </div>

        {/* No Auctions */}
        {wonAuctions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Won Auctions Yet</h3>
            <p className="text-gray-600 mb-6">
              Keep bidding on auctions to win amazing items!
            </p>
            <button
              onClick={() => navigate('/buyer/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Auctions
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonAuctions.map((auction) => {
              const orderInfo = auctionOrders[auction.id] || {
                id: null,
                orderStatus: null,
                paymentStatus: null,
                isPaid: false,
                paymentId: null
              };

              return (
                <div
                  key={auction.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Winner Badge */}
                  <div className="relative">
                    <img
                      src={auction.images?.[0]?.image || '/api/placeholder/400/300'}
                      alt={auction.item_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold">WINNER!</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {auction.item_name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {auction.description}
                    </p>

                    {/* Price & Status */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Winning Bid
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ${parseFloat(auction.current_price).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Won Date
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(auction.end_time).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Payment Status
                        </span>
                        {orderInfo.isPaid ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Paid
                          </span>
                        ) : orderInfo.paymentStatus ? (
                          <span className="flex items-center gap-1 text-blue-600 font-semibold text-sm capitalize">
                            <Clock className="w-4 h-4" />
                            {orderInfo.paymentStatus}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!orderInfo.isPaid ? (
                      <button
                        onClick={() => handlePaymentClick(auction.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <CreditCard className="w-5 h-5" />
                        Complete Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/transaction/${orderInfo.paymentId}`)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        View Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerWonAuctions;