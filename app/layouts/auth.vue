<script setup lang="ts">
/**
 * Auth layout for login, register, verify, etc.
 */
</script>

<template>
    <div class="auth-layout">
        <!-- Content -->
        <div class="auth-content">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.auth-layout {
    @apply w-full relative ;
}

.auth-content {
    @apply w-full flex items-center justify-center min-h-screen relative;
    z-index: 10;
}
</style>
