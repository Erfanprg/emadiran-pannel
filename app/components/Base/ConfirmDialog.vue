<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'

const { state, handleConfirm, handleCancel } = useConfirm()

const iconColor = computed(() => {
  switch (state.options?.type) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'success':
      return 'text-green-600'
    default:
      return 'text-blue-600'
  }
})

const confirmButtonClass = computed(() => {
  switch (state.options?.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700'
    case 'success':
      return 'bg-green-600 hover:bg-green-700'
    default:
      return 'bg-primary hover:bg-accent'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="state.isOpen"
            class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <!-- Icon -->
            <div class="flex items-center justify-center mb-4">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center"
                :class="`bg-${state.options?.type || 'blue'}-50`"
              >
                <svg
                  class="w-8 h-8"
                  :class="iconColor"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    v-if="state.options?.type === 'danger'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                  <path
                    v-else-if="state.options?.type === 'warning'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else-if="state.options?.type === 'success'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Title -->
            <h3
              v-if="state.options?.title"
              class="text-xl font-bold text-gray-900 text-center mb-2"
            >
              {{ state.options.title }}
            </h3>

            <!-- Message -->
            <p class="text-gray-600 text-center mb-6">
              {{ state.options?.message }}
            </p>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button
                @click="handleCancel"
                class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors duration-200"
              >
                {{ state.options?.cancelText || 'انصراف' }}
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 py-3 text-white rounded-lg font-bold transition-colors duration-200"
                :class="confirmButtonClass"
              >
                {{ state.options?.confirmText || 'تایید' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
