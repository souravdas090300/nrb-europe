import { NextResponse } from 'next/server'

export function GET(request: Request) {
  const url = new URL('/manifest.json', request.url)
  return NextResponse.redirect(url)
}
