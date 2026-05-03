<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const toast = useToast()

const handleClose = (id: string) => {
  toast.remove(id)
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-0 left-0 w-full pointer-events-none z-[99999]"
    >
      <UiToast
        v-for="item in toast.toasts.value"
        :key="item.id"
        :toast="item"
        class="pointer-events-auto"
        @close="handleClose(item.id)"
      />
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(2rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
