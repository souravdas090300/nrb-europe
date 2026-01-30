import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'

interface SponsorProps {
  name: string
  logo: any
  website: string
}

interface SponsoredContentProps {
  sponsor: SponsorProps
  article: any
}

export default function SponsoredContent({ sponsor, article }: SponsoredContentProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
      <div className="flex items-center mb-4">
        <div className="relative w-10 h-10 mr-3">
          <Image
            src={sponsor.logo ? urlFor(sponsor.logo).width(80).height(80).url() : '/placeholder.png'}
            alt={sponsor.name}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-sm text-blue-600 font-semibold">Sponsored Content</p>
          <p className="text-xs text-gray-600">Presented by {sponsor.name}</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 mb-4">
        This content is created in partnership with {sponsor.name}. 
        All opinions are independent and not influenced by the sponsor.
      </div>
      
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold"
      >
        Learn more about {sponsor.name}
        <span className="ml-1">→</span>
      </a>
    </div>
  )
}
