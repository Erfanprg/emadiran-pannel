<script setup lang="ts">
interface FilterField {
  key: string
  label?: string
  type: 'text' | 'number' | 'select' | 'date'
  placeholder?: string
  options?: { label: string; value: any }[]
  modelValue?: any
}

interface Props {
  title?: string
  fields: FilterField[]
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  showActions?: boolean
  applyLabel?: string
  resetLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'فیلترها',
  showSearch: false,
  searchPlaceholder: 'جستجو...',
  showActions: true,
  applyLabel: 'اعمال فیلتر',
  resetLabel: 'پاک کردن'
})

const emit = defineEmits<{
  search: [value: string]
  apply: []
  reset: []
  'update:field': [key: string, value: any]
}>()

const localSearch = ref(props.searchValue || '')

const handleSearch = () => {
  emit('search', localSearch.value)
}

const handleApply = () => {
  emit('apply')
}

const handleReset = () => {
  localSearch.value = ''
  emit('reset')
}

const handleFieldChange = (key: string, value: any) => {
  emit('update:field', key, value)
}

// Watch for external search value changes
watch(() => props.searchValue, (newVal) => {
  localSearch.value = newVal || ''
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
    <!-- Title -->
    <h3 v-if="title" class="text-lg font-bold text-gray-900 mb-4">{{ title }}</h3>
    
    <div class="flex flex-col gap-4">
      <!-- Search Row (if enabled) -->
      <div v-if="showSearch" class="flex gap-2">
        <input
          v-model="localSearch"
          type="text"
          :placeholder="searchPlaceholder"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          @keyup.enter="handleSearch"
        />
        <button
          @click="handleSearch"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 whitespace-nowrap font-medium"
        >
          جستجو
        </button>
      </div>

      <!-- Filter Fields -->
      <div class="grid gap-4" :class="fields.length === 1 ? 'grid-cols-1' : fields.length === 2 ? 'sm:grid-cols-2' : fields.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'">
        <div v-for="field in fields" :key="field.key">
          <!-- Label (optional) -->
          <label v-if="field.label" class="block text-sm font-medium text-gray-700 mb-2">
            {{ field.label }}
          </label>

          <!-- Text Input -->
          <input
            v-if="field.type === 'text'"
            :value="field.modelValue"
            type="text"
            :placeholder="field.placeholder"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            @input="handleFieldChange(field.key, ($event.target as HTMLInputElement).value)"
          />

          <!-- Number Input -->
          <input
            v-else-if="field.type === 'number'"
            :value="field.modelValue"
            type="number"
            :placeholder="field.placeholder"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            @input="handleFieldChange(field.key, ($event.target as HTMLInputElement).value)"
          />

          <!-- Date Input -->
          <div v-else-if="field.type === 'date'" class="relative">
            <input
              :value="field.modelValue"
              type="text"
              :class="`filter-date-${field.key} w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`"
              @input="handleFieldChange(field.key, ($event.target as HTMLInputElement).value)"
            />
            <date-picker 
              :model-value="field.modelValue"
              @update:model-value="handleFieldChange(field.key, $event)"
              :custom-input="`.filter-date-${field.key}`"
            />
          </div>

          <!-- Select Input -->
          <select
            v-else-if="field.type === 'select'"
            :value="field.modelValue"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            @change="handleFieldChange(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option 
              v-for="option in field.options" 
              :key="String(option.value)" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="showActions" class="flex items-center gap-2 mt-4 w-full justify-end">
        <button
          @click="handleApply"
          class="px-12 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
        >
          {{ applyLabel }}
        </button>
        <button
          @click="handleReset"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
        >
          {{ resetLabel }}
        </button>
      </div>
    </div>

    <!-- Custom slot for additional content -->
    <slot />
  </div>
</template>
