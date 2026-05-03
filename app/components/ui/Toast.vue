<script setup lang="ts">
import type { ToastMessage } from '~/types/toast'

const props = defineProps<{
  toast: ToastMessage
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isSuccess = computed(() => props.toast.type === 'success')
const isError = computed(() => props.toast.type === 'error')
const isWarning = computed(() => props.toast.type === 'warning')
const isInfo = computed(() => props.toast.type === 'info')

// Auto-show animation
const show = ref(false)
onMounted(() => {
  setTimeout(() => {
    show.value = true
  }, 10)
})

const handleClose = () => {
  show.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}
</script>

<template>
  <div
    class="fixed top-3 right-3 w-full max-w-[420px] px-4 z-[99999] transition-all duration-300 ease-out"
    :class="show ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'"
  >
    <div
      class="rounded-lg h-[50px] px-4 flex items-center justify-between border-2 shadow-lg bg-white"
      :class="{
        'border-green-500': isSuccess,
        'border-red-500': isError,
        'border-yellow-500': isWarning,
        'border-blue-500': isInfo,
      }"
    >
      <!-- Content -->
      <div class="flex items-center gap-x-3">
        <!-- Icon -->
        <div
          class="w-5 h-5 flex-shrink-0"
          :class="{
            'text-green-500': isSuccess,
            'text-red-500': isError,
            'text-yellow-500': isWarning,
            'text-blue-500': isInfo,
          }"
        >
          <!-- Success Icon -->
          <svg
            v-if="isSuccess"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Error Icon -->
          <svg
            v-else-if="isError"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Warning Icon -->
          <svg
            v-else-if="isWarning"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Info Icon -->
          <svg
            v-else-if="isInfo"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Message -->
        <p
          class="text-sm font-bold"
          :class="{
            'text-green-500': isSuccess,
            'text-red-500': isError,
            'text-yellow-500': isWarning,
            'text-blue-500': isInfo,
          }"
        >
          {{ toast.message }}
        </p>
      </div>

      <!-- Close Button -->
      <button
        type="button"
        class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        :class="{
          'text-green-500': isSuccess,
          'text-red-500': isError,
          'text-yellow-500': isWarning,
          'text-blue-500': isInfo,
        }"
        @click="handleClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
