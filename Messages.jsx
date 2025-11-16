import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auctionId = searchParams.get('auction');
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [auction, setAuction] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (auctionId) {
      fetchAuction();
      fetchMessages();
    }
  }, [auctionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAuction = async () => {
    try {
      const response = await axiosInstance.get(`/auctions/${auctionId}/`);
      setAuction(response.data);
    } catch (err) {
      console.error('Error fetching auction:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/`, {
        params: { auction_id: auctionId }
      });
      
      // Handle response structure
      const messageList = Array.isArray(response.data) 
        ? response.data 
        : response.data?.messages || [];
      
      setMessages(messageList);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axiosInstance.post('/messages/', {
        auction_id: auctionId,
        message: newMessage.trim()
      });

      // Add new message to list
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              ←
            </button>
            <img src="/luxe-bid-logo.png" alt="LuxeBid" className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">♥</button>
            <button className="text-gray-600 hover:text-gray-900">🔔</button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user?.email}</span>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Auction Context Banner */}
          {auction && (
            <div className="bg-white border rounded-lg m-6 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    Ongoing Conversation: {auction.item_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Current Bid: ${(auction.current_price || auction.starting_price).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Time Remaining: {/* Calculate from auction.end_time */}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {auction.status === 'active' ? 'Active' : auction.status}
                </span>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.sender_id === user?.id || msg.sender === user?.email;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id || index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                    {!isCurrentUser && !showAvatar && (
                      <div className="w-10 flex-shrink-0"></div>
                    )}

                    <div
                      className={`max-w-md rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {!isCurrentUser && showAvatar && (
                        <p className="text-xs font-semibold mb-1">
                          {msg.sender_name || 'Seller'}
                        </p>
                      )}
                      <p className="text-sm">{msg.message || msg.content}</p>
                      <div className="flex items-center justify-between mt-1 space-x-2">
                        <p
                          className={`text-xs ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.created_at || msg.timestamp)}
                        </p>
                        {auction && (
                          <p
                            className={`text-xs ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            Auction: {auction.item_name.substring(0, 20)}...
                          </p>
                        )}
                      </div>
                    </div>

                    {isCurrentUser && showAvatar && (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                    {isCurrentUser && !showAvatar && (
                      <div className="w-10 flex-shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t p-4">
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-300">Product</a>
            <a href="#" className="hover:text-gray-300">Resources</a>
            <a href="#" className="hover:text-gray-300">Company</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">f</a>
            <a href="#" className="hover:text-gray-300">t</a>
            <a href="#" className="hover:text-gray-300">in</a>
            <a href="#" className="hover:text-gray-300">gh</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Messages;