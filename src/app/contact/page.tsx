import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact NRB Europe',
  description: 'Get in touch with NRB Europe editorial team',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Editorial Team</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Editor-in-Chief</h3>
              <p>editor@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold">News Desk</h3>
              <p>news@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold">Tips & Submissions</h3>
              <p>tips@nrbeurope.com</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Other Departments</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Advertising</h3>
              <p>ads@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold">Technical Support</h3>
              <p>support@nrbeurope.com</p>
            </div>
            <div>
              <h3 className="font-semibold">General Inquiries</h3>
              <p>info@nrbeurope.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Correction Policy</h3>
        <p>
          NRB Europe is committed to accuracy. If you believe we have published incorrect information, please contact us at <strong>corrections@nrbeurope.com</strong> with details of the correction needed.
        </p>
      </div>
    </div>
  )
}
