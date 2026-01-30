// Role-based permissions configuration for editorial workflow

export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  VIEWER: 'viewer',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    name: 'Super Admin',
    description: 'Full system access including user management',
    permissions: [
      'read',
      'create',
      'update',
      'delete',
      'publish',
      'unpublish',
      'manageUsers',
      'manageRoles',
      'viewAnalytics',
      'setBreaking',
      'schedulePublish',
    ],
    color: '#9333ea', // purple
  },
  [ROLES.EDITOR]: {
    name: 'Editor',
    description: 'Can review, approve, and publish all content',
    permissions: [
      'read',
      'create',
      'update',
      'publish',
      'unpublish',
      'viewAnalytics',
      'setBreaking',
      'schedulePublish',
      'editOthers',
    ],
    color: '#dc2626', // red
  },
  [ROLES.AUTHOR]: {
    name: 'Author',
    description: 'Can create and edit own drafts, cannot publish',
    permissions: [
      'read',
      'create',
      'update',
      'editOwn',
    ],
    color: '#2563eb', // blue
  },
  [ROLES.VIEWER]: {
    name: 'Viewer',
    description: 'Read-only access to content',
    permissions: ['read'],
    color: '#6b7280', // gray
  },
}

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS]

export const STATUS_LABELS = {
  [ARTICLE_STATUS.DRAFT]: { title: '📝 Draft', color: '#6b7280' },
  [ARTICLE_STATUS.REVIEW]: { title: '👀 Under Review', color: '#f59e0b' },
  [ARTICLE_STATUS.APPROVED]: { title: '✅ Approved', color: '#10b981' },
  [ARTICLE_STATUS.PUBLISHED]: { title: '🚀 Published', color: '#3b82f6' },
  [ARTICLE_STATUS.ARCHIVED]: { title: '📦 Archived', color: '#6b7280' },
}

// Helper to check if user has permission
export function hasPermission(userRole: Role, permission: string): boolean {
  const roleConfig = ROLE_PERMISSIONS[userRole]
  return roleConfig?.permissions.includes(permission) || false
}

// Helper to check if user can edit a document
export function canEditDocument(
  userRole: Role,
  userId: string,
  documentAuthorId?: string
): boolean {
  if (hasPermission(userRole, 'editOthers')) return true
  if (hasPermission(userRole, 'editOwn') && documentAuthorId === userId) return true
  return false
}
