// File: src/pages/HelpCenter.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HelpCenter = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I place a bid?",
      answer: "Navigate to the auction item you're interested in, enter your bid amount (which must be higher than the current bid), and click 'Place Bid'. Your bid is now active! If someone outbids you, you'll receive a notification."
    },
    {
      id: 2,
      question: "How do I list an item for auction?",
      answer: "Sign up as a seller, go to 'Create Listing', add item details, upload photos, set your starting price and reserve price, add description, select category, and publish. Your auction will be live immediately!"
    },
    {
      id: 3,
      question: "How is payment processed?",
      answer: "We accept all major credit cards, debit cards, and digital wallets through our secure payment partners. Payment is processed only after you win an auction. All transactions are encrypted and secure."
    },
    {
      id: 4,
      question: "What if I have a dispute with a buyer or seller?",
      answer: "Visit your Disputes section in your dashboard. File a dispute with relevant details and evidence. Our support team will review both sides and mediate to find a fair resolution within 7 business days."
    },
    {
      id: 5,
      question: "Can I cancel or modify my bid?",
      answer: "Bids are generally final once placed. However, you can contact our support team to request cancellation before the auction ends. Sellers can cancel auctions under certain circumstances."
    },
    {
      id: 6,
      question: "How long does shipping take?",
      answer: "Shipping time depends on the seller's location and your address. Most items ship within 3-5 business days. Sellers must provide tracking information. You can communicate directly with the seller for delivery updates."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Help Center</h1>
      
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              Welcome to LuxeBid Help Center. Find answers to common questions and get support with your account.
            </p>
          </div>
        </section>

        {/* Search Bar */}
        <section>
          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-indigo-600 mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600">Learn how to create an account and get started.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-indigo-600 mb-2">Buying Guide</h3>
              <p className="text-sm text-gray-600">Tips for finding and winning auctions.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-indigo-600 mb-2">Selling Guide</h3>
              <p className="text-sm text-gray-600">How to list items and manage auctions.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-indigo-600 transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <p className="mb-4 text-gray-700">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-32">📧 Email:</span>
              <a href="mailto:support@luxebid.com" className="text-indigo-600 hover:underline">
                support@luxebid.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32">📞 Phone:</span>
              <span>+91 9773120494</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32">🕐 Hours:</span>
              <span>24/7 Support Available</span>
            </p>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {['Account & Security', 'Buying & Bidding', 'Selling & Listings', 'Payments & Shipping', 'Disputes & Issues', 'Policies & Safety'].map((category, idx) => (
              <div key={idx} className="px-4 py-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                {category}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;