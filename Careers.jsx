// File: pages/Careers.jsx
import React from 'react';

const Careers = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Careers at LuxeBid</h1>
      
      <div className="space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg mb-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              Join our passionate team at LuxeBid! We're looking for talented individuals 
              who are excited about building the future of online auctions. If you're innovative, 
              dedicated, and love working in a collaborative environment, we'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Why Work With Us */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">💰 Competitive Salary</h3>
              <p className="text-sm">We offer competitive compensation packages and benefits.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">📈 Growth Opportunities</h3>
              <p className="text-sm">Continuous learning and career development opportunities.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">🤝 Collaborative Culture</h3>
              <p className="text-sm">Work with talented colleagues in a supportive environment.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-indigo-600">🎯 Meaningful Work</h3>
              <p className="text-sm">Be part of a mission to revolutionize online auctions.</p>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Open Positions</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Senior Backend Developer</h3>
                  <p className="text-indigo-600 font-medium">Django, Python, REST API</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Hiring</span>
              </div>
              <p className="text-gray-600 mb-3">
                We're looking for an experienced backend developer to help scale our auction platform.
              </p>
              <p className="text-sm text-gray-500">📍 Patan | 🕐 Full-time</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">React Frontend Engineer</h3>
                  <p className="text-indigo-600 font-medium">React.js, JavaScript, Tailwind CSS</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Hiring</span>
              </div>
              <p className="text-gray-600 mb-3">
                Join our frontend team to build beautiful and responsive user interfaces.
              </p>
              <p className="text-sm text-gray-500">📍 Remote | 🕐 Full-time</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">UI/UX Designer</h3>
                  <p className="text-indigo-600 font-medium">Figma, UI Design, Prototyping</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Hiring</span>
              </div>
              <p className="text-gray-600 mb-3">
                Help us design intuitive and beautiful user experiences for our platform.
              </p>
              <p className="text-sm text-gray-500">📍 Remote | 🕐 Full-time</p>
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Application Process</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div className="ml-4">
                <h3 className="font-semibold">Submit Your Application</h3>
                <p className="text-gray-600">Send us your resume and portfolio.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="ml-4">
                <h3 className="font-semibold">Initial Screening</h3>
                <p className="text-gray-600">Our team reviews your application.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="ml-4">
                <h3 className="font-semibold">Interview Rounds</h3>
                <p className="text-gray-600">Technical and behavioral interviews.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div className="ml-4">
                <h3 className="font-semibold">Offer & Onboarding</h3>
                <p className="text-gray-600">Welcome to the team!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Get in Touch</h2>
          <p className="mb-4">Interested in joining LuxeBid? Send us your application!</p>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="font-semibold w-32">Email:</span>
              <a href="mailto:careers@luxebid.com" className="text-indigo-600 hover:underline">
                careers@luxebid.com
              </a>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32">Phone:</span>
              <span>+91 9773120494</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Careers;