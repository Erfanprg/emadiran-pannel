<template>
  <section id="faq" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4 max-w-[1330px]">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-block px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full text-sm font-medium mb-4">
          سوالات متداول
        </span>
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          پاسخ به 
          <span class="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            سوالات شما
          </span>
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          پاسخ سوالات رایج درباره خدمات عماد و نحوه استفاده از پنل کاربری
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-4">
        <div
          v-for="(item, index) in faqs"
          :key="index"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          <button
            @click="toggleFAQ(index)"
            class="w-full px-6 py-5 flex items-center justify-between text-right transition-colors duration-200"
            :class="activeIndex === index ? '' : 'hover:bg-gray-50'"
          >
            <span class="lg:text-lg font-bold text-gray-900 flex-1 pl-4">
              {{ item.question }}
            </span>
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
              :class="activeIndex === index ? 'bg-gradient-to-br from-primary to-secondary rotate-180' : 'bg-gray-100'"
            >
              <svg 
                class="w-5 h-5 transition-colors duration-300" 
                :class="activeIndex === index ? 'text-white' : 'text-gray-600'"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div
            class="overflow-hidden transition-all duration-300"
            :style="{ maxHeight: activeIndex === index ? maxHeights[index] + 'px' : '0px' }"
          >
            <div :ref="el => setRef(el, index)" class="text-sm lg:text-base px-6 pb-5 text-gray-700 leading-relaxed">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-12 text-center bg-white rounded-2xl border border-gray-200 p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-3">
          سوال دیگری دارید؟
        </h3>
        <p class="text-gray-600 mb-6">
          تیم پشتیبانی ما آماده پاسخگویی به سوالات شماست
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a
            href="tel:02192002343"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            تماس با ما
          </a>
          <NuxtLink
            to="/auth"
            class="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all duration-300"
          >
            ورود به پنل
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const activeIndex = ref<number | null>(null)
const maxHeights = ref<number[]>([])
const contentRefs = ref<(HTMLElement | null)[]>([])

const faqs = [
  {
    question: '۱. عمادایران چه خدمتی ارائه می‌دهد؟',
    answer: 'عمادایران سرویس «ضمانت هوشمند اقساط» است. ما با بانک‌ها و لندتک‌هایی مانند نسیبا و تارا قرارداد همکاری داریم و برای کاربرانی که شرایط دریافت وام را دارند، ضمانت‌نامه صادر می‌کنیم. در صورت تأخیر کاربر در پرداخت قسط، ما مبلغ را به نهاد مالی پرداخت می‌کنیم و در ادامه، پیگیری و وصول آن را از طریق فرایندهای حقوقی انجام می‌دهیم.'
  },
  {
    question: '۲. چرا باید از عمادایران استفاده کنم؟',
    answer: 'با این خدمت، حتی اگر به هر دلیل نتوانید در سررسید قسط خود را پرداخت کنید، ضمانت عماد باعث می‌شود چرخه پرداخت‌های شما به بانک یا لندتک قطع نشود و سابقه اعتباری‌تان آسیب نبیند. همچنین فرصت می‌یابید در مهلت تعیین‌شده توسط عماد، بدهی خود را با آرامش بیشتر تسویه کنید.'
  },
  {
    question: '۳. اگر قسط خود را به موقع به عمادایران نپردازم چه اتفاقی می‌افتد؟',
    answer: 'در این حالت، عماد با استفاده از سازوکارهای حقوقی و وصول مطالبات، پیگیری قانونی را آغاز می‌کند. پیشنهاد می‌کنیم حتماً در مهلت مقرر نسبت به پرداخت اقدام کنید تا وارد فرایند حقوقی نشوید.'
  },
  {
    question: '۴. چگونه می‌توانم وضعیت ضمانت‌نامه و تراکنش‌های خود را ببینم؟',
    answer: 'پس از ثبت درخواست و فعال‌سازی حساب کاربری در emadiran.ir، می‌توانید همه تراکنش‌ها، مبالغ و تاریخ‌های پرداخت را در پنل خود مشاهده کنید.'
  },
  {
    question: '۵. آیا عمادایران مستقیم وام ارائه می‌دهد؟',
    answer: 'خیر، عمادایران خودش وام‌دهنده نیست؛ بلکه به عنوان ضامن بین شما (کاربر) و نهاد مالی (بانک یا لندتک) عمل می‌کند تا فرایند بازپرداخت با انعطاف و امنیت بیشتری انجام شود.'
  },
  {
    question: '۶. آیا کاربر می‌تواند مستقیماً و بدون واسطه لندتک یا بانک، از خدمات ضمانت عمادایران استفاده کند؟',
    answer: 'خیر، خدمات ضمانت عمادایران تنها از طریق شرکای مالی همکار (مانند لندتک‌ها و بانک‌ها) در دسترس است. به عبارت دیگر، کاربران نمی‌توانند به صورت مستقیم و با مراجعه به عمادایران درخواست ضمانت دهند.'
  }
]

const setRef = (el: any, index: number) => {
  contentRefs.value[index] = el
}

const toggleFAQ = async (index: number) => {
  if (activeIndex.value === index) {
    activeIndex.value = null
  } else {
    activeIndex.value = index
  }
  
  await nextTick()
  updateMaxHeights()
}

const updateMaxHeights = () => {
  contentRefs.value.forEach((ref, index) => {
    if (ref) {
      maxHeights.value[index] = ref.scrollHeight
    }
  })
}

onMounted(() => {
  updateMaxHeights()
})
</script>
