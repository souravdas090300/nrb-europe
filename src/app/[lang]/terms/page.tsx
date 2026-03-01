import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for NRB Europe',
}

export default async function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">Terms of Service</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated: January 1, 2026
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">1. Acceptance of Terms</h2>
        <p className="dark:text-gray-300">
          By accessing and using NRB Europe (&quot;the Website&quot;), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">2. Use of Content</h2>
        <p className="dark:text-gray-300">
          All content published on NRB Europe, including articles, images, graphics, and multimedia, is protected by copyright.
          You may not reproduce, distribute, or create derivative works without prior written permission from NRB Europe.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">3. User Accounts</h2>
        <p className="dark:text-gray-300">
          When you create an account, you are responsible for maintaining the confidentiality of your login credentials.
          You agree to provide accurate information and to update it as necessary. NRB Europe reserves the right to
          suspend or terminate accounts that violate these terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">4. Subscriptions and Payments</h2>
        <p className="dark:text-gray-300">
          Paid subscriptions are billed in advance on a recurring basis. You may cancel your subscription at any time.
          Refunds are handled in accordance with our refund policy. Prices are subject to change with reasonable notice.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">5. User Conduct</h2>
        <p className="dark:text-gray-300">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 dark:text-gray-300">
          <li>Use the service for any unlawful purpose</li>
          <li>Post or transmit harmful, threatening, or offensive content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with the proper functioning of the service</li>
          <li>Scrape or collect data without permission</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">6. Limitation of Liability</h2>
        <p className="dark:text-gray-300">
          NRB Europe provides content for informational purposes. We make no guarantees about the accuracy or completeness
          of our content. In no event shall NRB Europe be liable for any indirect, incidental, or consequential damages
          arising from your use of the service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">7. Changes to Terms</h2>
        <p className="dark:text-gray-300">
          We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated
          revision date. Continued use of the service constitutes acceptance of the revised terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">8. Contact</h2>
        <p className="dark:text-gray-300">
          For questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:legal@nrbeurope.com" className="text-red-600 hover:underline">legal@nrbeurope.com</a>.
        </p>
      </div>
    </div>
  )
}
