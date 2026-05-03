<script setup lang="ts">
import type { Switch } from '~/types/global'

const props = defineProps<Switch>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
}>()

const handleChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  emit('update:model-value', target.checked)
}
</script>

<template>
  <div class="switch-container">
    <label v-if="label" class="switch-label">
      {{ label }}
    </label>
    <label class="switch">
      <input 
        type="checkbox" 
        :checked="modelValue"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="slider round"></span>
    </label>
  </div>
</template>

<style scoped>
.switch-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e7e7de;
  font-size: 0.875rem;
  font-weight: 500;
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2A2A2A; /* gray-600 */
  transition: 0.3s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: #e7e7de; /* white */
  transition: 0.3s;
}

input:checked + .slider {
  background-color: #0f3057; /* primary */
}

input:focus + .slider {
  box-shadow: 0 0 4px #0f3057;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

input:not(:disabled) + .slider:hover {
  opacity: 0.9;
}

/* Rounded sliders */
.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
