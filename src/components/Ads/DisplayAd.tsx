'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface DisplayAdProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
}

export default function DisplayAd({ 
  slot, 
  format = 'auto', 
  responsive = true 
}: DisplayAdProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('Ad error:', err)
    }
  }, [])

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="lazyOnload"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT_ID || 'ca-pub-YOUR_AD_CLIENT_ID'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </>
  )
}
