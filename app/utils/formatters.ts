/**
 * Format a date to Persian locale
 * @param date - Date string, Date object, or timestamp
 * @param includeTime - Include time in output (default: false)
 * @returns Formatted date string or '-' if invalid
 */
export const formatDate = (date: string | Date | number | null | undefined, includeTime = false): string => {
  if (!date) return '-'
  
  try {
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '-'
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
    
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    
    return dateObj.toLocaleDateString('fa-IR', options)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '-'
  }
}

/**
 * Format a number to Persian locale
 * @param value - Number or string to format
 * @param defaultValue - Default value if invalid (default: '0')
 * @returns Formatted number string
 */
export const formatNumber = (value: string | number | null | undefined, defaultValue = '0'): string => {
  if (value === null || value === undefined || value === '') return defaultValue
  
  try {
    const num = typeof value === 'string' ? parseInt(value) : value
    
    if (isNaN(num)) return defaultValue
    
    return num.toLocaleString('fa-IR')
  } catch (error) {
    console.error('Number formatting error:', error)
    return defaultValue
  }
}

/**
 * Format currency (Rial)
 * @param value - Amount in Rial
 * @param showUnit - Show 'ریال' unit (default: false)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: string | number | null | undefined, showUnit = false): string => {
  const formatted = formatNumber(value, '0')
  return showUnit ? `${formatted} ریال` : formatted
}
