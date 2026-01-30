'use client';

import { SITE_NAME, BASE_URL, SITE_DESCRIPTION, CONTACT_EMAIL, ORGANIZATION } from '@/lib/constants';

export default function OrganizationStructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${BASE_URL}/#organization`,
    name: ORGANIZATION.name,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION.logo.url,
      width: 512,
      height: 512,
    },
    description: SITE_DESCRIPTION,
    foundingDate: '2024-01-01',
    foundingLocation: {
      '@type': 'Place',
      name: 'London, United Kingdom',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44-20-1234-5678',
        contactType: 'customer service',
        email: ORGANIZATION.contactPoint.email,
        areaServed: 'GB',
        availableLanguage: ['English', 'Bengali'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'editorial',
        email: 'editorial@nrbeurope.com',
      },
    ],
    sameAs: ORGANIZATION.sameAs,
    knowsAbout: [
      'News',
      'Politics',
      'Business',
      'Immigration',
      'Community',
      'Europe',
      'Bangladesh',
    ],
    publishingPrinciples: `${BASE_URL}/editorial-policy`,
    masthead: `${BASE_URL}/about`,
    ethicsPolicy: `${BASE_URL}/editorial-policy`,
    correctionsPolicy: `${BASE_URL}/editorial-policy#corrections`,
    ownershipFundingInfo: `${BASE_URL}/about#ownership`,
    actionableFeedbackPolicy: `${BASE_URL}/contact`,
    missionCoveragePrioritiesPolicy: `${BASE_URL}/about#mission`,
    diversityPolicy: `${BASE_URL}/about#diversity`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
