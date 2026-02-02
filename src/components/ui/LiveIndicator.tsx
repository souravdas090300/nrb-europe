'use client'

export default function LiveIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse-slow">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
      <span className="text-sm font-bold">LIVE</span>
    </div>
  )
}
