// File: src/pages/CookiePolicy.jsx
import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: October 2025</p>

      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
            <p className="text-gray-800 leading-relaxed">
              This Cookie Policy explains how LuxeBid uses cookies and similar tracking technologies 
              to enhance your experience when you visit our website and use our services.
            </p>
          </div>
        </section>

        {/* What Are Cookies */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900">What Are Cookies?</h2>
          <p className="leading-relaxed">
            Cookies are small text files that are stored on your device (computer, tablet, smartphone, etc.) 
            when you visit a website. They help the website remember information about your visit, such as your 
            preferences and settings. Cookies can be session-based (deleted when you close your browser) or 
            persistent (stored on your device until they expire or you delete them).
          </p>
        </section>

        {/* Types of Cookies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">🔒 Essential/Necessary Cookies</h3>
              <p className="text-gray-600 mb-3">
                These cookies are critical for the basic functionality of our website and cannot be disabled 
                without affecting website performance.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Purpose:</strong> Authentication, security, session management, load balancing<br/>
                <strong>Duration:</strong> Session or 1 year<br/>
                <strong>Example:</strong> Session tokens, CSRF protection
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">📊 Performance/Analytics Cookies</h3>
              <p className="text-gray-600 mb-3">
                These cookies help us understand how you use our platform, including which pages you visit, 
                how long you stay, and what actions you take.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Purpose:</strong> Analytics, performance monitoring, error tracking<br/>
                <strong>Duration:</strong> 1-2 years<br/>
                <strong>Provider:</strong> Google Analytics, Sentry, Mixpanel
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">⚙️ Preference/Functionality Cookies</h3>
              <p className="text-gray-600 mb-3">
                These cookies remember your preferences and settings to personalize your experience 
                on future visits.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Purpose:</strong> Language preference, theme selection, user preferences<br/>
                <strong>Duration:</strong> 1-2 years<br/>
                <strong>Example:</strong> Dark mode preference, language selection
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">📢 Marketing/Advertising Cookies</h3>
              <p className="text-gray-600 mb-3">
                These cookies track your browsing behavior to deliver relevant advertisements and measure 
                campaign effectiveness.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Purpose:</strong> Personalized ads, retargeting, campaign measurement<br/>
                <strong>Duration:</strong> 1-2 years<br/>
                <strong>Provider:</strong> Google Ads, Facebook Pixel, LinkedIn
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">🔗 Third-Party Cookies</h3>
              <p className="text-gray-600 mb-3">
                Cookies set by third-party services integrated with our platform, such as payment processors 
                and social media platforms.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Purpose:</strong> Payment processing, social integration, fraud prevention<br/>
                <strong>Provider:</strong> Stripe, PayPal, Facebook, Twitter
              </p>
            </div>
          </div>
        </section>

        {/* Cookie Consent */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cookie Consent</h2>
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <p className="mb-3 text-gray-700">
              When you first visit LuxeBid, we display a cookie consent banner that allows you to:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Accept all cookies</li>
              <li>✓ Reject non-essential cookies</li>
              <li>✓ Customize your cookie preferences</li>
              <li>✓ Learn more about each cookie type</li>
            </ul>
            <p className="mt-3 text-gray-600">
              Your preferences are saved and will be respected on future visits. You can change your settings 
              anytime through your account preferences.
            </p>
          </div>
        </section>

        {/* Managing Cookies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">How to Manage Cookies</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="mb-4 text-gray-600">
              You have full control over cookies through your browser settings:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Accept/Reject Cookies</h3>
                <p className="text-sm text-gray-600">
                  Configure your browser to accept or reject cookies from specific websites.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delete Cookies</h3>
                <p className="text-sm text-gray-600">
                  Clear all stored cookies from your browser at any time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Block by Site</h3>
                <p className="text-sm text-gray-600">
                  Block cookies from specific websites while allowing others.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Private/Incognito Browsing</h3>
                <p className="text-sm text-gray-600">
                  Use private mode to browse without storing cookies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Instructions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Browser-Specific Instructions</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Chrome</h3>
              <p className="text-sm text-gray-600">Settings → Privacy & Security → Cookies and other site data</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Firefox</h3>
              <p className="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Safari</h3>
              <p className="text-sm text-gray-600">Preferences → Privacy → Cookies and Website Data</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Edge</h3>
              <p className="text-sm text-gray-600">Settings → Privacy & Security → Cookies and Other Data</p>
            </div>
          </div>
        </section>

        {/* Impact of Disabling Cookies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Impact of Disabling Cookies</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
            <p className="mb-3 text-gray-700">
              Disabling cookies may affect your experience on LuxeBid:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>❌ You may not be able to log in to your account</li>
              <li>❌ Your preferences won't be saved</li>
              <li>❌ Shopping cart functionality may not work</li>
              <li>❌ Some features may be unavailable</li>
            </ul>
            <p className="mt-3 text-gray-600">
              Essential cookies cannot be disabled without breaking basic functionality.
            </p>
          </div>
        </section>

        {/* Third-Party Privacy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Third-Party Cookies & Privacy</h2>
          <p className="mb-4 text-gray-600">
            Third-party services may set their own cookies. We recommend reviewing their privacy policies:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <strong>Google Analytics:</strong> 
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline block">
                policies.google.com/privacy
              </a>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <strong>Stripe:</strong>
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline block">
                stripe.com/privacy
              </a>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <strong>Facebook Pixel:</strong>
              <a href="https://facebook.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline block">
                facebook.com/privacy
              </a>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <strong>PayPal:</strong>
              <a href="https://paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline block">
                paypal.com/privacy
              </a>
            </div>
          </div>
        </section>

        {/* Updates */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Updates to This Policy</h2>
          <p className="text-gray-600">
            We may update this Cookie Policy from time to time to reflect changes in our cookie practices 
            or legal requirements. We'll notify you of significant changes by updating the "Last Updated" 
            date above and highlighting major changes.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Questions or Concerns?</h2>
          <p className="mb-4 text-gray-700">
            If you have any questions about this Cookie Policy or our use of cookies, please contact us:
          </p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-32">📧 Email:</span>
              <a href="mailto:privacy@luxebid.com" className="text-indigo-600 hover:underline">
                privacy@luxebid.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32">📞 Phone:</span>
              <span>+91 9773120494</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;