import React, { useState, useEffect } from 'react';

const About = () => {
  const [userRole, setUserRole] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    // Try multiple ways to get user role
    let role = localStorage.getItem('userRole');
    
    // If not found, try other common keys
    if (!role) {
      role = localStorage.getItem('role');
    }
    
    // If stored in user object
    if (!role) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          role = user.role || user.userRole || user.user_type || user.type;
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
    
    // Convert to lowercase for consistent checking
    if (role) {
      role = role.toLowerCase();
    }
    
    console.log('Detected user role:', role); // Debug log
    setUserRole(role);
  }, []);

  const handleBuyerClick = () => {
    if (userRole === 'seller') {
      setPopupMessage('You Login with Seller Account! If you want to buy an item, please signup as a Buyer with a different email.');
      setShowPopup(true);
    } else {
      window.location.href = '/buyer/browse-auctions';
    }
  };

  const handleSellerClick = () => {
    if (userRole === 'buyer') {
      setPopupMessage('You Login with Buyer Account! If you want to sell an item, please signup as a Seller with a different email.');
      setShowPopup(true);
    } else {
      window.location.href = '/seller/create-listing';
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Wrong Button!</h3>
              <p className="text-gray-700 text-lg mb-6">{popupMessage}</p>
              <button
                onClick={closePopup}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6">About LuxeBid</h1>
      
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg mb-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              LuxeBid is a modern online auction platform that connects buyers and sellers 
              in a secure, transparent, and efficient marketplace. We make it easy for anyone 
              to buy and sell premium items through our competitive bidding system.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">🎯</span> Our Mission
          </h2>
          <p className="leading-relaxed">
            To revolutionize online auctions by providing a trusted platform where buyers can 
            discover unique items and sellers can reach a global audience. We believe in fair 
            pricing, transparency, and creating value for our community.
          </p>
        </section>

        {/* Why Choose LuxeBid */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">⭐</span> Why Choose LuxeBid?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">🔒 Secure Transactions</h3>
              <p className="text-sm">
                Advanced encryption and secure payment processing to protect your financial information.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">⚡ Real-Time Bidding</h3>
              <p className="text-sm">
                Live updates on auction activity so you never miss an opportunity to bid.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">✅ Verified Sellers</h3>
              <p className="text-sm">
                All sellers are verified to ensure authenticity and build trust in our community.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">📱 Mobile Friendly</h3>
              <p className="text-sm">
                Bid on the go with our responsive design that works on any device.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">🎨 Wide Variety</h3>
              <p className="text-sm">
                From electronics to collectibles, find items across multiple categories.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">💬 24/7 Support</h3>
              <p className="text-sm">
                Our dedicated support team is always ready to help with any questions.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">🚀</span> How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Create an Account</h3>
                <p className="text-gray-600">Sign up as a buyer or seller in just a few minutes.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Browse or List Items</h3>
                <p className="text-gray-600">Explore thousands of auctions or create your own listings.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Place Bids or Accept Offers</h3>
                <p className="text-gray-600">Participate in live auctions with real-time updates.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">Complete Transaction</h3>
                <p className="text-gray-600">Secure payment and smooth delivery process.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">💎</span> Our Values
          </h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Transparency:</strong> Clear policies and open communication</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Trust:</strong> Building a safe and reliable marketplace</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Innovation:</strong> Constantly improving the auction experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Community:</strong> Supporting buyers and sellers equally</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Meet Our Team */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">👥</span> Meet Our Team
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            The talented individuals behind LuxeBid who are passionate about creating 
            the best auction experience for you.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Raghu Patel - Team Leader */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-t-4 border-indigo-600">
              <div className="relative bg-gray-100">
                <img 
                  src="/team/raghu.jpeg" 
                  alt="Raghu Patel"
                  className="w-full h-64 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Raghu+Patel';
                  }}
                />
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  Team Leader
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Raghu Patel</h3>
                <p className="text-indigo-600 font-semibold mb-3">Backend Developer</p>
                <p className="text-gray-600 text-sm mb-4">
                  The backbone of LuxeBid! Raghu architected and built the entire backend infrastructure, 
                  ensuring robust APIs, real-time bidding systems, and secure transactions. As team leader, 
                  he also jumps in to solve frontend challenges whenever needed.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    Django
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    Python
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    REST API
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    WebSockets
                  </span>
                </div>
              </div>
            </div>

            {/* Divya Patel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-t-4 border-purple-600">
              <div className="relative">
                <img 
                  src="/team/divy.jpg" 
                  alt="Divya Patel"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/9333EA/FFFFFF?text=Divya+Patel';
                  }}
                />
                <div className="absolute top-4 right-4 bg-purple-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Frontend Architect
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Divya Patel</h3>
                <p className="text-purple-600 font-semibold mb-3">Frontend Developer</p>
                <p className="text-gray-600 text-sm mb-4">
                  The wizard behind the seamless user experience! Divya crafted every page, component, 
                  and interaction you see. He's not just a frontend expert - He also dives into backend 
                  code to customize APIs and fix integration issues for optimal performance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    React.js
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    JavaScript
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    Tailwind CSS
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    Full-Stack
                  </span>
                </div>
              </div>
            </div>

            {/* Priyanshu Patel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-t-4 border-pink-600">
              <div className="relative">
                <img 
                  src="/team/kachhi.jpeg" 
                  alt="Priyanshu Patel"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Priyanshu+Patel';
                  }}
                />
                <div className="absolute top-4 right-4 bg-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Design Lead
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Priyanshu Patel</h3>
                <p className="text-pink-600 font-semibold mb-3">UI/UX Designer</p>
                <p className="text-gray-600 text-sm mb-4">
                  The creative genius who makes LuxeBid beautiful! Priyanshu designed every visual element, 
                  from the color palette to the layout structure. His attention to detail ensures that every 
                  interaction is intuitive, elegant, and delightful for our users.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    Figma
                  </span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    UI Design
                  </span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    UX Research
                  </span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    Prototyping
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Quote */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-lg text-center">
            <p className="text-xl italic mb-2">
              "Together, we're not just building an auction platform - we're creating 
              a community where trust, transparency, and innovation thrive."
            </p>
            <p className="text-indigo-200 font-semibold">- Team LuxeBid</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 flex items-center">
            <span className="mr-2">📧</span> Get in Touch
          </h2>
          <p className="mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-24">Email:</span>
              <a href="mailto:team.luxebid@gmail.com" className="text-indigo-600 hover:underline">
                team.luxebid@gmail.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-24">Phone:</span>
              <span>+91 9773120494</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-24">Location:</span>
              <span>Patan, Gujarat, IND</span>
            </p>
          </div>
        </section>

        {/* Join Us */}
        <section className="text-center bg-indigo-600 text-white p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Join LuxeBid Today!</h2>
          <p className="text-lg mb-6">
            Start buying or selling premium items in our trusted marketplace.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>

            <button 
              onClick={handleBuyerClick}
              className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-colors border-2 border-white"
            >
              If you want to buy an item, Click Here
            </button>

            <button 
              onClick={handleSellerClick}
              className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-colors border-2 border-white"
            >
              If you want to sell an item, Click Here
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;