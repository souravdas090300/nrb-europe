import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NRB Europe',
  description: 'Learn about NRB Europe - Your trusted news source for NRB communities in Europe',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">About NRB Europe</h1>
      
      <div className="prose prose-lg">
        <p className="text-xl text-gray-600 mb-6">
          NRB Europe is an independent news platform dedicated to serving the Non-Resident Bangladeshi (NRB) communities across Europe.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p>
          To provide accurate, timely, and relevant news coverage for Bangladeshi diaspora communities in Europe, focusing on immigration, politics, business, jobs, and lifestyle.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Editorial Standards</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fact-based reporting</li>
          <li>Multiple source verification</li>
          <li>Transparent corrections policy</li>
          <li>Clear distinction between news and opinion</li>
        </ul>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
        <p>
          <strong>Editorial Inquiries:</strong> editor@nrbeurope.com<br />
          <strong>General Contact:</strong> info@nrbeurope.com<br />
          <strong>Address:</strong> London, United Kingdom
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
        <p>
          Our editorial team consists of experienced journalists and contributors based across Europe, ensuring comprehensive coverage of issues affecting NRB communities.
        </p>
      </div>
    </div>
  )
}
