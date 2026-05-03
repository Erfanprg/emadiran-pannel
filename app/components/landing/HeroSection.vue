<script setup lang="ts">
/**
 * Hero Section Component
 * Main banner with title, description and CTA buttons
 */

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <section id="home" class="relative  flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
    <!-- Background Decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Gradient Circles -->
      <div class="absolute top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 -left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-[1330px] mx-auto px-6 py-12 lg:py-20">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        
        <!-- Content Side -->
        <div class="text-center lg:text-right space-y-5 lg:space-y-6">
          <!-- Main Title -->
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-[52px] flex flex-col gap-y-3 justify-center lg:justify-start">
            <span class="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">عمادایران</span>
            <span class="text-gray-900 text-2xl md:text-3xl lg:text-4xl">حفظ سلامت اعتباری به صورت هوشمند</span>
          </h1>

          <!-- Description -->
          <p class="text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 h-0">
            &nbsp;
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <!-- Primary CTA -->
            <NuxtLink
              to="/auth"
              class="group inline-flex items-center justify-center px-6 py-3 text-sm lg:text-base font-semibold
                     bg-gradient-to-br from-primary to-accent text-white rounded-lg
                     shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                     transition-all duration-300 hover:-translate-y-1"
            >
              <span>ورود به پنل کاربری</span>
              <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </NuxtLink>

            <!-- Secondary CTA -->
            <button
              @click="scrollToSection('about')"
              class="group inline-flex items-center justify-center px-6 py-3 text-sm lg:text-base font-semibold
                     bg-white text-primary border-2 border-primary/20 rounded-lg
                     hover:bg-primary/5 hover:border-primary
                     transition-all duration-300 hover:-translate-y-1"
            >
              <span>بیشتر بدانید</span>
              <svg class="w-5 h-5 mr-2 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

          <!-- Trust Badge / Stats -->
          <div class="flex  items-center lg:items-start gap-3 pt-4 text-xs lg:text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">۱۰۰٪ امن و مطمئن</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span class="font-medium">همیشه در کنار شما</span>
            </div>
          </div>
        </div>

        <!-- Image Side -->
        <div class="relative hidden lg:flex justify-center items-center">
          <!-- Decorative Elements -->
          <div class="absolute top-8 left-8 w-16 h-16 bg-secondary/20 rounded-full animate-pulse"></div>
          <div class="absolute bottom-8 right-8 w-12 h-12 bg-primary/20 rounded-full animate-pulse delay-75"></div>
          
          <!-- Main Illustration Circle -->
          <div class="relative w-full max-w-lg aspect-square">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl"></div>
            <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full p-2" style="filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15));">
              <!-- Image -->
              <img 
                src="~/assets/images/emadiran-hero.png" 
                alt="عمادایران" 
                class="w-full h-auto "
                style="filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.20));"
              />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
      <button 
        @click="scrollToSection('features')"
        class="flex flex-col items-center gap-2 text-gray-400 hover:text-primary transition-colors group"
      >
        <span class="text-sm">ادامه مطلب</span>
        <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-75 {
  animation-delay: 0.75s;
}
</style>
