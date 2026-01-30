'use client'

import { useState } from 'react'
import { plans, PlanKey } from '@/lib/stripe/plans'

interface PaywallProps {
  articleId: string
  previewContent: string
}

export default function Paywall({ articleId, previewContent }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('monthly')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          articleId,
        }),
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-8 my-12">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-2">Continue Reading</h3>
        <p className="text-gray-600 mb-6">
          This article is for subscribers only. Join NRB Europe Premium for exclusive content.
        </p>
        
        {/* Article Preview */}
        <div className="prose prose-lg mb-8 opacity-50 blur-sm select-none">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
        
        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(plans) as [PlanKey, typeof plans[PlanKey]][]).map(([key, plan]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === key 
                  ? 'border-red-600 ring-2 ring-red-100 bg-red-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(key)}
            >
              <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
              <p className="text-3xl font-bold mb-4">
                ${plan.price}
                <span className="text-sm font-normal text-gray-600">
                  /{key === 'yearly' ? 'year' : 'month'}
                </span>
              </p>
              <ul className="text-left text-sm space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-semibold text-lg disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Subscribe Now - $${plans[selectedPlan].price}`}
          <span className="text-sm font-normal ml-2">
            /{selectedPlan === 'yearly' ? 'year' : 'month'}
          </span>
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Cancel anytime • 7-day free trial available
        </p>
      </div>
    </div>
  )
}
