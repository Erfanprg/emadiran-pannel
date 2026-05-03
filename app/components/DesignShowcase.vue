<template>
  <div class="p-8 bg-gray-50 min-h-screen overflow-hidden">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-2">{{ $t('theme.design_system') }}</h1>
      </div>

      <!-- Color Palette -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Primary & Blue Colors -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.primary_colors') }}</h2>
          <div class="space-y-2">
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-primary rounded"></div>
              <span class="text-sm font-mono text-gray-900">primary - #0f3057</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-secondary rounded"></div>
              <span class="text-sm font-mono text-gray-900">secondary - #008891</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-accent rounded"></div>
              <span class="text-sm font-mono text-gray-900">accent - #00587a</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-dark rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-dark - #0f3057</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-dark-700 rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-dark-700 - #0a2240</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-light rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-light - #008891</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-blue-light-300 rounded"></div>
              <span class="text-sm font-mono text-gray-900">blue-light-300 - #00c8d4</span>
            </div>
          </div>
        </div>

        <!-- Grayscale -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.grayscale') }}</h2>
          <div class="space-y-2">
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-900 rounded border"></div>
              <span class="text-sm font-mono text-gray-900">gray-900 - #111827</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-800 rounded border"></div>
              <span class="text-sm font-mono text-gray-900">gray-800 - #1F2937</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-700 rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray-700 - #374151</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray-600 rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray-600 - #4B5563</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-gray rounded"></div>
              <span class="text-sm font-mono text-gray-900">gray - #6B7280</span>
            </div>
            <div class="flex items-center gap-x-3">
              <div class="w-8 h-8 bg-white border border-gray-300 rounded"></div>
              <span class="text-sm font-mono text-gray-900">white - #FFFFFF</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">دکمه‌ها (Buttons)</h2>
        <div class="space-y-6">
          <!-- Primary Buttons -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Primary Button</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.save')" />
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.continue')" :loading="true" />
              <BaseBtn type="button" typeDesign="primary" :text="$t('global.button.submit')" :disabled="true" />
            </div>
          </div>

          <!-- Outline Buttons -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Outline Button</h3>
            <div class="flex flex-wrap gap-3">
              <BaseBtn type="button" typeDesign="outline" :text="$t('global.button.cancel')" />
              <BaseBtn type="button" typeDesign="outline" :text="$t('global.button.back')" />
            </div>
          </div>

          <!-- Full Width Button -->
          <div>
            <h3 class="text-gray-900 text-sm mb-3 font-medium">Full Width Button</h3>
            <BaseBtn type="submit" typeDesign="full" :text="$t('global.button.login')" />
          </div>
        </div>
      </div>

      <!-- Form Components -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Text Inputs -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">فیلدهای ورودی (Inputs)</h2>
          <div class="space-y-4">
            <FormBaseInput v-model:modelValue="formData.text" type="text" label="نام و نام خانوادگی"
              placeholder="نام خود را وارد کنید" :mandatory="true" />

            <FormBaseInput v-model:modelValue="formData.email" type="mobile" label="شماره تلفن"
              placeholder="example@email.com" />

            <FormBaseInput v-model:modelValue="formData.phone" type="number" label="شماره موبایل"
              placeholder="09123456789" />

            <FormBaseInput v-model:modelValue="formData.password" type="password" label="رمز عبور"
              placeholder="رمز عبور خود را وارد کنید" />

            <FormBaseInput v-model:modelValue="formData.textarea" type="textarea" label="توضیحات"
              placeholder="توضیحات خود را بنویسید..." :row="4" />

            <FormBaseInput v-model:modelValue="formData.error" type="text" label="فیلد با خطا" placeholder="مثال خطا"
              error="این فیلد الزامی است" />
          </div>
        </div>

        <!-- Select, Radio, Checkbox, Switch -->
        <div class="card">
          <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">کنترل‌ها (Controls)</h2>
          <div class="space-y-6">
            <!-- Select Box -->
            <FormBaseSelectBox v-model:model-value="formData.city" :items="cities" typeInput="text" label="شهر"
              placeholder="انتخاب شهر" :mandatory="true" :disabled="false" />

            <!-- Radio Buttons -->
            <FormBaseRadioBtn v-model:model-value="formData.gender" :options="genderOptions" name="gender"
              label="جنسیت" />



            <!-- Switch -->
            <div class="space-y-3">
              <FormBaseSwitch v-model:model-value="formData.notifications" label="دریافت اعلان‌ها" />
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notifications -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-6 w-full text-center">اعلان‌ها (Toast Notifications)</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <BaseBtn 
              type="button" 
              typeDesign="primary" 
              text="نمایش موفقیت"
              @click="showSuccessToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="primary" 
              text="نمایش خطا"
              @click="showErrorToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              text="نمایش هشدار"
              @click="showWarningToast"
            />
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              text="نمایش اطلاعات"
              @click="showInfoToast"
            />
          </div>
          <div class="flex justify-center pt-2">
            <BaseBtn 
              type="button" 
              typeDesign="outline" 
              text="پاک کردن همه"
              @click="clearAllToasts"
            />
          </div>
        </div>
      </div>

      <!-- Border Radius Examples -->
      <div class="card">
        <h2 class="text-2xl font-semibold text-primary mb-4 w-full text-center">{{ $t('theme.border_radius') }}</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary rounded mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">rounded (8px)</span>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-dark rounded-full mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">rounded-full (999px)</span>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-light mx-auto mb-2"></div>
            <span class="text-sm font-mono text-gray-900">no radius (0px)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

// Toast composable
const toast = useToast()

// Toast handlers
const showSuccessToast = () => {
  toast.success('عملیات با موفقیت انجام شد')
}

const showErrorToast = () => {
  toast.error('خطایی رخ داده است. لطفاً دوباره تلاش کنید')
}

const showWarningToast = () => {
  toast.warning('توجه: این عملیات قابل بازگشت نیست')
}

const showInfoToast = () => {
  toast.info('اطلاعات شما به‌روزرسانی شد')
}

const clearAllToasts = () => {
  toast.clearAll()
}

// Form data - reactive state
const formData = reactive({
  text: '',
  email: '',
  phone: '',
  password: '',
  textarea: '',
  error: '',
  city: '',
  gender: 'male',
  option1: 'option1',
  option2: '',
  notifications: true,
  darkMode: false,
  disabled: false,
})
// Select options
const cities = [
  { ID: 1, name: 'تهران' },
  { ID: 2, name: 'اصفهان' },
  { ID: 3, name: 'شیراز' },
  { ID: 4, name: 'مشهد' },
  { ID: 5, name: 'تبریز' },
]

// Radio options
const genderOptions = [
  { label: 'مرد', value: 'male' },
  { label: 'زن', value: 'female' },
]



</script>