<script setup lang="ts">
/**
 * Auth container with gradient border, decorative icons, and title
 */
defineProps<{
    title: string
}>()
</script>

<template>
    <!-- Gradient border wrapper -->
    <div class="auth-container-wrapper">
        <!-- Inner content -->
        <div class="auth-container">
            <div class="relative flex justify-center">
                <!-- Top right corner decoration -->
                <div class="relative min-w-fit z-10">
                    <svg class="absolute -top-1 -right-8" width="26" height="22" viewBox="0 0 26 22" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8.43333" cy="13.5671" r="8.43333" fill="#0f3057" />
                        <circle cx="22.0007" cy="3.66667" r="3.66667" fill="#0f3057" />
                    </svg>

                    <!-- Title -->
                    <h1 class="font-shabnam font-bold text-[32px] text-center text-gray-900 ">
                        {{ title }}
                    </h1>
                </div>

                <!-- Ellipse decoration below title -->
                <div class="flex justify-center absolute left-0 right-0 top-[-132px] opacity-90 z-0">
                    <IconEllipss />
                </div>
            </div>

            <!-- Form content -->
            <slot />
        </div>
    </div>
</template>

<style scoped>
.auth-container-wrapper {
    @apply min-w-[95%] max-w-[400px] md:min-w-[560px] md:max-w-[600px] rounded-2xl p-[5px] overflow-hidden;
}

.auth-container {
    @apply relative w-full h-auto min-h-[550px] py-8 px-[50px] bg-white rounded-[11px] overflow-hidden flex flex-col justify-between;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>
