import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: October 2025</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using LuxeBid ("the Platform"), you agree to be bound by these Terms and Conditions. 
            If you do not agree with any part of these terms, you must not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. User Accounts</h2>
          <p className="mb-2">When creating an account on LuxeBid, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Auction Rules</h2>
          <p className="mb-2">All users participating in auctions must follow these rules:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Bids are legally binding commitments to purchase</li>
            <li>Sellers must honor the final winning bid</li>
            <li>Reserve prices may be set by sellers</li>
            <li>Auction manipulation or shill bidding is strictly prohibited</li>
            <li>All transactions must be completed within the specified timeframe</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Seller Responsibilities</h2>
          <p className="mb-2">Sellers on LuxeBid agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate descriptions of items</li>
            <li>Upload genuine photos of items</li>
            <li>Set reasonable starting prices and reserve prices</li>
            <li>Honor all winning bids unless item is unavailable</li>
            <li>Ship items promptly after payment</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Buyer Responsibilities</h2>
          <p className="mb-2">Buyers on LuxeBid agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only bid on items they intend to purchase</li>
            <li>Complete payment within the specified timeframe</li>
            <li>Review item descriptions carefully before bidding</li>
            <li>Communicate with sellers regarding shipping and delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">6. Payments and Fees</h2>
          <p>
            LuxeBid may charge service fees for listing items or completing transactions. 
            All fees will be clearly displayed before you commit to any transaction. 
            Payment processing is handled securely through our approved payment partners.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">7. Disputes</h2>
          <p>
            In case of disputes between buyers and sellers, LuxeBid provides a dispute resolution system. 
            Users must attempt to resolve issues directly first. If unresolved, our support team will 
            mediate based on the evidence provided by both parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">8. Prohibited Items</h2>
          <p className="mb-2">The following items cannot be listed on LuxeBid:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Illegal items or services</li>
            <li>Stolen property</li>
            <li>Counterfeit goods</li>
            <li>Weapons and explosives</li>
            <li>Hazardous materials</li>
            <li>Items that violate intellectual property rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">9. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand 
            how we collect, use, and protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">10. Limitation of Liability</h2>
          <p>
            LuxeBid acts as a platform connecting buyers and sellers. We are not responsible for 
            the quality, safety, or legality of items listed, the accuracy of listings, or the 
            ability of buyers to pay or sellers to deliver items.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">11. Modifications to Terms</h2>
          <p>
            LuxeBid reserves the right to modify these Terms and Conditions at any time. 
            Continued use of the platform after changes constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">12. Contact Information</h2>
          <p>
            For questions about these Terms and Conditions, please contact us at:
            <br />
            <span className="font-medium">Email: pateldivy732@gmail.com</span>
            <><br /></>
            <span className="font-medium">Email: raghurampatel22@gnu.ac.in</span>
          </p>
        </section>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          By using LuxeBid, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default Terms;