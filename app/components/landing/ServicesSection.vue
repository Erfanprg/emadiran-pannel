<script setup lang="ts">

const { t } = useI18n()

/**
 * Services Section Component
 * Displays main services offered
 */

const services = [
  {
    id: 1,
    title: t('landing.services.legal.title'),
    description: t('landing.services.legal.description'),
    features: [],
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    `,
    color: 'primary'
  },
  {
    id: 2,
    title: t('landing.services.recovery.title'),
    description: t('landing.services.recovery.description'),
    features: [],
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    `,
    color: 'secondary'
  },
  {
    id: 3,
    title: t('landing.services.consulting.title'),
    description: t('landing.services.consulting.description'),
    features: [],
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    `,
    color: 'accent'
  },
  {
    id: 4,
    title: t('landing.services.tech.title'),
    description: t('landing.services.tech.description'),
    features: [],
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    `,
    color: 'primary'
  }
]
</script>

<template>
  <section id="services" class="relative py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
    <!-- Background Decorations -->
    <div class="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

    <div class="relative max-w-[1330px] mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          <span class="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">{{ $t('global.navigation.services') }}</span>
          {{ $t('common.brand.emadiran') }}
        </h2>
        <p class="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          {{ $t('landing.services.subtitle') }}
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div
          v-for="service in services"
          :key="service.id"
          class="group relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-200
                 hover:border-primary/30 hover:shadow-2xl
                 transition-all duration-500 hover:-translate-y-2"
        >
          <!-- Icon Circle -->
          <div class="flex justify-center mb-6">
            <div :class="`w-20 h-20 rounded-2xl bg-gradient-to-br 
                         ${service.color === 'primary' ? 'from-primary to-accent' : 
                           service.color === 'secondary' ? 'from-secondary to-accent' : 
                           'from-accent to-secondary'}
                         flex items-center justify-center shadow-lg
                         group-hover:scale-110 group-hover:rotate-6
                         transition-all duration-500`">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="service.icon">
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="text-center space-y-4">
            <h3 class="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              {{ service.title }}
            </h3>
            <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
              {{ service.description }}
            </p>
          </div>

          <!-- Decorative Gradient -->
          <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div :class="`absolute inset-0 rounded-2xl bg-gradient-to-br ${
              service.color === 'primary' ? 'from-primary/5 to-accent/5' : 
              service.color === 'secondary' ? 'from-secondary/5 to-accent/5' : 
              'from-accent/5 to-secondary/5'
            }`"></div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-12 text-center">
        <p class="text-lg text-gray-700 mb-6">
          {{ $t('landing.contactCta') }}
        </p>
        <a
          href="tel:02192002343"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ $t('global.navigation.contact') }}
        </a>
      </div>
    </div>
  </section>
</template>
