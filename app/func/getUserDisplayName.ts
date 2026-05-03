/**
 * Get display name for user
 * Returns firstName + lastName if available, otherwise fallback to fullName
 */
export function getUserDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  phoneNumber?: string
}): string {
  // Try to use firstName and lastName
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim()
  }
  
  // Fallback to firstName only
  if (user.firstName) {
    return user.firstName.trim()
  }
  
  // Fallback to lastName only
  if (user.lastName) {
    return user.lastName.trim()
  }
  
  // Fallback to fullName
  if (user.fullName) {
    return user.fullName.trim()
  }
  
  // Fallback to phoneNumber
  if (user.phoneNumber) {
    return user.phoneNumber
  }
  
  // Ultimate fallback
  return 'کاربر'
}
