// File: src/pages/ContactUs.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
            <p className="text-lg text-gray-800">
              Have questions, feedback, or need assistance? We're here to help! Get in touch with our team through any of the channels below.
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            {submitted && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="What is this about?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Contact Methods */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Other Ways to Reach Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Mail className="w-8 h-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Email Us</h3>
              </div>
              <p className="text-gray-600 mb-3">Send us an email and we'll respond within 24 hours.</p>
              <p className="mb-2">
                <strong>General Inquiries:</strong><br/>
                <a href="mailto:team.luxebid@gmail.com" className="text-indigo-600 hover:underline">
                  team.luxebid@gmail.com
                </a>
              </p>
              <p>
                <strong>Support Issues:</strong><br/>
                <a href="mailto:support@luxebid.com" className="text-indigo-600 hover:underline">
                  support@luxebid.com
                </a>
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Phone className="w-8 h-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Call Us</h3>
              </div>
              <p className="text-gray-600 mb-3">Speak with our team directly.</p>
              <p className="mb-2">
                <strong>Phone:</strong><br/>
                <a href="tel:+919773120494" className="text-indigo-600 hover:underline">
                  +91 9773120494
                </a>
              </p>
              <p>
                <strong>Toll Free:</strong><br/>
                Available 24/7
              </p>
            </div>
          </div>
        </section>

        {/* Office Location */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <MapPin className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Visit Us</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Stop by our office for face-to-face support.
            </p>
            <p className="mb-2">
              <strong>LuxeBid Headquarters</strong>
            </p>
            <p className="text-gray-600">
              Patan, Gujarat<br/>
              India
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
            </div>
            <p className="text-gray-600 mb-3">
              Our team is available to assist you.
            </p>
            <p className="mb-2">
              <strong>Monday - Sunday</strong><br/>
              24/7 Support
            </p>
            <p className="text-sm text-gray-500">
              We respond to all inquiries within 24 hours
            </p>
          </div>
        </section>

        {/* Department Contacts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Department Contacts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600 mb-2">For account and transaction issues</p>
              <a href="mailto:support@luxebid.com" className="text-indigo-600 hover:underline text-sm">
                support@luxebid.com
              </a>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Sales</h3>
              <p className="text-sm text-gray-600 mb-2">For partnership inquiries</p>
              <a href="mailto:sales@luxebid.com" className="text-indigo-600 hover:underline text-sm">
                sales@luxebid.com
              </a>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Careers</h3>
              <p className="text-sm text-gray-600 mb-2">For job opportunities</p>
              <a href="mailto:careers@luxebid.com" className="text-indigo-600 hover:underline text-sm">
                careers@luxebid.com
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
          <h2 className="text-xl font-semibold mb-2">Looking for quick answers?</h2>
          <p className="text-gray-700">
            Check out our Help Center for FAQs and common issues.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;