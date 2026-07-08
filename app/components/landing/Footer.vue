<template>
  <footer
    class="bg-gradient-to-br from-gray-900 via-primary to-gray-900 text-white"
  >
    <!-- Main Footer Content -->
    <div class="container mx-auto px-4 max-w-[1400px] py-16">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
        <!-- Company Info -->
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-bold mb-2">عمادایران</h3>
            <p class="text-gray-300 text-sm leading-relaxed">
              پلتفرم بازپرداخت هوشمند اقساط
            </p>
            <p class="text-gray-400 text-xs mt-2">
              محصولی از شرکت عماد، نماد اعتماد
            </p>
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap gap-3">
            <!-- E-namad Badge -->
            <div class="bg-white rounded-xl p-3 shadow-lg">
              <a
                referrerpolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=703444&Code=sGHllu7NvM7VlTphGEG1f2thbTNvDfUX"
                ><img
                  referrerpolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=703444&Code=sGHllu7NvM7VlTphGEG1f2thbTNvDfUX"
                  alt="اینماد"
                  style="cursor: pointer"
                  code="sGHllu7NvM7VlTphGEG1f2thbTNvDfUX"
                  class="w-24 h-auto"
              /></a>
            </div>

            <!-- Badge -->
            <div class="bg-white rounded-xl p-3 shadow-lg">
              <a
                onclick="window.open('https://panel.aqayepardakht.ir/trustGateway/80153',null,'width=400, height=600, scrollbars=no, resizable=no')"
                href="javascript:void(0)"
                referrerpolicy="strict-origin-when-cross-origin"
                title="پرداخت امن آقای پرداخت"
              >
                <img
                  style="border-radius: 0px; margin-right: 10px"
                  src="https://cdn.aqayepardakht.ir/trustlogo/2.svg"
                  alt="پرداخت امن آقای پرداخت"
              /></a>
            </div>
          </div>

          <!-- <div class="flex gap-3">
            <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div> -->
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold mb-6">دسترسی سریع</h4>
          <ul class="space-y-3">
            <li>
              <a
                href="#about"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                درباره ما
              </a>
            </li>
            <li>
              <a
                href="#services"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                خدمات
              </a>
            </li>
            <li>
              <a
                href="#features"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                مزایا
              </a>
            </li>
            <li>
              <a
                href="#faq"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                سوالات متداول
              </a>
            </li>
            <li>
              <NuxtLink
                to="/auth"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                ورود به پنل
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="text-lg font-bold mb-6">خدمات ما</h4>
          <ul class="space-y-3">
            <li>
              <a
                href="#services"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <div
                  class="w-1.5 h-1.5 bg-secondary rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"
                ></div>
                خدمات حقوقی تخصصی لندتک‌ها
              </a>
            </li>
            <li>
              <a
                href="#services"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <div
                  class="w-1.5 h-1.5 bg-secondary rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"
                ></div>
                وصول مطالبات حقوقی و مذاکره‌ای
              </a>
            </li>
            <li>
              <a
                href="#services"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <div
                  class="w-1.5 h-1.5 bg-secondary rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"
                ></div>
                مشاوره و پشتیبانی حقوقی مستمر
              </a>
            </li>
            <li>
              <a
                href="#services"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
              >
                <div
                  class="w-1.5 h-1.5 bg-secondary rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"
                ></div>
                سامانه‌ها و ابزارهای فناورانه
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-bold mb-6">تماس با ما</h4>
          <ul class="space-y-4">
            <li>
              <a
                href="tel:02192002343"
                class="text-gray-300 hover:text-white transition-colors duration-200 flex items-start gap-3 group"
              >
                <div
                  class="w-10 h-10 bg-white/10 group-hover:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs text-gray-400 mb-1">تلفن تماس</div>
                  <div class="font-medium" dir="ltr">021-92002343</div>
                </div>
              </a>
            </li>
            <li>
              <div class="text-gray-300 flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs text-gray-400 mb-1">سامانه پیام</div>
                  <div class="font-medium" dir="ltr">+989 0008616</div>
                </div>
              </div>
            </li>
            <li>
              <div class="text-gray-300 flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs text-gray-400 mb-1">وب‌سایت</div>
                  <div class="space-y-1">
                    <div class="font-medium">
                      <a
                        href="https://emadiran.ir"
                        target="_blank"
                        class="hover:text-white transition-colors"
                        >emadiran.ir</a
                      >
                    </div>
                    <div class="font-medium">
                      <a
                        href="https://ene.co.ir"
                        target="_blank"
                        class="hover:text-white transition-colors"
                        >ene.co.ir</a
                      >
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="text-gray-300 flex items-start gap-3">
                <div
                  class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs text-gray-400 mb-1">آدرس</div>
                  <div class="font-medium text-sm leading-relaxed">
                    تهران، بلوار آیت الله کاشانی، بین وفاآذر و رامین، پلاک 314،
                    واحد 2
                  </div>
                  <div class="text-xs text-gray-400 mt-1" dir="ltr">
                    کدپستی: 1481856864
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/10">
      <div class="container mx-auto px-4 max-w-[1400px] py-6">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div class="text-gray-400 text-sm text-center md:text-right">
            <p>
              © ۱۴۰۴ شرکت عماد نماد اعتماد | شماره ثبت:
              <span class="text-white font-medium">۶۴۷۴۵</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-6 text-sm">
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-200"
            >
              قوانین و مقررات
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-200"
            >
              حریم خصوصی
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-white transition-colors duration-200"
            >
              شرایط استفاده
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Add BitPay certificate script
useHead({
  script: [
    {
      src: "https://bitpay.ir/certificate-logo-329003",
      defer: true,
    },
  ],
});
</script>
