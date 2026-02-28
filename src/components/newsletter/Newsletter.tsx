'use client';

import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

const Newsletter: React.FC<{ dictionary?: any }> = ({ dictionary }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const nl = dictionary?.newsletter || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await Sentry.startSpan(
        { op: 'http.client', name: 'POST /api/newsletter/subscribe' },
        async () => {
          return await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
        },
      );
      
      const data = await res.json();
      
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        alert(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      Sentry.captureException(error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-7">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
            <Send className="w-5 h-5 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {nl.title || 'Stay Informed with NRB Europe'}
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 max-w-lg mx-auto leading-relaxed">
            {nl.subtitle || 'Get daily updates on immigration policies, job opportunities, business news, and community stories directly in your inbox. Join 50,000+ NRBs who trust us for accurate information.'}
          </p>
          
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <div className="text-left">
                <h3 className="font-bold text-green-900 text-sm">{nl.successTitle || 'Successfully Subscribed!'}</h3>
                <p className="text-green-700 text-xs">
                  {nl.successMessage || 'Thank you for joining our newsletter. Check your inbox for confirmation.'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={nl.emailPlaceholder || 'Enter your email address'}
                  required
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 text-sm rounded-lg transition flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {nl.subscribing || 'Subscribing...'}
                    </>
                  ) : (
                    <>
                      {nl.subscribeNow || 'Subscribe Now'}
                      <Send className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-[10px] text-gray-500 mt-2.5 leading-tight">
                {nl.disclaimer || 'By subscribing, you agree to our Privacy Policy and consent to receive updates from NRB Europe. You can unsubscribe at any time.'}
              </p>
            </form>
          )}
          
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-base font-bold text-red-600">50K+</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">{nl.subscribers || 'Subscribers'}</div>
              </div>
              <div>
                <div className="text-base font-bold text-red-600">98%</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">{nl.satisfaction || 'Satisfaction'}</div>
              </div>
              <div>
                <div className="text-base font-bold text-red-600">24/7</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">{nl.updates || 'Updates'}</div>
              </div>
              <div>
                <div className="text-base font-bold text-red-600">100+</div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">{nl.countries || 'Countries'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
