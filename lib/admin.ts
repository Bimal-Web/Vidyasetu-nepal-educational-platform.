/**
 * Single source of truth for platform administrative privileges.
 * Only legitimate administrator accounts belong in this list.
 */
export const ADMIN_EMAILS: string[] = [
  'bimalweb842@gmail.com',
  'admin@vidyasetu.com',
]

/**
 * Checks whether a given user email or database profile role qualifies for admin access.
 */
export function isUserAdmin(email?: string | null, role?: string | null): boolean {
  if (role === 'admin') return true
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
