// File: src/components/Footer.jsx
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Us */}
          <div>
            <h4 className="text-white font-semibold mb-4">About Us</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  About Luxebid
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/careers')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/press')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Press
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/help-center')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact-us')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/safety')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Safety
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold mb-4">Policies</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/privacy-policy')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/cookie-policy')}
                  className="hover:text-white transition-colors bg-none border-none p-0 text-left cursor-pointer"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p>&copy; 2025 Auction Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;