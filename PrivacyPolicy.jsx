import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">
        Last Updated: October 2025
      </p>

      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg mb-8">
        <p className="text-gray-800 leading-relaxed">
          At LuxeBid, we are committed to protecting your privacy and ensuring the security of your 
          personal information. This Privacy Policy explains how we collect, use, disclose, and 
          safeguard your data when you use our auction platform.
        </p>
      </div>

      <div className="space-y-6 text-gray-700">
        
        {/* Information We Collect */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">📋</span> 1. Information We Collect
          </h2>
          
          <div className="ml-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Personal Information</h3>
              <p className="mb-2">When you create an account or use our services, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name and contact information (email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Profile information (profile picture, bio, preferences)</li>
                <li>Communication preferences</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 Transaction Information</h3>
              <p className="mb-2">We collect data related to your auction activities:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Bid history and amounts</li>
                <li>Items listed for sale</li>
                <li>Purchase and sales history</li>
                <li>Watchlist items</li>
                <li>Messages and communications with other users</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Technical Information</h3>
              <p className="mb-2">We automatically collect certain technical data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Access times and pages viewed</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (with your permission)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🔧</span> 2. How We Use Your Information
          </h2>
          
          <div className="ml-6">
            <p className="mb-2">We use your personal information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Management:</strong> To create and maintain your account, verify your identity, and provide customer support</li>
              <li><strong>Transaction Processing:</strong> To facilitate auctions, process bids, complete purchases, and manage payments</li>
              <li><strong>Communication:</strong> To send you notifications about your account, bids, auctions, and important updates</li>
              <li><strong>Platform Improvement:</strong> To analyze usage patterns, improve our services, and develop new features</li>
              <li><strong>Security:</strong> To detect fraud, prevent abuse, and maintain the safety of our platform</li>
              <li><strong>Marketing:</strong> To send promotional materials and personalized recommendations (with your consent)</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms & Conditions</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🤝</span> 3. Information Sharing and Disclosure
          </h2>
          
          <div className="ml-6 space-y-4">
            <p>We may share your information in the following circumstances:</p>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 With Other Users</h3>
              <p>Your public profile information, listings, and bid history may be visible to other users on the platform.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Service Providers</h3>
              <p>We work with third-party service providers for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processing (e.g., Stripe, PayPal)</li>
                <li>Email delivery services</li>
                <li>Cloud storage and hosting</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Legal Requirements</h3>
              <p>We may disclose your information when required by law, court order, or to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Comply with legal processes</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud or security threats</li>
                <li>Protect the safety of users and the public</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 Business Transfers</h3>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🔒</span> 4. Data Security
          </h2>
          
          <div className="ml-6">
            <p className="mb-3">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data centers with physical and digital safeguards</li>
              <li>Employee training on data protection best practices</li>
            </ul>
            <p className="mt-3 text-sm bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
              <strong>Note:</strong> While we strive to protect your data, no method of transmission over 
              the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🍪</span> 5. Cookies and Tracking Technologies
          </h2>
          
          <div className="ml-6">
            <p className="mb-3">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Remember your preferences and settings</li>
              <li>Keep you logged in to your account</li>
              <li>Analyze platform usage and performance</li>
              <li>Deliver personalized content and advertisements</li>
              <li>Improve security and prevent fraud</li>
            </ul>
            <p className="mt-3">
              You can control cookie settings through your browser preferences. Note that disabling 
              cookies may affect the functionality of certain features.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">⚖️</span> 6. Your Rights and Choices
          </h2>
          
          <div className="ml-6">
            <p className="mb-3">You have the following rights regarding your personal information:</p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Access & Download</h4>
                <p className="text-sm">Request a copy of the personal data we hold about you</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Correction</h4>
                <p className="text-sm">Update or correct inaccurate information in your account</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Deletion</h4>
                <p className="text-sm">Request deletion of your account and associated data</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Opt-Out</h4>
                <p className="text-sm">Unsubscribe from marketing emails and notifications</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Data Portability</h4>
                <p className="text-sm">Receive your data in a structured, machine-readable format</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Restrict Processing</h4>
                <p className="text-sm">Limit how we use your personal information</p>
              </div>
            </div>

            <p className="mt-3">
              To exercise these rights, please contact us at <a href="mailto:privacy@luxebid.com" className="text-indigo-600 hover:underline">privacy@luxebid.com</a>
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">⏳</span> 7. Data Retention
          </h2>
          
          <div className="ml-6">
            <p className="mb-2">We retain your personal information for as long as:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your account is active</li>
              <li>Needed to provide our services</li>
              <li>Required by law or for legal purposes</li>
              <li>Necessary to resolve disputes and enforce agreements</li>
            </ul>
            <p className="mt-3">
              When you delete your account, we will remove or anonymize your personal data within 
              30 days, except where retention is required by law.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">👶</span> 8. Children's Privacy
          </h2>
          
          <div className="ml-6">
            <p>
              LuxeBid is not intended for users under the age of 18. We do not knowingly collect 
              personal information from children. If you believe we have collected information from 
              a child, please contact us immediately at <a href="mailto:privacy@luxebid.com" className="text-indigo-600 hover:underline">privacy@luxebid.com</a> 
              so we can delete the information.
            </p>
          </div>
        </section>

        {/* International Users */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🌍</span> 9. International Data Transfers
          </h2>
          
          <div className="ml-6">
            <p>
              LuxeBid operates globally, and your information may be transferred to and processed in 
              countries other than your own. We ensure that such transfers comply with applicable data 
              protection laws and implement appropriate safeguards to protect your information.
            </p>
          </div>
        </section>

        {/* Third-Party Links */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">🔗</span> 10. Third-Party Links
          </h2>
          
          <div className="ml-6">
            <p>
              Our platform may contain links to third-party websites or services. We are not responsible 
              for the privacy practices of these external sites. We encourage you to review their privacy 
              policies before providing any personal information.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">📝</span> 11. Changes to This Privacy Policy
          </h2>
          
          <div className="ml-6">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices 
              or legal requirements. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Posting the updated policy on our platform</li>
              <li>Updating the "Last Updated" date at the top</li>
              <li>Sending email notifications for material changes</li>
            </ul>
            <p className="mt-3">
              Continued use of LuxeBid after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 flex items-center">
            <span className="mr-2">📧</span> 12. Contact Us
          </h2>
          
          <div className="ml-6">
            <p className="mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our 
              data practices, please contact us:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="mb-2"><strong>LuxeBid Privacy Team</strong></p>
              <p className="text-sm mb-1">
                📧 Email: <a href="mailto:pateldivy732@gmail.com" className="text-indigo-600 hover:underline">pateldivy732@gmail.com</a>
                📧 Email: <a href="mailto:team.luxebid@gmail.com" className="text-indigo-600 hover:underline">team.luxebid@gmail.com</a>
              </p>
              <p className="text-sm mb-1">
                📞 Phone: +91 9773120494
              </p>
              <p className="text-sm">
                📍 Address: Patan, Gujarat, IND 
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Acknowledgment Box */}
      <div className="mt-8 bg-indigo-600 text-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Your Privacy Matters</h3>
        <p className="text-sm">
          By using LuxeBid, you acknowledge that you have read, understood, and agree to the 
          collection, use, and disclosure of your personal information as described in this Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;