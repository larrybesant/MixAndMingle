export interface UserPermission {
  id: string
  name: string
  description: string
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  disabled: boolean
  emailVerified: boolean
  creationTime: string | undefined
  lastSignInTime: string | undefined
  customClaims: {
    admin?: boolean
    roles?: string[]
    permissions?: string[]
    [key: string]: any
  }
}

export interface RolePermissionMatrix {
  roles: UserRole[]
  permissions: UserPermission[]
}

// Default permissions and roles
export const DEFAULT_PERMISSIONS: UserPermission[] = [
  { id: "users:read", name: "View Users", description: "Can view user list and profiles" },
  { id: "users:write", name: "Manage Users", description: "Can create and update users" },
  { id: "users:delete", name: "Delete Users", description: "Can delete users" },
  { id: "content:read", name: "View Content", description: "Can view all content" },
  { id: "content:write", name: "Manage Content", description: "Can create and update content" },
  { id: "content:delete", name: "Delete Content", description: "Can delete content" },
  { id: "rooms:read", name: "View Rooms", description: "Can view all rooms" },
  { id: "rooms:write", name: "Manage Rooms", description: "Can create and update rooms" },
  { id: "rooms:delete", name: "Delete Rooms", description: "Can delete rooms" },
  { id: "settings:read", name: "View Settings", description: "Can view application settings" },
  { id: "settings:write", name: "Manage Settings", description: "Can update application settings" },
]

export const DEFAULT_ROLES: UserRole[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all features",
    permissions: DEFAULT_PERMISSIONS.map((p) => p.id),
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Can manage content and users",
    permissions: ["users:read", "content:read", "content:write", "content:delete", "rooms:read"],
  },
  {
    id: "content-manager",
    name: "Content Manager",
    description: "Can manage content only",
    permissions: ["content:read", "content:write", "rooms:read", "rooms:write"],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access",
    permissions: ["users:read", "content:read", "rooms:read", "settings:read"],
  },
]
