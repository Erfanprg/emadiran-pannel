<script setup lang="ts">
/**
 * Landing Page Navbar Component
 * Contains logo, navigation menu and CTA button
 */

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const menuItems = [
  { label: 'خانه', id: 'home' },
  { label: 'درباره ما', id: 'about' },
  { label: 'خدمات', id: 'services' },
  { label: 'سوالات متداول', id: 'faq' },
  { label: 'تماس با ما', id: 'contact' },
]

// Mobile menu state
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
    <div class="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center flex-shrink-0 transition-transform">
        <img src="/emad-logo-p.png" alt="عماد، نماد اعتماد" class="h-14 w-auto" />
      </NuxtLink>

      <!-- Desktop Menu -->
      <div class="hidden lg:flex items-center gap-8 flex-1 justify-center">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="scrollToSection(item.id)"
          class="relative text-gray-700 text-[15px] font-medium py-2 transition-colors hover:text-primary
                 after:absolute after:bottom-0 after:right-0 after:h-0.5 after:w-0 after:bg-primary 
                 after:transition-all after:duration-300 hover:after:w-full"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- CTA Button & Mobile Toggle -->
      <div class="flex items-center gap-4">
        <NuxtLink 
          to="/auth" 
          class="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-br from-primary to-accent
                 text-white font-semibold text-[15px] rounded-lg shadow-lg shadow-primary/20
                 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        >
          ورود به پنل
        </NuxtLink>

        <!-- Mobile Menu Toggle -->
        <button 
          @click="toggleMobileMenu" 
          class="lg:hidden flex items-center justify-center p-2 text-gray-700"
        >
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden flex flex-col p-4 gap-2 border-t border-gray-200 bg-white">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="scrollToSection(item.id); mobileMenuOpen = false"
          class="text-gray-700 text-base font-medium py-3 px-4 text-right rounded-lg
                 transition-colors hover:bg-gray-100 hover:text-primary"
        >
          {{ item.label }}
        </button>
        <NuxtLink 
          to="/auth" 
          class="mt-2 inline-flex items-center justify-center py-3 px-6 
                 bg-gradient-to-br from-primary to-accent text-white font-semibold rounded-lg"
        >
          ورود به پنل
        </NuxtLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* Keep minimal custom CSS only for gradient backgrounds if needed */
</style>
