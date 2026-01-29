const affiliateNetworks = {
  amazon: {
    tag: 'nrbeurope-21',
    baseUrl: 'https://www.amazon.com',
  },
  flipkart: {
    tag: 'nrbeurop01-21',
    baseUrl: 'https://www.flipkart.com',
  },
  // Add more networks as needed
}

export const createAffiliateLink = (url: string, network: keyof typeof affiliateNetworks = 'amazon'): string => {
  const config = affiliateNetworks[network]
  if (!config) return url
  
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('tag', config.tag)
    return urlObj.toString()
  } catch (error) {
    console.error('Invalid URL:', error)
    return url
  }
}

export { affiliateNetworks }
