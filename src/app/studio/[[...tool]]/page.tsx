/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity'
import config from '../../../../sanity.config'

export const dynamic = 'force-dynamic'

// Metadata for the studio page
export const metadata = {
  title: 'Sanity Studio',
  description: 'Content management for NRB Europe',
}

export default function StudioPage() {
  return <NextStudio config={config} />
}
