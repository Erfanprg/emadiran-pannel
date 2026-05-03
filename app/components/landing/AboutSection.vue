<template>
  <section id="about" class="py-20 bg-white">
    <div class="container mx-auto px-4 max-w-[1330px]">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Text Content -->
        <div class="space-y-6">
          <div>
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full text-sm font-medium mb-4">
              درباره ما
            </span>
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              عماد، نماد 
              <span class="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                اعتماد
              </span>
            </h2>
          </div>

          <p class="text-lg text-gray-700 leading-relaxed">
            شرکت عماد نماد اعتماد (شماره ثبت ۶۴۷۴۵) فعالیت خود را از تاریخ ۱۰ فروردین ۱۴۰۴ با هدف ارائه خدمات حقوقی و وصول مطالبات به لندتک‌ها، بانک‌ها و سایر فعالان حوزه فین‌تک آغاز کرد.
          </p>

          <p class="text-gray-600 leading-relaxed">
            این شرکت در عمادایران، با تکیه بر تیمی جوان، متخصص و آشنا با فضای حقوقی و فناوری مالی، تلاش دارد پلی میان دانش حقوقی و فناوری‌های نوین در صنعت اعتباردهی آنلاین ایجاد کند.
          </p>

          <div class="flex flex-wrap gap-4 pt-4">
            <div class="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-lg">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span class="text-gray-900 font-medium">امن و محرمانه</span>
            </div>
            <div class="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-lg">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="text-gray-900 font-medium">سریع و چابک</span>
            </div>
            <div class="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-lg">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-900 font-medium">دقیق و شفاف</span>
            </div>
          </div>

          <div class="pt-4">
            <NuxtLink
              to="/auth"
              class="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              ورود به پنل کاربری
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Image/Illustration -->
        <div class="relative">
          <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-8">
            <!-- Decorative Elements -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
            
            <!-- Main Image -->
            <div class="relative flex items-center justify-center">
              <img 
                src="~/assets/images/why-emadiran.webp" 
                alt="عماد، نماد اعتماد" 
                class="w-full h-auto object-contain drop-shadow-2xl rounded-xl"
              />
            </div>
          </div>

          <!-- Floating Badge -->
          <div class="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden lg:block">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-bold text-gray-900">مورد اعتماد</div>
                <div class="text-xs text-gray-600">فین‌تک‌های برتر</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
