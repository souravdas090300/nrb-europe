export type UserRole = 'superAdmin' | 'editor' | 'author' | 'viewer';

export interface RolePermission {
  name: string;
  description: string;
  permissions: string[];
  documentTypes: string[];
  actions: string[];
  restrictions?: {
    canPublish?: boolean;
    canDelete?: boolean;
    canCreateUsers?: boolean;
    canManageSettings?: boolean;
    canSchedule?: boolean;
    canSetBreakingNews?: boolean;
    viewOtherUsersContent?: boolean;
  };
}

export const ROLES: Record<UserRole, RolePermission> = {
  superAdmin: {
    name: 'superAdmin',
    description: 'Full system administrator',
    permissions: ['*'], // Wildcard - everything
    documentTypes: ['*'],
    actions: ['*'],
    restrictions: {
      canPublish: true,
      canDelete: true,
      canCreateUsers: true,
      canManageSettings: true,
      canSchedule: true,
      canSetBreakingNews: true,
      viewOtherUsersContent: true,
    },
  },
  editor: {
    name: 'editor',
    description: 'Chief Editor - Can publish, edit, and manage content',
    permissions: [
      'read',
      'create',
      'update',
      'publish',
      'unpublish',
      'history',
      'editHistory',
    ],
    documentTypes: ['article', 'category', 'author', 'tag'],
    actions: ['publish', 'unpublish', 'duplicate', 'delete'],
    restrictions: {
      canPublish: true,
      canDelete: false, // Can only archive
      canCreateUsers: false,
      canManageSettings: false,
      canSchedule: true,
      canSetBreakingNews: true,
      viewOtherUsersContent: true,
    },
  },
  author: {
    name: 'author',
    description: 'Journalist - Can create content but not publish',
    permissions: ['read', 'create', 'update'],
    documentTypes: ['article'],
    actions: ['create', 'update', 'duplicate'],
    restrictions: {
      canPublish: false,
      canDelete: false,
      canCreateUsers: false,
      canManageSettings: false,
      canSchedule: false,
      canSetBreakingNews: false,
      viewOtherUsersContent: false, // Can only see own content
    },
  },
  viewer: {
    name: 'viewer',
    description: 'Read-only access for auditors',
    permissions: ['read'],
    documentTypes: ['article', 'category'],
    actions: [],
    restrictions: {
      canPublish: false,
      canDelete: false,
      canCreateUsers: false,
      canManageSettings: false,
      canSchedule: false,
      canSetBreakingNews: false,
      viewOtherUsersContent: true,
    },
  },
};

// Helper functions
export function getUserRole(currentUser: any): UserRole {
  const roles = currentUser?.roles || [];
  const roleNames = roles.map((r: any) => r.name);
  
  if (roleNames.includes('superAdmin')) return 'superAdmin';
  if (roleNames.includes('editor')) return 'editor';
  if (roleNames.includes('author')) return 'author';
  return 'viewer';
}

export function hasPermission(
  currentUser: any,
  permission: string,
  documentType?: string
): boolean {
  const role = getUserRole(currentUser);
  const roleConfig = ROLES[role];
  
  // Super admin has all permissions
  if (role === 'superAdmin') return true;
  
  // Check wildcard
  if (roleConfig.permissions.includes('*')) return true;
  
  // Check specific permission
  if (!roleConfig.permissions.includes(permission)) return false;
  
  // Check document type restriction
  if (documentType) {
    if (roleConfig.documentTypes.includes('*')) return true;
    if (!roleConfig.documentTypes.includes(documentType)) return false;
  }
  
  return true;
}

export function canPerformAction(
  currentUser: any,
  action: string,
  document?: any
): boolean {
  const role = getUserRole(currentUser);
  const roleConfig = ROLES[role];
  
  // Super admin can do everything
  if (role === 'superAdmin') return true;
  
  // Check if action is allowed for this role
  if (roleConfig.actions.includes('*')) return true;
  if (!roleConfig.actions.includes(action)) return false;
  
  // Special checks for authors
  if (role === 'author' && document) {
    // Authors can only edit their own documents
    const userId = currentUser?.id;
    const documentAuthorId = document.author?._ref;
    
    if (action === 'update' || action === 'delete') {
      return documentAuthorId === userId;
    }
  }
  
  return true;
}
