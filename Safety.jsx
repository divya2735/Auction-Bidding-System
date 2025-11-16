// File: src/pages/Safety.jsx
import React from 'react';
import { Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Safety = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Safety & Security</h1>
      
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              Your safety and security are our top priorities. We use industry-leading technology and practices to protect your information and ensure safe transactions on our platform.
            </p>
          </div>
        </section>

        {/* Security Measures */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Security Measures</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <Lock className="w-6 h-6 text-indigo-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">SSL/TLS Encryption</h3>
                  <p className="text-gray-600">
                    All data transmitted between your device and our servers is encrypted using 256-bit SSL/TLS protocols. 
                    This ensures that your personal and payment information is protected during transmission.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-indigo-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Secure Payment Processing</h3>
                  <p className="text-gray-600">
                    Payment processing is handled through PCI-DSS compliant payment partners like Stripe and PayPal. 
                    We never store your full credit card details on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Verified User Community</h3>
                  <p className="text-gray-600">
                    All users must verify their email and phone number. Sellers go through additional verification to ensure 
                    authenticity and build trust in our marketplace.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Advanced Fraud Detection</h3>
                  <p className="text-gray-600">
                    Our AI-powered fraud detection system monitors all transactions and user activities to detect and prevent 
                    suspicious behavior and fraudulent activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Password Security */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Password Security</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="mb-4 text-gray-600">
              Your password is critical to account security. Here are our practices:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Passwords are hashed using strong algorithms (bcrypt)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Two-factor authentication (2FA) available for additional security</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Immediate notification of suspicious login attempts</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Safe Bidding Tips */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Tips for Safe Bidding</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">✅ DO</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Enable two-factor authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Review seller ratings before bidding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Use secure WiFi for transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Verify seller details and contact info</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">❌ DON'T</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✕</span>
                  <span>Share your password with anyone</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✕</span>
                  <span>Click suspicious links in emails</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✕</span>
                  <span>Communicate outside LuxeBid messaging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✕</span>
                  <span>Use public WiFi for payments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✕</span>
                  <span>Trust unsolicited payment requests</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Protection & Privacy</h2>
          <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
            <p className="mb-4 text-gray-700">
              We comply with international data protection standards including GDPR and maintain strict privacy practices:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Your data is stored in secure, encrypted databases</li>
              <li>✓ Regular backups ensure data availability</li>
              <li>✓ Access controls limit who can view your information</li>
              <li>✓ We never sell your personal data to third parties</li>
              <li>✓ You can request to delete your data anytime</li>
            </ul>
          </div>
        </section>

        {/* Report Security Issues */}
        <section className="bg-red-50 p-6 rounded-lg border-l-4 border-red-600">
          <h2 className="text-2xl font-semibold mb-4">Report a Security Issue</h2>
          <p className="mb-4 text-gray-700">
            If you discover a security vulnerability or suspicious activity, please report it immediately:
          </p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-32">📧 Email:</span>
              <a href="mailto:security@luxebid.com" className="text-indigo-600 hover:underline">
                security@luxebid.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32">📞 Phone:</span>
              <span>+91 9773120494</span>
            </p>
            <p className="text-sm text-gray-600 mt-4">
              We take all security reports seriously and respond promptly to resolve issues.
            </p>
          </div>
        </section>

        {/* Account Recovery */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Account Recovery</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="mb-4 text-gray-600">
              If your account has been compromised or you've forgotten your password:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Go to the login page and click "Forgot Password"</li>
              <li>Enter your registered email address</li>
              <li>Check your email for recovery instructions</li>
              <li>Follow the link to reset your password</li>
              <li>Create a new, strong password</li>
              <li>If you can't access your email, contact our support team</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Safety;