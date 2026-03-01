import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for NRB Europe',
}

export default async function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">Cookie Policy</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated: January 1, 2026
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">What Are Cookies</h2>
        <p className="dark:text-gray-300">
          Cookies are small text files stored on your device when you visit a website. They help us provide you
          with a better experience by remembering your preferences and understanding how you use our site.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">How We Use Cookies</h2>
        <p className="dark:text-gray-300">NRB Europe uses the following types of cookies:</p>
        <ul className="list-disc pl-6 space-y-2 dark:text-gray-300">
          <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security.</li>
          <li><strong>Preference Cookies:</strong> Remember your settings such as language preference and dark mode.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site using services like Google Analytics.</li>
          <li><strong>Functional Cookies:</strong> Enable enhanced functionality such as social media sharing and newsletter sign-ups.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Third-Party Cookies</h2>
        <p className="dark:text-gray-300">
          Some cookies are placed by third-party services that appear on our pages. We do not control these cookies.
          Third-party services may include Google Analytics, social media platforms, and advertising networks.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Managing Cookies</h2>
        <p className="dark:text-gray-300">
          You can control and manage cookies through your browser settings. Please note that removing or blocking
          cookies may impact your user experience and some features may no longer be available.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white">Contact</h2>
        <p className="dark:text-gray-300">
          If you have questions about our use of cookies, please contact us at{' '}
          <a href="mailto:privacy@nrbeurope.com" className="text-red-600 hover:underline">privacy@nrbeurope.com</a>.
        </p>
      </div>
    </div>
  )
}
