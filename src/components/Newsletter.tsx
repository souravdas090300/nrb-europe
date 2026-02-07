'use client';

import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubscribed(true);
    setLoading(false);
    setEmail('');
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <Send className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Informed with NRB Europe
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get daily updates on immigration policies, job opportunities, business news, 
            and community stories directly in your inbox. Join 50,000+ NRBs who trust us for accurate information.
          </p>
          
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 inline-flex items-center">
              <Check className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <h3 className="font-bold text-green-900">Successfully Subscribed!</h3>
                <p className="text-green-700 text-sm">
                  Thank you for joining our newsletter. Check your inbox for confirmation.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive 
                updates from NRB Europe. You can unsubscribe at any time.
              </p>
            </form>
          )}
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">50K+</div>
                <div className="text-sm text-gray-600">Subscribers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">98%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">24/7</div>
                <div className="text-sm text-gray-600">Updates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">100+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
