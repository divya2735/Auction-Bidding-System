// File: src/pages/Press.jsx
import React from 'react';

const Press = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Press & Media</h1>
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              Welcome to the LuxeBid Press Center. Here you'll find news, media assets, and contact information for journalists and media inquiries.
            </p>
          </div>
        </section>

        {/* Latest News */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Latest News</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-sm text-indigo-600 font-semibold mb-2">October 2025</p>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">LuxeBid Launches Revolutionary Real-Time Bidding System</h3>
              <p className="text-gray-600 mb-3">
                LuxeBid introduces cutting-edge WebSocket technology for seamless, real-time auction experiences. 
                Users can now see live bidding updates without delays.
              </p>
              <a href="#" className="text-indigo-600 hover:underline font-medium">Read More →</a>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-sm text-indigo-600 font-semibold mb-2">September 2025</p>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">LuxeBid Reaches 100K Active Users Milestone</h3>
              <p className="text-gray-600 mb-3">
                LuxeBid celebrates reaching 100,000 active users and $50M in total items sold. 
                The platform continues to grow at an unprecedented rate in the online auction market.
              </p>
              <a href="#" className="text-indigo-600 hover:underline font-medium">Read More →</a>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-sm text-indigo-600 font-semibold mb-2">August 2025</p>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">LuxeBid Introduces Advanced Dispute Resolution</h3>
              <p className="text-gray-600 mb-3">
                New AI-powered dispute resolution system helps settle conflicts between buyers and sellers 
                more efficiently than ever before.
              </p>
              <a href="#" className="text-indigo-600 hover:underline font-medium">Read More →</a>
            </div>
          </div>
        </section>

        {/* Press Kit */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Press Kit</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="mb-4 text-gray-600">
              Download our official press kit for logos, brand guidelines, and company information.
            </p>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Download Press Kit
            </button>
          </div>
        </section>

        {/* Media Inquiries */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Media Inquiries</h2>
          <p className="mb-4">
            For press inquiries, interview requests, feature stories, or media assets, please contact:
          </p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-28">Email:</span>
              <a href="mailto:press@luxebid.com" className="text-indigo-600 hover:underline">
                press@luxebid.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-28">Phone:</span>
              <span>+91 9773120494</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold w-28">Response Time:</span>
              <span>Within 24 business hours</span>
            </p>
          </div>
        </section>

        {/* About LuxeBid */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">About LuxeBid</h2>
          <p className="text-gray-600 leading-relaxed">
            LuxeBid is a modern online auction platform that revolutionizes how people buy and sell items. 
            With real-time bidding, secure transactions, and a community of verified users, LuxeBid provides 
            the most trusted marketplace for auctions. Founded with a mission to democratize online auctions, 
            LuxeBid has grown to serve over 100,000 active users across the globe.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Press;