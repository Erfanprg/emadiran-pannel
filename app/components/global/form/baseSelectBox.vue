<script setup lang="ts">
import { useClickOutside } from '~/composables/useClickOutside'
import type { SelectBox } from '~/types/global'

const props = defineProps<SelectBox>()

const emit = defineEmits<{
  'update:model-value': [value: string | number]
}>()

// State
const isOpen = ref<boolean>(false)
const inputValue = ref<string>('')
const selectedItem = ref<any>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const isSearching = ref<boolean>(false)

// Initialize from props
onMounted(() => {
  if (props.modelValue) {
    const foundItem = props.items.find(item => item.ID === props.modelValue)
    if (foundItem) {
      selectedItem.value = foundItem
      inputValue.value = foundItem.name
    }
  }
})

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const foundItem = props.items.find(item => item.ID === newVal)
    if (foundItem) {
      selectedItem.value = foundItem
      inputValue.value = foundItem.name
    }
  } else {
    selectedItem.value = null
    inputValue.value = ''
  }
})

// Watch input changes to detect searching
watch(inputValue, (newVal) => {
  if (isOpen.value) {
    isSearching.value = newVal !== selectedItem.value?.name
  }
})

// Items list with selected first, then others
const displayItems = computed(() => {
  if (isSearching.value && inputValue.value) {
    return props.items.filter(item => 
      item.name.toLowerCase().includes(inputValue.value.toLowerCase())
    )
  }
  
  if (selectedItem.value) {
    const selected = props.items.find(item => item.ID === selectedItem.value.ID)
    const others = props.items.filter(item => item.ID !== selectedItem.value.ID)
    return selected ? [selected, ...others] : props.items
  }
  
  return props.items
})

// Select item handler
const selectItem = (item: any): void => {
  selectedItem.value = item
  inputValue.value = item.name
  isOpen.value = false
  isSearching.value = false
  emit('update:model-value', item.ID)
}

// Focus handler
const handleFocus = (): void => {
  isOpen.value = true
  isSearching.value = false
}

// Click outside handler
useClickOutside(dropdownRef, () => {
  if (isOpen.value) {
    isOpen.value = false
    isSearching.value = false
    if (selectedItem.value) {
      inputValue.value = selectedItem.value.name
    } else {
      inputValue.value = ''
    }
  }
})
</script>

<template>
  <div class="relative w-full dropdown-container" ref="dropdownRef">
    <div class="relative">
      <FormBaseInput 
        v-model:modelValue="inputValue" 
        :type="typeInput" 
        :placeholder="placeholder" 
        :label="label"
        :mandatory="mandatory" 
        :disabled="disabled" 
        :classInput="isOpen ? '!rounded-b-none' : ''"
        @focus="handleFocus"
      />
      <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" :class="{ 'mt-4': label }">
        <IconArrowbottom class="transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </div>
    </div>
    
    <ul v-if="isOpen" class="dropdown-menu">
      <li 
        v-for="item in displayItems" 
        :key="item.ID" 
        @click="selectItem(item)"
        :class="{ 'active-item-input': selectedItem && selectedItem.ID === item.ID }" 
        class="dropdown-item"
      >
        {{ item.name }}
      </li>
      <li v-if="displayItems.length === 0" class="dropdown-empty">
        {{ $t('global.empty_list') }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
@import url('~/assets/css/form.css');

.dropdown-container {
  direction: rtl;
}
</style>
