import { ref, computed, watch } from 'vue'

/**
 * Format a number with thousand separators (commas)
 * @param value - The value to format (can be string or number)
 * @returns Formatted string with commas
 */
export function formatCurrencyInput(value: string | number): string {
  if (!value && value !== 0) return ''
  
  // Convert to string and remove any existing commas
  const stringValue = String(value).replace(/,/g, '')
  
  // Check if it's a valid number
  if (!/^\d*$/.test(stringValue)) return String(value)
  
  // Add thousand separators
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Remove formatting and get raw number string
 * @param value - The formatted value
 * @returns Raw number string without commas
 */
export function unformatCurrencyInput(value: string): string {
  if (!value) return ''
  return String(value).replace(/,/g, '')
}

/**
 * Composable for currency input with automatic formatting
 * @param initialValue - Initial value (optional)
 * @returns Object with displayValue, rawValue, and setValue
 */
export function useCurrencyInput(initialValue: string | number = '') {
  // Display value with formatting (what user sees)
  const displayValue = ref<string>(formatCurrencyInput(initialValue))
  
  // Raw value without formatting (for API calls)
  const rawValue = computed<string>(() => unformatCurrencyInput(displayValue.value))
  
  // Numeric value as number
  const numericValue = computed<number>(() => {
    const raw = rawValue.value
    return raw ? parseFloat(raw) : 0
  })
  
  /**
   * Handle input event - format the value
   */
  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    const cursorPosition = input.selectionStart || 0
    const oldValue = displayValue.value
    const newValue = input.value
    
    // Get raw value (without commas)
    const raw = unformatCurrencyInput(newValue)
    
    // Only allow digits
    if (raw && !/^\d+$/.test(raw)) {
      // If not valid, revert to old value
      input.value = oldValue
      return
    }
    
    // Format the value
    const formatted = formatCurrencyInput(raw)
    displayValue.value = formatted
    
    // Restore cursor position (adjust for added/removed commas)
    const commasBefore = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length
    const commasAfter = (formatted.substring(0, cursorPosition).match(/,/g) || []).length
    const newCursorPosition = cursorPosition + (commasAfter - commasBefore)
    
    // Set cursor position in next tick
    setTimeout(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }
  
  /**
   * Set value programmatically
   */
  const setValue = (value: string | number) => {
    displayValue.value = formatCurrencyInput(value)
  }
  
  /**
   * Clear the value
   */
  const clear = () => {
    displayValue.value = ''
  }
  
  return {
    displayValue,
    rawValue,
    numericValue,
    handleInput,
    setValue,
    clear
  }
}
