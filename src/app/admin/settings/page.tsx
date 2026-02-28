'use client'

import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'NRB Europe',
    siteDescription: 'Your trusted source for news',
    contactEmail: 'contact@nrbeurope.com',
    postsPerPage: 10,
    enableComments: true,
    requireSubscription: false,
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setMessage('Settings saved successfully!')
    }, 1000)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Site Settings</h1>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h2 className="text-xl font-bold mb-4">General</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Content</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Posts Per Page</label>
                <input
                  type="number"
                  value={settings.postsPerPage}
                  onChange={(e) =>
                    setSettings({ ...settings, postsPerPage: parseInt(e.target.value) })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableComments}
                  onChange={(e) => setSettings({ ...settings, enableComments: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-gray-700">Enable comments on articles</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireSubscription}
                  onChange={(e) =>
                    setSettings({ ...settings, requireSubscription: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-gray-700">Require subscription to read articles</label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
