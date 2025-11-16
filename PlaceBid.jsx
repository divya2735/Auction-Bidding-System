import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

// Create audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const playCountdownSound = (number) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = number === 1 ? 800 : number === 2 ? 700 : 600;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const playHammerSound = () => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const playExtensionSound = () => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 880;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const PlaceBid = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [wsConnectionStatus, setWsConnectionStatus] = useState('connecting');
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total_seconds: 0
  });
  const [showExtensionNotif, setShowExtensionNotif] = useState(false);
  const [extensionMessage, setExtensionMessage] = useState('');
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hasPlayedFinal3, setHasPlayedFinal3] = useState(false);
  
  const chatSocketRef = useRef(null);
  const auctionSocketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAuction();
    fetchBids();
    fetchChatHistory();
    connectChatWebSocket();
    connectAuctionWebSocket();

    return () => {
      if (chatSocketRef.current) chatSocketRef.current.close();
      if (auctionSocketRef.current) auctionSocketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (auction?.end_time) {
      const timer = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction]);

  // Play countdown sounds in final 3 seconds
  useEffect(() => {
    if (!soundsEnabled || !auction) return;

    const totalSeconds = timeRemaining.total_seconds;
    
    if (totalSeconds === 3 && !hasPlayedFinal3) {
      setHasPlayedFinal3(true);
      playCountdownSound(3);
    } else if (totalSeconds === 2) {
      playCountdownSound(2);
    } else if (totalSeconds === 1) {
      playCountdownSound(1);
    }
  }, [timeRemaining.total_seconds, soundsEnabled, hasPlayedFinal3, auction]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/auctions/${id}/`);
      const auctionData = response.data;

      const processedImages = auctionData.images?.map(img => ({
        ...img,
        image: img.image && !img.image.startsWith("http")
          ? `${API_BASE_URL}${img.image}`
          : img.image
      })) || [];

      setAuction({
        ...auctionData,
        images: processedImages
      });

      const currentPrice = parseFloat(auctionData.current_price || auctionData.starting_price);
      const increment = parseFloat(auctionData.bid_increment);
      setBidAmount((currentPrice + increment).toFixed(2));
    } catch (err) {
      console.error('Error fetching auction:', err);
      alert('Failed to load auction details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await axiosInstance.get(`/auctions/${id}/`);
      setBids(response.data.bids || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setChatLoading(true);
      const response = await axiosInstance.get(`/auctions/${id}/chat/`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const connectChatWebSocket = () => {
    let token = null;
    
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        token = tokens?.access;
      }
    } catch (err) {
      console.error('Error parsing tokens:', err);
    }
    
    if (!token) {
      token = localStorage.getItem('access_token') || 
              localStorage.getItem('token') ||
              sessionStorage.getItem('access_token') ||
              sessionStorage.getItem('token');
    }
    
    if (!token) {
      setWsConnectionStatus('disconnected');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/auctions/${id}/chat/?token=${token}`;
    
    try {
      chatSocketRef.current = new WebSocket(wsUrl);

      chatSocketRef.current.onopen = () => {
        console.log('✅ Chat WebSocket connected');
        setWsConnectionStatus('connected');
      };

      chatSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            user: data.user,
            message: data.message,
            timestamp: data.timestamp
          }]);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      chatSocketRef.current.onerror = (error) => {
        console.error('❌ Chat WebSocket error:', error);
        setWsConnectionStatus('disconnected');
      };

      chatSocketRef.current.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setWsConnectionStatus('disconnected');
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setWsConnectionStatus('disconnected');
    }
  };

  const connectAuctionWebSocket = () => {
    let token = null;
    
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        token = tokens?.access;
      }
    } catch (err) {
      console.error('Error parsing tokens:', err);
    }
    
    if (!token) {
      token = localStorage.getItem('access_token') || 
              localStorage.getItem('token') ||
              sessionStorage.getItem('access_token') ||
              sessionStorage.getItem('token');
    }
    
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/ws/auctions/${id}/`;
    
    try {
      auctionSocketRef.current = new WebSocket(wsUrl);

      auctionSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'auction_extended') {
            if (soundsEnabled) playExtensionSound();
            
            setExtensionMessage(
              `⏰ Auction Extended! ${data.extended_by_seconds} seconds added due to last-minute bid!`
            );
            setShowExtensionNotif(true);
            
            setTimeout(() => setShowExtensionNotif(false), 5000);
            
            fetchAuction();
            setHasPlayedFinal3(false);
          } else if (data.type === 'send_bid_update') {
            fetchBids();
          } else if (data.type === 'auction_closed' || data.type === 'auction.closed') {
            if (soundsEnabled) playHammerSound();
          }
        } catch (err) {
          console.error('Error parsing auction update:', err);
        }
      };

      auctionSocketRef.current.onerror = (error) => {
        console.error('❌ Auction WebSocket error:', error);
      };
    } catch (err) {
      console.error('Error creating auction WebSocket:', err);
    }
  };

  const calculateTimeRemaining = () => {
    if (!auction?.end_time) return;

    const now = new Date().getTime();
    const end = new Date(auction.end_time).getTime();
    const distance = end - now;

    if (distance < 0) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total_seconds: 0 });
      if (soundsEnabled) playHammerSound();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const total_seconds = Math.floor(distance / 1000);

    setTimeRemaining({
      days,
      hours,
      minutes,
      seconds,
      total_seconds
    });
  };

  const handleBidAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setBidAmount(value);
    }
  };

  const addToBid = (amount) => {
    const currentBid = parseFloat(bidAmount) || 0;
    setBidAmount((currentBid + amount).toFixed(2));
  };

  const handlePlaceBid = async () => {
    const bidValue = parseFloat(bidAmount);
    const currentPrice = parseFloat(auction.current_price || auction.starting_price);
    const minBid = currentPrice + parseFloat(auction.bid_increment);

    if (!bidAmount || bidValue < minBid) {
      alert(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    if (auction.status !== 'active') {
      alert('This auction is no longer active');
      return;
    }

    try {
      const response = await axiosInstance.post(`/bid/place/`, {
        auction_id: parseInt(id),
        bid_amount: parseFloat(bidValue).toFixed(2)
      });

      if (response.data.auction_extended) {
        const extInfo = response.data.extension_info;
        if (soundsEnabled) playExtensionSound();
        
        setExtensionMessage(
          `✅ Your bid placed! Auction extended by ${extInfo.extended_by_seconds} seconds!`
        );
        setShowExtensionNotif(true);
        
        setTimeout(() => setShowExtensionNotif(false), 5000);
        setHasPlayedFinal3(false);
      }

      alert('Bid placed successfully!');
      fetchAuction();
      fetchBids();
      
      const newCurrentPrice = bidValue;
      const increment = parseFloat(auction.bid_increment);
      setBidAmount((newCurrentPrice + increment).toFixed(2));
    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail 
        || 'Failed to place bid. Please try again.';
      
      alert(errorMessage);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!chatSocketRef.current || chatSocketRef.current.readyState !== WebSocket.OPEN) {
      alert('Chat connection is not open. Please wait or refresh the page.');
      return;
    }

    try {
      chatSocketRef.current.send(JSON.stringify({
        message: newMessage.trim()
      }));
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">Auction not found</p>
      </div>
    );
  }

  const increment = parseFloat(auction.bid_increment);
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const messageList = Array.isArray(messages) ? messages : [];
  const isAuctionEnded = timeRemaining.total_seconds <= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span className="mr-1">←</span> Back to Auction Detail
        </button>

        {/* Extension Notification */}
        {showExtensionNotif && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500 rounded-lg animate-pulse">
            <p className="text-green-800 font-bold text-lg">{extensionMessage}</p>
          </div>
        )}

        {/* Sound Control */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              soundsEnabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {soundsEnabled ? '🔊 Sounds ON' : '🔇 Sounds OFF'}
          </button>
          <span className="text-sm text-gray-600">
            Audio alerts: 3-2-1 countdown + hammer when sold
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6">{auction.item_name}</h1>
              
              {auction.images && auction.images.length > 0 ? (
                <>
                  <img
                    src={auction.images[0].image}
                    alt={auction.item_name}
                    className="w-full h-80 object-contain bg-white border border-gray-200 rounded-lg mb-4"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {auction.images.slice(0, 3).map((image, index) => (
                      <div key={index} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img 
                          src={image.image} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-24 object-contain p-2 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {auction.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Timer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Time Remaining</span>
              </div>

              <div className={`grid grid-cols-4 gap-4 mb-6 p-4 rounded-lg transition-all ${
                timeRemaining.total_seconds <= 30 && timeRemaining.total_seconds > 0
                  ? 'bg-red-100 border-2 border-red-500 animate-pulse' 
                  : 'bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${timeRemaining.days === 0 && 'text-gray-400'}`}>
                    {String(timeRemaining.days).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase mt-1">Days</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${timeRemaining.hours === 0 && 'text-gray-400'}`}>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase mt-1">Hours</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${timeRemaining.minutes === 0 && 'text-gray-400'}`}>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase mt-1">Minutes</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    timeRemaining.seconds <= 3 && timeRemaining.total_seconds > 0
                      ? 'text-red-600 animate-pulse text-5xl' 
                      : ''
                  }`}>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase mt-1">Seconds</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
                <p className="text-4xl font-bold">
                  ${parseFloat(auction.current_price || auction.starting_price).toLocaleString()}
                </p>
              </div>

              {/* Snipe Protection Info */}
              {auction.snipe_protection?.enabled && (
                <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold mb-1">🛡️ Snipe Protection Active</p>
                  <p className="text-xs text-blue-600">
                    Bid within {auction.snipe_protection.threshold_seconds}s of end? Auction extends by {Math.round(auction.snipe_protection.extension_duration_seconds / 60)} min
                  </p>
                  {auction.snipe_protection.times_extended > 0 && (
                    <p className="text-xs text-blue-600 mt-1 font-semibold">
                      ⏰ Already extended {auction.snipe_protection.times_extended} time(s)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bid Placement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>
              <p className="text-sm text-gray-600 mb-4">Your Bid Amount</p>

              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => {
                    const current = parseFloat(bidAmount) || 0;
                    if (current > increment) {
                      setBidAmount((current - increment).toFixed(2));
                    }
                  }}
                  className="w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-50 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAuctionEnded || auction.status !== 'active'}
                >
                  −
                </button>
                <input
                  type="text"
                  value={bidAmount}
                  onChange={handleBidAmountChange}
                  className="flex-1 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isAuctionEnded || auction.status !== 'active'}
                />
                <button
                  onClick={() => addToBid(increment)}
                  className="w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-50 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAuctionEnded || auction.status !== 'active'}
                >
                  +
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {[25, 50, 100, 250].map((amount, index) => (
                  <button
                    key={index}
                    onClick={() => addToBid(amount)}
                    className="py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAuctionEnded || auction.status !== 'active'}
                  >
                    + ${amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePlaceBid}
                className="w-full py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isAuctionEnded || auction.status !== 'active'}
              >
                {isAuctionEnded ? '🔨 Auction Ended' : '💰 Place Bid'}
              </button>
            </div>
          </div>

          {/* Bids List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Bids</h2>
              {bids.length > 0 && (
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {bids.length} bids
                </span>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bids.length > 0 ? (
                sortedBids.map((bid, index) => (
                  <div 
                    key={bid.id} 
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                      index === 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {bid.user_name?.charAt(0).toUpperCase() || 'B'}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {bid.user_name}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono whitespace-nowrap">
                          {bid.ticket_id}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                            🏆 Highest
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        ${parseFloat(bid.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(bid.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium">No bids yet</p>
                  <p className="text-sm">Be the first to bid!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Seller
                </h2>
                <p className="text-sm text-blue-100 mt-1">Ask questions about this auction</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  wsConnectionStatus === 'connected' ? 'bg-green-400' :
                  wsConnectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`}></div>
                <span className="text-sm text-blue-100">
                  {wsConnectionStatus === 'connected' ? 'Connected' :
                   wsConnectionStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {chatLoading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messageList.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with the seller!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messageList.map((msg, index) => {
                  const isOwnMessage = msg.user === user?.email;
                  return (
                    <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwnMessage 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">{msg.user}</p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                            {formatMessageTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || wsConnectionStatus !== 'connected'}
                className={`px-6 py-2 rounded-md flex items-center font-medium transition-colors ${
                  newMessage.trim() && wsConnectionStatus === 'connected'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </div>
            {wsConnectionStatus === 'disconnected' && (
              <div className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-xs text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Chat disconnected
                </p>
                <button
                  onClick={connectChatWebSocket}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Reconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceBid;