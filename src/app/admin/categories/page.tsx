'use client'

import { useEffect, useState, useCallback } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  color: string
  description: string | null
  parentId: string | null
  parent: { id: string; name: string; slug: string } | null
  children: Category[]
  sortOrder: number
  isActive: boolean
}

const COLOR_OPTIONS = [
  { label: 'Red', value: 'bg-red-100 text-red-800' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-800' },
  { label: 'Green', value: 'bg-green-100 text-green-800' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-800' },
  { label: 'Teal', value: 'bg-teal-100 text-teal-800' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800' },
  { label: 'Pink', value: 'bg-pink-100 text-pink-800' },
  { label: 'Orange', value: 'bg-orange-100 text-orange-800' },
  { label: 'Emerald', value: 'bg-emerald-100 text-emerald-800' },
  { label: 'Sky', value: 'bg-sky-100 text-sky-800' },
  { label: 'Cyan', value: 'bg-cyan-100 text-cyan-800' },
  { label: 'Gray', value: 'bg-gray-100 text-gray-800' },
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [syncingSanity, setSyncingSanity] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: 'bg-gray-100 text-gray-800',
    description: '',
    parentId: '',
    sortOrder: 0,
  })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const clearMessages = () => {
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  const handleSeed = async () => {
    setSeeding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
        fetchCategories()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to seed categories')
    } finally {
      setSeeding(false)
      clearMessages()
    }
  }

  const handleSyncToSanity = async () => {
    setSyncingSanity(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'Categories synced to Sanity')
      } else {
        setError(data.error || 'Failed to sync categories to Sanity')
      }
    } catch {
      setError('Failed to sync categories to Sanity')
    } finally {
      setSyncingSanity(false)
      clearMessages()
    }
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }))
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', color: 'bg-gray-100 text-gray-800', description: '', parentId: '', sortOrder: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const payload = {
      ...formData,
      parentId: formData.parentId || null,
    }

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(editingId ? 'Category updated!' : 'Category created!')
        resetForm()
        fetchCategories()
      } else {
        setError(data.error || 'Failed to save category')
      }
    } catch {
      setError('Failed to save category')
    }
    clearMessages()
  }

  const handleEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
      description: cat.description || '',
      parentId: cat.parentId || '',
      sortOrder: cat.sortOrder,
    })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"? ${cat.children.length > 0 ? 'Its subcategories will become top-level.' : ''}`)) return
    setError('')
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess(`"${cat.name}" deleted`)
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete')
      }
    } catch {
      setError('Failed to delete category')
    }
    clearMessages()
  }

  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      })
      if (res.ok) {
        setSuccess(`"${cat.name}" ${cat.isActive ? 'disabled' : 'enabled'}`)
        fetchCategories()
      }
    } catch {
      setError('Failed to update category')
    }
    clearMessages()
  }

  // Separate parent categories and subcategories
  const parentCategories = categories.filter((c) => !c.parentId)
  const allForParentSelect = categories.filter((c) => !c.parentId && c.id !== editingId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage categories and subcategories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncToSanity}
            disabled={syncingSanity || categories.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
          >
            {syncingSanity ? 'Syncing...' : 'Sync to Sanity'}
          </button>
          {categories.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {seeding ? 'Seeding...' : '🌱 Seed Default Categories'}
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            {showForm ? '✕ Cancel' : '+ New Category'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">{success}</div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 dark:text-white">
            {editingId ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Parent Category</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData((p) => ({ ...p, parentId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">None (Top-level)</option>
                {allForParentSelect.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional description"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories table */}
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No categories yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
            Click &quot;Seed Default Categories&quot; to populate from the default set, or create categories manually.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left px-4 py-3 font-medium dark:text-gray-300">Category</th>
                  <th className="text-left px-4 py-3 font-medium dark:text-gray-300 hidden sm:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 font-medium dark:text-gray-300 hidden md:table-cell">Parent</th>
                  <th className="text-left px-4 py-3 font-medium dark:text-gray-300 hidden md:table-cell">Subcategories</th>
                  <th className="text-center px-4 py-3 font-medium dark:text-gray-300">Status</th>
                  <th className="text-right px-4 py-3 font-medium dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parentCategories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    depth={0}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        {categories.length} total categories · {parentCategories.length} top-level · {categories.length - parentCategories.length} subcategories
      </p>
    </div>
  )
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
  onToggleActive,
  depth,
}: {
  category: Category
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
  onToggleActive: (c: Category) => void
  depth: number
}) {
  return (
    <>
      <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && <span className="text-gray-400">↳</span>}
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${category.color}`}>
              {category.name}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell font-mono text-xs">
          /{category.slug}
        </td>
        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
          {category.parent?.name || '—'}
        </td>
        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
          {category.children.length > 0 ? category.children.length : '—'}
        </td>
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => onToggleActive(category)}
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              category.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
      {/* Render subcategories inline */}
      {category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={{ ...child, children: child.children || [] }}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          depth={depth + 1}
        />
      ))}
    </>
  )
}
