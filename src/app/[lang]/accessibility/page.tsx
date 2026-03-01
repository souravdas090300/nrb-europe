import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility statement for NRB Europe',
}

export default async function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">Accessibility Statement</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          NRB Europe is committed to ensuring digital accessibility for people with disabilities.
          We are continually improving the user experience for everyone.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Our Commitment</h2>
        <p className="dark:text-gray-300">
          We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
          These guidelines explain how to make web content more accessible for people with disabilities.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">What We Do</h2>
        <ul className="list-disc pl-6 space-y-2 dark:text-gray-300">
          <li>Provide alternative text for images</li>
          <li>Ensure sufficient colour contrast throughout the site</li>
          <li>Support keyboard navigation for all interactive elements</li>
          <li>Use semantic HTML for screen reader compatibility</li>
          <li>Offer a dark mode for comfortable reading in low-light conditions</li>
          <li>Provide a responsive design that works on all device sizes</li>
          <li>Support multiple languages for our diverse readership</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Known Limitations</h2>
        <p className="dark:text-gray-300">
          While we strive for full accessibility, some third-party content or older articles may not yet fully
          meet our accessibility standards. We are actively working to address these issues.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Feedback</h2>
        <p className="dark:text-gray-300">
          We welcome your feedback on the accessibility of NRB Europe. If you encounter accessibility barriers,
          please contact us at{' '}
          <a href="mailto:accessibility@nrbeurope.com" className="text-red-600 hover:underline">accessibility@nrbeurope.com</a>.
        </p>
      </div>
    </div>
  )
}
