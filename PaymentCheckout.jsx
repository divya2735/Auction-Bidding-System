// src/pages/Buyer/PaymentCheckout.jsx
/**
 * Payment checkout page for auction winners.
 * Uses Stripe Elements (CardElement) for secure card collection.
 * 
 * Fixes:
 * - Uses CardElement instead of vanilla inputs
 * - Proper Stripe Elements initialization
 * - Correct payment flow with Elements
 * - HTTPS warning addressed in browser console
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../utils/axiosInstance';

const PaymentCheckout = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  
  // ✅ Use Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  const [auctionData, setAuctionData] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Card holder name
  const [cardholderName, setCardholderName] = useState('');

  // Load auction details
  useEffect(() => {
    if (!auctionId) {
      setError('Auction ID not found');
      setLoading(false);
      return;
    }
    fetchAuctionDetails();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching auction:', auctionId);

      const response = await axiosInstance.get(`/auctions/${auctionId}/`);
      console.log('✅ Auction received:', response.data);
      setAuctionData(response.data);
      await createPaymentIntent(response.data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to load auction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (auction) => {
    try {
      console.log('💳 Creating PaymentIntent...');

      const response = await axiosInstance.post('/payments/create-intent/', {
        auction_id: auctionId,
        // Note: amount is NOT sent to prevent client-side fraud
      });

      console.log('✅ PaymentIntent created:', response.data);
      setClientSecret(response.data.client_secret);
    } catch (err) {
      console.error('❌ PaymentIntent error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to create payment. Please try again.'
      );
    }
  };

  // Handle CardElement changes
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // ✅ Validate Stripe is loaded
    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh the page.');
      console.error('❌ Stripe or elements not loaded');
      return;
    }

    if (!clientSecret) {
      setError('Payment system error. Please refresh and try again.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter cardholder name');
      return;
    }

    if (!cardComplete) {
      setError('Please enter complete card details');
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      console.log('🔐 Processing payment...');

      // ✅ Get CardElement from elements
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // ✅ Create PaymentMethod with CardElement
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (pmError) {
        console.error('❌ Payment method error:', pmError.message);
        setError(pmError.message);
        setPaymentProcessing(false);
        return;
      }

      console.log('✅ Payment method created:', paymentMethod.id);

      // ✅ Confirm payment with CardElement
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        console.error('❌ Payment error:', confirmError.message);
        setError(confirmError.message);
        setPaymentStatus('error');
        setPaymentProcessing(false);
        return;
      }

      if (!paymentIntent) {
        throw new Error('No payment intent returned');
      }

      console.log('Payment intent status:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log('🎉 Payment succeeded!', paymentIntent.id);

        try {
          // Confirm payment on backend
          const confirmResponse = await axiosInstance.post('/payments/confirm-payment/', {
            payment_intent_id: paymentIntent.id,
            auction_id: auctionId,
          })
          const paymentId = confirmResponse.data.payment_id

          setPaymentStatus('success');
          setTimeout(() => {
            alert('✅ Payment Successful! Redirecting to your dashboard...');
            navigate(`/payment/success/${paymentId}`);
          }, 2000);
        } catch (err) {
          console.error('❌ Confirm error:', err);
          setError(
            err.response?.data?.error || 
            'Failed to confirm payment. Please contact support.'
          );
          setPaymentStatus('error');
        }
      } else if (paymentIntent.status === 'requires_action') {
        console.log('Payment requires additional action (3D Secure)');
        setError('Additional authentication required. Please follow the instructions.');
        setPaymentStatus('error');
      } else {
        setError(`Payment failed with status: ${paymentIntent.status}`);
        setPaymentStatus('error');
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setPaymentStatus('error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !auctionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button
            onClick={fetchAuctionDetails}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!auctionData) return null;

  const itemCost = parseFloat(auctionData.current_price || auctionData.starting_price || 0);
  const shipping = 25.0;
  const taxes = itemCost * 0.05;
  const totalAmount = itemCost + shipping + taxes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      {/* Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-4xl font-bold mb-2">Congratulations!</h1>
          <p className="text-lg">You won the auction! Complete your payment to claim your item.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 flex items-center justify-center min-h-96">
              <img
                src={
                  auctionData.images?.[0]?.image ||
                  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop'
                }
                alt={auctionData.item_name}
                className="max-w-full max-h-80 object-contain rounded-lg"
              />
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{auctionData.item_name}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{auctionData.description}</p>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Auction Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">📅</span>
                    <span>
                      Won on:{' '}
                      <span className="font-semibold">
                        {new Date(auctionData.end_time).toLocaleDateString()}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">💰</span>
                    <span>
                      Winning Bid: <span className="font-semibold">${itemCost.toFixed(2)}</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl">🏷️</span>
                    <span>
                      Category: <span className="font-semibold">{auctionData.category}</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Payment Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Item Cost:</span>
                  <span className="font-semibold">${itemCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-4 border-b-2 border-gray-300">
                  <span className="text-gray-700">Taxes (5%):</span>
                  <span className="font-semibold">${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-lg text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center border-2 border-indigo-200">
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Total Amount</p>
                <p className="text-5xl font-bold text-gray-900 mb-1">${totalAmount.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">Including all fees and taxes</p>
              </div>
            </div>

            {/* Payment Form */}
            {clientSecret && !paymentStatus && stripe && elements && (
              <form onSubmit={handlePayment} className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Card Details</h3>

                {/* Cardholder Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ✅ Stripe CardElement */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Details
                  </label>
                  <div className="p-3 border-2 border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:shadow-md transition">
                    <CardElement
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#fa755a',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
                    <p className="text-red-700">❌ {error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={paymentProcessing || !cardComplete || !cardholderName.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg text-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {paymentProcessing ? (
                    <>
                      <span className="animate-spin inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    `Pay $${totalAmount.toFixed(2)}`
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  🔒 Your payment information is secure and encrypted
                </p>
              </form>
            )}

            {/* Loading Stripe */}
            {!stripe || !elements ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Loading payment system...</p>
              </div>
            ) : null}

            {/* Success Message */}
            {paymentStatus === 'success' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border-l-4 border-green-600">
                <p className="text-5xl mb-4">✅</p>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h3>
                <p className="text-green-700">Your order is being processed. Redirecting...</p>
              </div>
            )}

            {/* Error Message */}
            {paymentStatus === 'error' && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 text-center border-l-4 border-red-600">
                <p className="text-5xl mb-4">❌</p>
                <p className="text-red-700 text-lg mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setPaymentStatus(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Test Card Info */}
            {!paymentStatus && (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 mb-3">💳 Test Card (For Testing Only)</p>
                <div className="space-y-2 text-sm text-gray-700 font-mono">
                  <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
                  <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
                  <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
                  <p><strong>Name:</strong> Any name</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;