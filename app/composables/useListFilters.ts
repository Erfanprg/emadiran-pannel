import type { Ref } from 'vue'

/**
 * Filter state of an admin list page driven by BaseFiltersBar.
 * Text filters are trimmed (empty becomes undefined) and the "همه" select option maps back to undefined.
 */
export const useListFilters = <T extends Record<string, any>>(
  createDefaults: () => T,
  textKeys: string[],
  selectKeys: string[]
) => {
  const filters = ref(createDefaults()) as Ref<T>

  const updateFilter = (key: string, val: any) => {
    const target = filters.value as Record<string, any>
    if (textKeys.includes(key)) {
      const trimmed = val?.trim()
      target[key] = trimmed || undefined
    } else if (selectKeys.includes(key)) {
      target[key] = val === 'undefined' ? undefined : val
    }
  }

  const resetFilterValues = () => {
    filters.value = createDefaults()
  }

  // Query params without undefined/empty values
  const getCleanedFilters = () =>
    Object.fromEntries(
      Object.entries(filters.value).filter(
        ([_, v]) => v !== undefined && v !== '' && v !== null
      )
    )

  return { filters, updateFilter, resetFilterValues, getCleanedFilters }
}
