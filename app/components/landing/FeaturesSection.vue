<script setup lang="ts">
/**
 * Features Section Component
 * Displays key features/advantages cards
 */

const features = [
  {
    id: 1,
    title: 'حفظ رتبه اعتباری کاربران',
    description: 'با جلوگیری از ثبت بدهی معوق در سامانه بانکی، از آسیب به سابقه اعتباری افراد جلوگیری می‌شود.',
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    `,
    gradient: 'from-primary to-accent'
  },
  {
    id: 2,
    title: 'ریسک صفر برای بانک/لندتک',
    description: 'پرداخت به‌موقع اقساط توسط عماد، احتمال نکول را به صفر می‌رساند و جریان نقدینگی مؤسسات مالی را تضمین می‌کند.',
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    `,
    gradient: 'from-secondary to-accent'
  },
  {
    id: 3,
    title: 'شفافیت و دسترسی آسان',
    description: 'کاربران می‌توانند وضعیت تراکنش‌ها، مبلغ و تاریخ‌های بازپرداخت را به‌صورت آنلاین رصد کنند.',
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    `,
    gradient: 'from-primary to-secondary'
  },
  {
    id: 4,
    title: 'فرصت جبران بدون تنش حقوقی',
    description: 'به کاربران فرصت داده می‌شود در بازه زمانی منطقی، بدهی خود را در بستری امن تسویه کنند.',
    icon: `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    `,
    gradient: 'from-accent to-secondary'
  }
]
</script>

<template>
  <section id="features" class="relative py-16 lg:py-24 bg-white overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    
    <div class="max-w-[1330px] mx-auto px-6">
      <!-- Section Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          چرا 
          <span class="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">عمادایران</span>
          ؟
        </h2>
        <p class="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          با استفاده از خدمات پرداخت جایگزین عمادایران، چرخه بازپرداخت خود را بدون آسیب به سابقه اعتباری‌تان مدیریت کنید.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="group relative bg-white border border-gray-200 rounded-2xl p-6 lg:p-8
                 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Icon -->
          <div class="flex items-start gap-4 lg:gap-5">
            <div :class="`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} 
                         flex items-center justify-center shadow-lg
                         group-hover:scale-110 transition-transform duration-300`">
              <svg class="w-7 h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="feature.icon">
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-2">
              <h3 class="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                {{ feature.title }}
              </h3>
              <p class="text-sm lg:text-base text-gray-600 leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>

          <!-- Hover Gradient Border Effect -->
          <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div :class="`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-5`"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Text / CTA -->
      <div class="mt-12 lg:mt-16 text-center">
        <p class="text-sm lg:text-base text-gray-600">
          این مزایا، عماد را به شریکی مطمئن و کارآمد برای همکاری شما تبدیل کرده است
        </p>
      </div>
    </div>
  </section>
</template>
