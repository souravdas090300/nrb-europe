import type { Metadata } from 'next';
import { BASE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Editorial Policy & Standards',
  description: 'Our commitment to accuracy, fairness, and ethical journalism. Learn about our editorial standards, corrections policy, and ethical guidelines.',
  openGraph: {
    title: 'Editorial Policy & Standards | NRB Europe',
    description: 'Our commitment to accuracy, fairness, and ethical journalism.',
    url: `${BASE_URL}/en/editorial-policy`,
    type: 'website',
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Editorial Policy & Standards</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          At {SITE_NAME}, we are committed to delivering accurate, fair, and trustworthy journalism 
          that serves the public interest.
        </p>

        <section id="accuracy" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Accuracy & Verification</h2>
          <p>
            We are committed to reporting news accurately, fairly, and comprehensively. 
            All facts are verified through multiple sources whenever possible. 
            We distinguish clearly between facts, analysis, and opinion.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Our Fact-Checking Process:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Multiple source verification for all factual claims</li>
            <li>Cross-referencing with official documents and reliable data sources</li>
            <li>Expert consultation for specialized or technical topics</li>
            <li>Regular review and updates of previously published content</li>
            <li>Pre-publication review by editors for all breaking news</li>
          </ul>
        </section>

        <section id="corrections" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Corrections Policy</h2>
          <p>
            When we make an error, we correct it promptly and transparently. 
            Corrections are clearly noted at the top or bottom of articles, 
            with an explanation of what was changed and when.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="font-semibold">How to Report an Error:</p>
            <p>
              Email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a> with 
              "Correction" in the subject line. Please include:
            </p>
            <ul className="mt-2 ml-4 list-disc">
              <li>URL of the article</li>
              <li>Specific error with details</li>
              <li>Supporting evidence if available</li>
            </ul>
          </div>
          
          <p>
            <strong>Response Time:</strong> We respond to all correction requests within 24 hours 
            and publish corrections as soon as they are verified.
          </p>
        </section>

        <section id="sources" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Sources & Attribution</h2>
          <p>
            We protect confidential sources when necessary for their safety or 
            when information cannot be obtained otherwise. We clearly attribute 
            information to its source, whether named or anonymous.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Anonymous Sources Policy:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Requires approval from senior editor</li>
            <li>Must provide unique, important information not available elsewhere</li>
            <li>Source must be known to reporter and at least one editor</li>
            <li>Information must be corroborated when possible</li>
            <li>We explain why anonymity was granted</li>
          </ul>
        </section>

        <section id="fairness" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Fairness & Impartiality</h2>
          <p>
            We strive to present all relevant sides of a story fairly. 
            When covering controversy or disputes, we make diligent efforts 
            to contact all involved parties for comment before publication.
          </p>
          <p className="mt-4">
            We clearly label opinion pieces, analysis, and editorial content 
            to distinguish them from news reporting.
          </p>
        </section>

        <section id="conflicts" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Conflicts of Interest</h2>
          <p>
            Our journalists must avoid conflicts of interest, real or perceived. 
            All staff must disclose potential conflicts to their editor before 
            covering any story where they may have a personal or financial interest.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">We Do Not:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accept payment, gifts, or favors that could influence coverage</li>
            <li>Allow commercial interests to influence editorial decisions</li>
            <li>Permit journalists to cover stories where they have financial interests</li>
            <li>Allow partisan political activity by newsroom staff</li>
          </ul>
        </section>

        <section id="ethics" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Ethical Standards</h2>
          <p>Our journalism adheres to the highest ethical standards:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>No Plagiarism:</strong> All content is original or properly attributed</li>
            <li><strong>No Fabrication:</strong> We never invent facts, quotes, or sources</li>
            <li><strong>No Distortion:</strong> We do not manipulate facts or context</li>
            <li><strong>Respect Privacy:</strong> We balance public interest with personal privacy</li>
            <li><strong>Show Compassion:</strong> We are sensitive when covering victims and trauma</li>
            <li><strong>Avoid Stereotypes:</strong> We reject prejudicial language and stereotyping</li>
            <li><strong>Clear Labeling:</strong> Sponsored or branded content is clearly identified</li>
          </ul>
        </section>

        <section id="transparency" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Transparency</h2>
          <p>
            We are transparent about our funding, ownership, and editorial processes. 
            We disclose relevant background about sources when it adds important context 
            to the story.
          </p>
          <p className="mt-4">
            We explain our editorial decisions when readers ask, and we acknowledge 
            when we cannot share certain information for legal or safety reasons.
          </p>
        </section>

        <section id="user-generated" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">User-Generated Content</h2>
          <p>
            We verify all user-submitted content before publication. 
            We credit contributors appropriately and obtain necessary permissions 
            for photos, videos, and other content.
          </p>
          <p className="mt-4">
            User comments are moderated to ensure they meet our community standards 
            and do not contain hate speech, threats, or false information.
          </p>
        </section>

        <section id="diversity" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Diversity & Inclusion</h2>
          <p>
            We are committed to building a diverse team that reflects the communities 
            we serve. We believe diverse perspectives lead to better journalism and 
            more comprehensive coverage.
          </p>
          <p className="mt-4">
            Our coverage aims to represent all voices in our community, with special 
            attention to underrepresented groups and perspectives.
          </p>
        </section>

        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Contact & Feedback</h2>
          <p>We welcome feedback from our readers:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Editorial Team</h3>
              <p className="text-sm">
                <strong>Email:</strong> <a href="mailto:editorial@nrbeurope.com" className="text-blue-600">editorial@nrbeurope.com</a><br />
                <strong>Response Time:</strong> 48 hours
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">General Inquiries</h3>
              <p className="text-sm">
                <strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600">{CONTACT_EMAIL}</a><br />
                <strong>Location:</strong> London, UK
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Filing a Complaint:</h3>
          <p>For complaints about editorial content, please include:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>URL of the article in question</li>
            <li>Specific concerns with timestamps</li>
            <li>Supporting evidence if available</li>
            <li>Your contact information for follow-up</li>
          </ul>
          <p className="mt-4">
            We investigate all serious complaints and respond within 48 hours.
          </p>
        </section>

        <section id="independence" className="mb-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Editorial Independence</h2>
          <p>
            {SITE_NAME} maintains complete editorial independence. Our content is 
            free from commercial or political influence. We are funded through 
            advertising and reader support, which allows us to remain accountable 
            to our audience first and foremost.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This policy is reviewed annually and may be updated to reflect 
            evolving standards and best practices in journalism.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            © {new Date().getFullYear()} NRB Europe Media Ltd. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  );
}
