/**
 * Layout for Sanity Studio
 * This provides the necessary HTML structure for the Studio to function properly
 */

export const metadata = {
  title: 'NRB Europe Studio',
  description: 'Content management system for NRB Europe',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
