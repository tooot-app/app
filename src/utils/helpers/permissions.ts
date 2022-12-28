export const PERMISSION_MANAGE_REPORTS = 0x0000000000000010
export const PERMISSION_MANAGE_USERS = 0x0000000000000400

export const checkPermission = (permission: number, permissions?: string | number): boolean =>
  permissions
    ? !!(
        (typeof permissions === 'string' ? parseInt(permissions || '0') : permissions) & permission
      )
    : false
